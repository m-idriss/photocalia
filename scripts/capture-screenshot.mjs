import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { chromium, devices } from '@playwright/test';

const url = process.env['SCREENSHOT_URL'] ?? 'http://127.0.0.1:4200';
const outputPath = resolve(process.argv[2] ?? 'screenshots/iPhone_13_Pro_Max.jpeg');

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    ...devices['iPhone 13 Pro Max'],
    locale: 'en-GB',
    reducedMotion: 'reduce',
    timezoneId: 'Europe/Paris',
  });

  await context.addInitScript(() => {
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

  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });
  await page.locator('app-footer').waitFor({ state: 'visible', timeout: 120_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.getAnimations().forEach((animation) => animation.finish());
  });
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90,
  });
  await context.close();
} finally {
  await browser.close();
}

console.log(`Screenshot saved to ${outputPath}`);
