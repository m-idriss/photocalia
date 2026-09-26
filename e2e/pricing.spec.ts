import { test, expect } from '@playwright/test';
import { join } from 'node:path';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__PHOTOCALIA_E2E_AUTH__ = true;
    localStorage.setItem(
      'photocalia_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: false,
        preferences: false,
        timestamp: Date.now(),
      }),
    );
  });
  await page.route('**/v1/converter/plans', (route) =>
    route.fulfill({
      json: [
        { plan: 'FREE', limit: 3 },
        { plan: 'PLUS', limit: 15 },
      ],
    }),
  );
  await page.route('**/v1/subscriptions/status?*', (route) =>
    route.fulfill({ json: { planId: 'free', status: 'free' } }),
  );
  await page.route('**/v1/converter/quota-status?*', (route) =>
    route.fulfill({
      json: {
        success: true,
        enabled: true,
        quota: { usageCount: 3, limit: 3, remaining: 0, plan: 'FREE', paidCredits: 0 },
      },
    }),
  );
});

test('public French offer and annual billing are consistent', async ({ page }) => {
  await page.goto('/fr/pricing');
  await expect(page.locator('.plan-card')).toHaveCount(3);
  await expect(page.locator('.plan-card.highlighted')).toContainText('Plus');
  await expect(page.locator('.plan-card.highlighted')).toContainText('15 conversions');
  await expect(page.locator('.plan-card.highlighted')).toContainText('2,99');
  await expect(page.locator('.plan-card').first()).toContainText('0,99 €');
  await expect(page.locator('main')).not.toContainText('Business');
  await page.getByRole('button', { name: /Annuel/ }).click();
  await expect(page.locator('.price-yearly-total')).toContainText('29,99');
  await expect(page.locator('main')).toContainText('16 %');
  await page.screenshot({ path: '/tmp/photocalia-pricing-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/photocalia-pricing-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('quota failure stops a batch and preserves pending files through a credit checkout', async ({
  page,
}) => {
  let conversions = 0;
  await page.route('**/v1/converter', (route) => {
    conversions++;
    return route.fulfill({ status: 429, json: { errorCode: 'QUOTA_EXCEEDED' } });
  });
  await page.route('**/v1/subscriptions/credits', (route) => {
    expect(route.request().postDataJSON()).toEqual({});
    return route.fulfill({
      json: { sessionUrl: 'http://localhost:4200/subscription/success?session_id=cs_test_credit' },
    });
  });
  let confirmations = 0;
  await page.route('**/v1/subscriptions/checkout-status?*', (route) => {
    confirmations++;
    return route.fulfill({ json: { fulfilled: confirmations > 1, kind: 'credit' } });
  });
  await page.goto('/');
  await page
    .locator('input[type="file"]')
    .setInputFiles([
      join(process.cwd(), 'e2e/fixtures/golden/en-calendar.png'),
      join(process.cwd(), 'e2e/fixtures/golden/fr-calendrier-flou.png'),
    ]);
  await page
    .locator('app-converter-upload button')
    .filter({ hasText: /convert/i })
    .click();
  await expect(page.getByRole('button', { name: /View options from/ })).toBeVisible();
  expect(conversions).toBe(1);
  await page.getByRole('button', { name: /View options from/ }).click();
  await page.getByRole('button', { name: /Buy one conversion/ }).click();
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible();
  await expect(page.locator('main')).toContainText('Your conversion credit is available');
  await page.locator('.success-actions a.btn-primary').click();
  await expect(page.locator('app-converter-upload')).toContainText('en-calendar.png');
  await expect(page.locator('app-converter-upload')).toContainText('fr-calendrier-flou.png');
  expect(conversions).toBe(1);
});

test('a partially converted batch retains its first results after buying a credit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 1000 });
  let conversions = 0;
  const calendar = (title: string) =>
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Test//EN',
      'BEGIN:VEVENT',
      `UID:${title}@test`,
      'DTSTAMP:20260926T100000Z',
      'DTSTART:20261001T100000Z',
      'DTEND:20261001T110000Z',
      `SUMMARY:${title}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  await page.route('**/v1/converter', (route) => {
    conversions++;
    if (conversions === 2)
      return route.fulfill({ status: 429, json: { errorCode: 'QUOTA_EXCEEDED' } });
    return route.fulfill({
      json: {
        success: true,
        icsContent: calendar(conversions === 1 ? 'First meeting' : 'Second meeting'),
      },
    });
  });
  await page.route('**/v1/subscriptions/credits', (route) =>
    route.fulfill({
      json: {
        sessionUrl: 'http://localhost:4200/subscription/success?session_id=cs_partial',
      },
    }),
  );
  await page.route('**/v1/subscriptions/checkout-status?*', (route) =>
    route.fulfill({ json: { fulfilled: true, kind: 'credit' } }),
  );
  await page.goto('/');
  await page
    .locator('input[type="file"]')
    .setInputFiles([
      join(process.cwd(), 'e2e/fixtures/golden/en-calendar.png'),
      join(process.cwd(), 'e2e/fixtures/golden/fr-calendrier-flou.png'),
    ]);
  await page
    .locator('app-converter-upload button')
    .filter({ hasText: /convert/i })
    .click();
  await expect(page.locator('app-converter-event-review')).toContainText('First meeting');
  await page.getByRole('button', { name: /View options from/ }).click();
  await page.getByRole('button', { name: /Buy one conversion/ }).click();
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible();
  await page.locator('.success-actions a.btn-primary').click();
  await expect(page.locator('app-converter-upload')).toContainText('fr-calendrier-flou.png');
  await page
    .locator('app-converter-upload button')
    .filter({ hasText: /convert/i })
    .click();
  await expect(page.locator('app-converter-event-review')).toContainText('First meeting');
  await expect(page.locator('app-converter-event-review')).toContainText('Second meeting');
  expect(conversions).toBe(3);
});
