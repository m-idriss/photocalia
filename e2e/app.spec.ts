import { test, expect } from '@playwright/test';
import ICAL from 'ical.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

interface GoldenEvent {
  title: string;
  start: string;
  end?: string;
  location: string;
  allDay: boolean;
}

interface GoldenCase {
  id: string;
  source: string;
  language: string;
  timeZone: string;
  expected: GoldenEvent[];
}

const goldenManifest = JSON.parse(
  readFileSync(join(process.cwd(), 'e2e', 'fixtures', 'golden', 'expected.json'), 'utf8'),
) as { cases: GoldenCase[] };

test.describe('PhotoCalia App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PhotoCalia/);
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should display the converter upload area', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-converter')).toBeVisible();
  });

  test('should display the footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-footer')).toBeVisible();
  });

  test('should navigate to how-it-works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page).toHaveTitle(/How It Works/);
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/);
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/Terms/);
  });

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveTitle(/PhotoCalia/);
  });
});

test.describe('Converter', () => {
  test('should require sign-in before uploading a file', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /AI Calendar Converter/i })).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test('should explain the free allowance before sign-in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-subtitle')).toContainText(/3 free conversions per month/i);
  });

  test('uploads, reviews, edits and downloads a valid ICS without production credentials', async ({
    page,
  }) => {
    const goldenCase = goldenManifest.cases.find(({ id }) => id === 'en-timed-and-all-day');
    expect(goldenCase, 'golden case must exist').toBeDefined();

    await page.setViewportSize({ width: 900, height: 1000 });
    await page.addInitScript(() => {
      window.__PHOTOCALIA_E2E_AUTH__ = true;
    });

    await page.route('**/v1/converter/plans', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { plan: 'free', limit: 3 },
          { plan: 'pro', limit: 100 },
          { plan: 'business', limit: 120 },
        ]),
      });
    });
    await page.route('**/v1/converter/quota-status?*', async (route) => {
      expect(route.request().headers()['x-installation-id']).toMatch(/^[A-Za-z0-9_-]{20,128}$/);
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          enabled: true,
          quota: { usageCount: 0, limit: 3, remaining: 3, plan: 'FREE' },
        }),
      });
    });
    await page.route('**/v1/converter', async (route) => {
      const request = route.request().postDataJSON() as { timeZone?: string; files?: unknown[] };
      expect(route.request().headers()['x-installation-id']).toMatch(/^[A-Za-z0-9_-]{20,128}$/);
      expect(request.timeZone).toBe(goldenCase!.timeZone);
      expect(request.files).toHaveLength(1);
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          icsContent: [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//PhotoCalia Golden Fixture//EN',
            'BEGIN:VEVENT',
            'UID:golden-timed@photocalia.com',
            'DTSTART:20260807T080000Z',
            'DTEND:20260807T093000Z',
            'SUMMARY:Product workshop',
            'LOCATION:Studio Atlas\\, Paris',
            'END:VEVENT',
            'BEGIN:VEVENT',
            'UID:golden-all-day@photocalia.com',
            'DTSTART;VALUE=DATE:20260815',
            'DTEND;VALUE=DATE:20260816',
            'SUMMARY:Summer closure',
            'END:VEVENT',
            'END:VCALENDAR',
          ].join('\r\n'),
        }),
      });
    });

    await page.goto('/');
    await page
      .locator('input[type="file"]')
      .setInputFiles(join(process.cwd(), 'e2e', 'fixtures', 'golden', goldenCase!.source));
    await page.getByRole('button', { name: 'Convert files to calendar events' }).click();

    await expect(page.getByText('Product workshop', { exact: true })).toBeVisible();
    await expect(page.getByText('Summer closure', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Product workshop/ }).click();
    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await page.getByLabel('Event Title').fill('Product workshop — reviewed');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByRole('checkbox').check();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download calendar file' }).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).not.toBeNull();

    const downloaded = await import('node:fs/promises').then(({ readFile }) =>
      readFile(path!, 'utf8'),
    );
    expect(() => ICAL.parse(downloaded)).not.toThrow();
    expect(downloaded).toContain('SUMMARY:Product workshop — reviewed');

    const calendar = new ICAL.Component(ICAL.parse(downloaded));
    const actualEvents = calendar
      .getAllSubcomponents('vevent')
      .map((component) => new ICAL.Event(component));
    expect(actualEvents).toHaveLength(goldenCase!.expected.length);

    goldenCase!.expected.forEach((expectedEvent, index) => {
      const actualEvent = actualEvents[index];
      const expectedTitle = index === 0 ? `${expectedEvent.title} — reviewed` : expectedEvent.title;
      expect(actualEvent.summary, `${goldenCase!.id}.expected[${index}].title`).toBe(expectedTitle);
      expect(actualEvent.location || '', `${goldenCase!.id}.expected[${index}].location`).toBe(
        expectedEvent.location,
      );
      expect(actualEvent.startDate.isDate, `${goldenCase!.id}.expected[${index}].allDay`).toBe(
        expectedEvent.allDay,
      );

      const actualStart = expectedEvent.allDay
        ? actualEvent.startDate.toString().slice(0, 10)
        : actualEvent.startDate.toJSDate().toISOString();
      const expectedStart = expectedEvent.allDay
        ? expectedEvent.start
        : new Date(expectedEvent.start).toISOString();
      expect(actualStart, `${goldenCase!.id}.expected[${index}].start`).toBe(expectedStart);

      if (expectedEvent.end) {
        const actualEnd = expectedEvent.allDay
          ? actualEvent.endDate.toString().slice(0, 10)
          : actualEvent.endDate.toJSDate().toISOString();
        const expectedEnd = expectedEvent.allDay
          ? expectedEvent.end
          : new Date(expectedEvent.end).toISOString();
        expect(actualEnd, `${goldenCase!.id}.expected[${index}].end`).toBe(expectedEnd);
      }
    });
  });
});
