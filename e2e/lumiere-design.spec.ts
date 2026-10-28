import { expect, test } from '@playwright/test';

// Local presentation and navigation checks; no sign-in or production API calls.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
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
  await page.route('**/v1/**', (route) => route.fulfill({ json: {} }));
});

test('French hero preserves language and reaches the real converter', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/fr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('S’ORGANISE.');
  await expect(page.locator('.pc-sheet')).toContainText('Mon planning');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 18px Caveat'))).toBe(true);
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-lumiere-desktop.png'),
  });
  await page.getByRole('link', { name: 'Importer mon planning' }).click();
  await expect(page).toHaveURL(/\/fr#converter$/);
  await expect(page.locator('app-converter .auth-action')).toBeInViewport();
  await expect(page.locator('#converter')).toHaveCount(1);
});

test('desktop menu supports keyboard dismissal, focus return and real routes', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/fr');
  const toggle = page.locator('.burger-button');
  await toggle.click();
  const menu = page.locator('#photocalia-menu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('.menu-close')).toBeFocused();
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-lumiere-menu.png'),
  });
  await page.keyboard.press('Shift+Tab');
  await expect(menu.locator('.menu-feature a')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await menu.getByRole('link', { name: 'Tarifs', exact: true }).click();
  await expect(page).toHaveURL(/\/fr\/pricing$/);
  await expect(menu).toHaveCount(0);
});

test('mobile menu keeps navigation and language accessible without overflow', async ({
  page,
}, testInfo) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/fr');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll('main *, footer *')]
        .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 8)
        .map((element) => element.className),
    }));
    expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
    await page.locator('.burger-button').click();
    const menu = page.locator('#photocalia-menu');
    await expect(menu).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (width === 390)
      await page.screenshot({
        animations: 'disabled',
        path: testInfo.outputPath('photocalia-lumiere-mobile-menu.png'),
      });
    await menu.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(menu).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ONE PHOTO.');
    if (width === 390)
      await page.screenshot({
        animations: 'disabled',
        path: testInfo.outputPath('photocalia-lumiere-mobile.png'),
      });
  }
});

test('floating navigation, luminous FAQ and light footer match the scrolled layout', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/fr');
  const faq = page.locator('.faq-section');
  await faq.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await expect(faq).toHaveClass(/scroll-reveal--visible/);
  await expect(page.locator('.app-header')).toHaveClass(/is-scrolled/);
  await expect(page.locator('.app-header')).toHaveCSS('border-radius', '999px');
  const first = faq.locator('details').first();
  await expect(first).toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-faq-floating.png'),
  });
  await page.locator('.burger-button').click();
  await expect(page.locator('#photocalia-menu')).toBeVisible();
  const panel = await page.locator('#photocalia-menu').boundingBox();
  expect(panel!.x).toBeGreaterThan(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(1440);
  await page.keyboard.press('Escape');
  await page.locator('.global-footer').scrollIntoViewIfNeeded();
  await expect(
    page.locator('.global-footer').getByRole('button', { name: 'Préférences de cookies' }),
  ).toBeVisible();
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-light-footer.png'),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await faq.locator('h2').scrollIntoViewIfNeeded();
  await expect(faq.locator('summary').first()).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-faq-mobile.png'),
  });
});

test('pricing keeps its real offers inside luminous cards and accessible accordions', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/fr/pricing');
  await expect(page.locator('.plan-card')).toHaveCount(3);
  await expect(page.locator('.plan-card.highlighted .popular-badge')).toBeVisible();
  await expect(page.locator('.plan-card.highlighted')).toContainText('2,99');
  await page.getByRole('button', { name: /Annuel/ }).click();
  await expect(page.locator('.price-yearly-total')).toContainText('29,99');
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-luminous-pricing.png'),
  });
  const first = page.locator('.pricing-faq details').first();
  await first.locator('summary').click();
  await expect(first).not.toHaveAttribute('open', '');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.pricing-title').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-luminous-pricing-mobile.png'),
  });
});

test('how-it-works FAQ uses the same keyboard-accessible cards on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/fr/how-it-works');
  const questions = page.locator('.faq-container details');
  await expect(questions).toHaveCount(6);
  await questions.nth(1).locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(questions.nth(1)).toHaveAttribute('open', '');
  await expect(questions.nth(1).locator('.faq-answer')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('signed-out converter has a pricing-style header and a clear Google sign-in action', async ({
  page,
}, testInfo) => {
  await page.goto('/fr');
  const converter = page.locator('app-converter');
  await expect(
    converter.getByRole('heading', { name: 'Votre planning commence ici.' }),
  ).toBeVisible();
  await expect(converter.locator('.auth-ribbon')).toContainText('Votre espace de conversion');
  await expect(converter.locator('.auth-steps li')).toHaveCount(3);
  await expect(converter.getByRole('button', { name: 'Se connecter avec Google' })).toBeVisible();
  await expect(converter.locator('input[type=file]')).toHaveCount(0);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await converter.locator('.auth-action').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await converter.locator('#converter').screenshot({
      animations: 'disabled',
      path: testInfo.outputPath(`photocalia-converter-welcome-${width}.png`),
    });
  }
});

test('mobile Get started leaves the converter ribbon below the floating header', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/fr');
  await page.locator('app-header .start-button').click();
  await expect(page).toHaveURL(/\/fr#converter$/);
  await expect
    .poll(async () => {
      const ribbon = await page.locator('.auth-ribbon').boundingBox();
      const header = await page.locator('.app-header').boundingBox();
      return ribbon && header ? ribbon.y - header.y - header.height : -1;
    })
    .toBeGreaterThanOrEqual(12);
  await expect
    .poll(async () => Math.abs(((await page.locator('.auth-ribbon').boundingBox())?.y ?? -1) - 97))
    .toBeLessThan(3);
  await expect(page.locator('.auth-ribbon')).toBeInViewport();
  await expect(page.locator('.auth-action')).toBeInViewport();
  await page.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-mobile-converter-anchor.png'),
  });
});

test('connected converter preview renders its real upload controls on desktop and mobile', async ({
  page,
}, testInfo) => {
  // This verifies presentation with a test identity; it does not validate Google OAuth.
  await page.addInitScript(() => {
    window.__PHOTOCALIA_E2E_AUTH__ = true;
  });
  await page.route('**/v1/converter/plans', (route) =>
    route.fulfill({
      json: [
        { plan: 'FREE', limit: 3 },
        { plan: 'PLUS', limit: 15 },
      ],
    }),
  );
  await page.route('**/v1/converter/quota-status?*', (route) =>
    route.fulfill({
      json: {
        success: true,
        enabled: true,
        quota: { usageCount: 0, limit: 3, remaining: 3, plan: 'FREE', paidCredits: 0 },
      },
    }),
  );
  await page.goto('/fr#converter');
  await expect(page.locator('app-converter input[type="file"]')).toHaveCount(1);
  await expect(page.locator('.auth-required')).toHaveCount(0);
  await expect(page.locator('app-converter-upload')).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('app-converter-upload').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator('app-converter').screenshot({
      animations: 'disabled',
      path: testInfo.outputPath(`photocalia-connected-converter-${width}.png`),
    });
  }
});
