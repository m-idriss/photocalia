import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import ICAL from 'ical.js';
import { FILE_UPLOAD_CONSTRAINTS } from '../src/app/constants/app.constants';
import { test, expect, goldenCases, requestDecision, type GoldenCase } from './helpers/qa-fixture';

async function roundTrip(page: Page, fixture: GoldenCase, edit: boolean) {
  await page.goto('/');
  await page
    .locator('input[type="file"]')
    .setInputFiles(join(process.cwd(), 'e2e/fixtures/golden', fixture.source));
  await page.getByRole('button', { name: 'Convert files to calendar events' }).click();
  for (const event of fixture.expected)
    await expect(page.getByText(event.title, { exact: true })).toBeVisible();
  if (edit) {
    await page.getByRole('button', { name: new RegExp(fixture.expected[0].title) }).click();
    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await page.getByLabel('Event Title').fill(fixture.expected[0].title + ' reviewed');
    await page.getByRole('button', { name: 'Save changes' }).click();
  }
  await page.getByRole('checkbox').check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download calendar file' }).click();
  const path = await (await download).path();
  expect(path).not.toBeNull();
  const events = new ICAL.Component(ICAL.parse(await readFile(path!, 'utf8')))
    .getAllSubcomponents('vevent')
    .map((component) => new ICAL.Event(component));
  expect(events).toHaveLength(fixture.expected.length);
  for (const [i, expected] of fixture.expected.entries()) {
    expect(events[i].summary).toBe(expected.title + (edit && i === 0 ? ' reviewed' : ''));
    expect(events[i].location || '').toBe(expected.location);
    expect(events[i].startDate.isDate).toBe(expected.allDay);
    expect(
      expected.allDay
        ? events[i].startDate.toString().slice(0, 10)
        : events[i].startDate.toJSDate().toISOString(),
    ).toBe(expected.allDay ? expected.start : new Date(expected.start).toISOString());
    if (expected.end)
      expect(
        expected.allDay
          ? events[i].endDate.toString().slice(0, 10)
          : events[i].endDate.toJSDate().toISOString(),
      ).toBe(expected.allDay ? expected.end : new Date(expected.end).toISOString());
  }
}

test.describe('Synthetic core journeys', () => {
  test.describe('Signed-out gate', () => {
    test.use({ syntheticUser: false });
    test('requires sign-in before upload without contacting a real provider', async ({
      page,
      qa,
    }) => {
      await page.goto('/');
      await expect(page.locator('app-converter .auth-action')).toBeVisible();
      await expect(page.locator('input[type="file"]')).toHaveCount(0);
      expect(qa.conversions).toBe(0);
    });
  });
  for (const fixture of goldenCases) {
    test(`round-trips synthetic calendar ${fixture.id}`, async ({ page, qa }) => {
      qa.goldenCase = fixture;
      qa.maxConversions = 1;
      await page.setViewportSize({ width: 900, height: 1000 });
      await roundTrip(page, fixture, fixture.id === 'en-timed-and-all-day');
      expect(qa.conversions).toBe(1);
    });
  }
  test('keeps the core upload and download flow reachable at 390 px', async ({ page, qa }) => {
    qa.maxConversions = 1;
    await page.setViewportSize({ width: 390, height: 844 });
    await roundTrip(page, goldenCases[0], false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(qa.conversions).toBe(1);
  });
  test('rejects unsupported input without a conversion request', async ({ page, qa }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'synthetic.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Synthetic invalid input'),
    });
    await expect(page.locator('ngb-toast.bg-danger')).toContainText('Invalid file type');
    await expect(page.getByRole('list', { name: 'Selected files' })).toHaveCount(0);
    expect(qa.conversions).toBe(0);
  });
  test('rejects oversized input using the existing upload limit', async ({ page, qa }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'synthetic-oversized.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE + 1),
    });
    await expect(page.locator('ngb-toast.bg-danger')).toContainText('File too large');
    await expect(page.getByRole('list', { name: 'Selected files' })).toHaveCount(0);
    expect(qa.conversions).toBe(0);
  });
  test('preserves pending input after 503 and recovers only on an explicit retry', async ({
    page,
    qa,
  }) => {
    qa.mode = 'unavailable';
    qa.maxConversions = 1;
    await page.goto('/');
    await page
      .locator('input[type="file"]')
      .setInputFiles(join(process.cwd(), 'e2e/fixtures/golden/en-calendar.png'));
    await page.getByRole('button', { name: 'Convert files to calendar events' }).click();
    await expect(page.locator('ngb-toast.bg-danger')).toContainText('temporarily unavailable');
    await expect(page.getByRole('list', { name: 'Selected files' })).toContainText(
      'en-calendar.png',
    );
    expect(qa.conversions).toBe(1);
    qa.mode = 'success';
    qa.maxConversions = 2;
    await page.getByRole('button', { name: 'Convert files to calendar events' }).click();
    await expect(page.getByText('Product workshop', { exact: true })).toBeVisible();
    expect(qa.conversions).toBe(2);
  });
  test('stops a quota-exhausted batch without checkout or extra conversion', async ({
    page,
    qa,
  }) => {
    qa.mode = 'quota';
    qa.maxConversions = 1;
    await page.goto('/');
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        ['en-calendar.png', 'fr-calendrier-flou.png'].map((file) =>
          join(process.cwd(), 'e2e/fixtures/golden', file),
        ),
      );
    await page.getByRole('button', { name: 'Convert files to calendar events' }).click();
    await expect(page.locator('app-converter .alert-warning')).toContainText('quota is exhausted');
    await expect(page.getByRole('list', { name: 'Selected files' })).toContainText(
      'en-calendar.png',
    );
    await expect(page.getByRole('list', { name: 'Selected files' })).toContainText(
      'fr-calendrier-flou.png',
    );
    expect(qa.conversions).toBe(1);
  });
  test('blocks service probes, popup navigation and WebSockets without contacting real hosts', async ({
    page,
    context,
    qa,
  }) => {
    for (const url of [
      'https://api.photocalia.com/v1/converter',
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
      'https://checkout.stripe.com/qa',
      qa.localOrigin + '/api/unmocked',
    ]) {
      expect(requestDecision(url, 'POST', qa.localOrigin)).toBe('blocked');
    }
    const origins = [
      'https://qa-production.invalid',
      'https://qa-auth.invalid',
      'https://qa-payment.invalid',
    ];
    origins.forEach((origin) => qa.expectedProbeOrigins.add(origin));
    qa.expectedProbeOrigins.add('wss://qa-auth.invalid');
    // An isolated blank document has no app CSP that could conceal a guard failure.
    await page.goto('about:blank');
    for (const origin of origins) {
      const rejected = await page.evaluate(async (url) => {
        try {
          await fetch(url);
          return false;
        } catch {
          return true;
        }
      }, origin + '/synthetic-probe');
      expect(rejected).toBe(true);
    }
    const popupPromise = context.waitForEvent('page');
    await page.evaluate(() => {
      window.open('https://qa-auth.invalid/popup');
    });
    const popup = await popupPromise;
    await expect
      .poll(() => qa.blockedProbes.filter((origin) => origin === 'https://qa-auth.invalid').length)
      .toBe(2);
    await popup.close();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const socket = new WebSocket('wss://qa-auth.invalid');
          socket.onclose = () => resolve();
          socket.onerror = () => resolve();
        }),
    );
    await expect.poll(() => qa.blockedProbes.length).toBe(5);
    expect(qa.violations).toEqual([]);
  });
});
