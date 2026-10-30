import { expect, test } from '@playwright/test';

// Public presentation only: no login, conversion, payment or remote request.
for (const route of ['/', '/fr']) {
  for (const width of [390, 1440]) {
    test(`visible homepage labels remain in accessible names on ${route} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.route('**/*', (request) => {
        if (new URL(request.request().url()).origin !== 'http://localhost:4200')
          return request.abort();
        return request.continue();
      });
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'onLine', { get: () => true });
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
      await page.goto(route);
      const release = page.locator('.version-link');
      await expect(release).toHaveAccessibleName((await release.innerText()).trim());
      if (width === 1440) {
        for (const code of ['en', 'fr']) {
          const language = page.locator(`.header-actions a[hreflang="${code}"]`);
          await expect(language).toBeVisible();
          await expect(language).toHaveAccessibleName(new RegExp(`^${code.toUpperCase()}\\b`));
        }
        const signIn = page.locator('.sign-in-button');
        await expect(signIn).toBeVisible();
        await expect(signIn).toHaveAccessibleName((await signIn.innerText()).trim());
      } else {
        await page.locator('.burger-button').click();
        const menu = page.locator('#photocalia-menu');
        await expect(menu).toBeVisible();
        for (const code of ['en', 'fr']) {
          const language = menu.locator(`a[hreflang="${code}"]`);
          await expect(language).toHaveAccessibleName((await language.innerText()).trim());
        }
      }
    });
  }
}
