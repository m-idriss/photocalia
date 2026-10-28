import { expect, test } from '@playwright/test';

const previewUrl = process.env['PHOTOCALIA_PREVIEW_URL'];
test.skip(!previewUrl, 'Run explicitly against the local Firebase emulator preview.');

test('local demo sign-in and sign-out work without production authentication or APIs', async ({
  page,
}, testInfo) => {
  const liveRequests: string[] = [];
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    console.log('Preview request failed:', url.origin + url.pathname, request.failure()?.errorText);
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      url.hostname === 'googleapis.com' ||
      url.hostname.endsWith('.googleapis.com') ||
      url.hostname === 'firebaseapp.com' ||
      url.hostname.endsWith('.firebaseapp.com') ||
      url.hostname === 'api.photocalia.com'
    )
      liveRequests.push(url.hostname);
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      'photocalia_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: false,
        preferences: false,
        timestamp: Date.now(),
      }),
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${previewUrl}/fr#converter`);
  await expect(page.locator('.preview-mode-notice')).toContainText('Mode test local');
  await expect(page.locator('.auth-note')).toContainText('Compte fictif local');
  await page.getByRole('button', { name: 'Essayer la connexion de test' }).click();
  await expect(page.locator('.auth-required')).toHaveCount(0);
  await expect(page.locator('app-converter input[type=file]')).toHaveCount(1);
  await expect(page.locator('app-converter-upload')).toBeVisible();
  await page
    .locator('app-converter input[type=file]')
    .setInputFiles('e2e/fixtures/golden/en-calendar.png');
  await expect(page.locator('app-converter-upload .action-button')).toBeVisible();
  await page.mouse.move(0, 0);
  await page.locator('app-converter').screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-convert-action.png'),
  });
  await expect(page.locator('.start-button')).toHaveCount(0);
  await page.locator('app-converter').screenshot({
    animations: 'disabled',
    path: testInfo.outputPath('photocalia-isolated-test-connected.png'),
  });
  await page.locator('.burger-button').click();
  await expect(page.locator('.user-info')).toContainText('test@photocalia.invalid');
  await expect(
    page.locator('#photocalia-menu').getByRole('link', { name: 'Commencer', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Essayer la connexion de test' })).toBeVisible();
  await expect(page.locator('.start-button')).toBeVisible();
  expect(liveRequests).toEqual([]);
});

test('refresh restores the connected converter after the persisted session is ready', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'photocalia_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: false,
        preferences: false,
        timestamp: Date.now(),
      }),
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${previewUrl}/fr#converter`);
  await page.getByRole('button', { name: 'Essayer la connexion de test' }).click();
  await expect(page.locator('app-converter input[type=file]')).toHaveCount(1);
  for (const fragment of ['#converter', '']) {
    await page.goto(`${previewUrl}/fr${fragment}`);
    await expect(page.locator('app-converter input[type=file]')).toHaveCount(1);
    await page.reload();
    await expect(page.locator('app-converter input[type=file]')).toHaveCount(1);
    await expect
      .poll(async () =>
        Math.abs(((await page.locator('#converter').boundingBox())?.y ?? -1000) - 96),
      )
      .toBeLessThan(4);
  }
});

test('mobile menu keeps destinations, account and language controls readable on touch screens', async ({
  browser,
}, testInfo) => {
  for (const width of [320, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.addInitScript(() =>
      localStorage.setItem(
        'photocalia_cookie_consent',
        JSON.stringify({
          essential: true,
          analytics: false,
          preferences: false,
          timestamp: Date.now(),
        }),
      ),
    );
    await page.goto(`${previewUrl}/fr#converter`);
    await page.getByRole('button', { name: 'Essayer la connexion de test' }).click();
    await expect(page.locator('.auth-required')).toHaveCount(0);
    await page.locator('.burger-button').click();
    const menu = page.locator('#photocalia-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('.user-info')).toContainText('test@photocalia.invalid');
    const converterLink = menu.getByRole('link', { name: 'Convertir un planning', exact: true });
    expect((await converterLink.boundingBox())!.height).toBeLessThan(60);
    await expect(menu.getByRole('link', { name: 'Français', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const control of [
      converterLink,
      menu.getByRole('link', { name: 'Français', exact: true }),
      menu.getByRole('button', { name: 'Déconnexion', exact: true }),
    ]) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({
      animations: 'disabled',
      path: testInfo.outputPath(`photocalia-mobile-menu-${width}.png`),
    });
    await menu.getByRole('link', { name: 'PDF vers calendrier', exact: true }).click();
    await expect(page).toHaveURL(/\/fr\/pdf-to-calendar$/);
    await expect(menu).toHaveCount(0);
    await context.close();
  }
});
