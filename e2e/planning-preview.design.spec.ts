import { expect, test } from '@playwright/test';

// Synthetic homepage preview only. No sign-in, upload, payment or remote request.
for (const route of ['/', '/fr']) {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 768, 1440]) {
      test(`planning preview small text meets contrast on ${route} in ${theme} theme at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.route('**/*', (request) => {
          const url = new URL(request.request().url());
          if (url.origin !== 'http://localhost:4200') return request.abort();
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
        await page.evaluate((mode) => document.body.classList.add(`${mode}-theme`), theme);
        const preview = page.locator('app-planning-preview');
        await expect(preview).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const results = await preview.evaluate((root) => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Color normalization is unavailable.');
          const pixel = (colors: string[]) => {
            context.clearRect(0, 0, 1, 1);
            for (const color of colors) {
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
            }
            return Array.from(context.getImageData(0, 0, 1, 1).data);
          };
          const luminance = (channels: number[]) => {
            if (channels[3] !== 255)
              throw new Error('Contrast requires an opaque composited color.');
            const linear = channels.slice(0, 3).map((value) => {
              const channel = value / 255;
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            });
            return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
          };
          return [
            ...root.querySelectorAll(
              '.pc-event, .pc-event span, .pc-cal-head small, .pc-converted span',
            ),
          ]
            .filter((element) => element.getBoundingClientRect().width > 0)
            .map((element) => {
              const foreground = getComputedStyle(element).color;
              let parent: Element | null = element;
              const backgrounds: string[] = [];
              while (parent) {
                const style = getComputedStyle(parent);
                if (style.backgroundImage !== 'none')
                  throw new Error('Gradient contrast needs a separate measurement.');
                if (!['rgba(0, 0, 0, 0)', 'transparent'].includes(style.backgroundColor)) {
                  backgrounds.unshift(style.backgroundColor);
                  if (pixel([style.backgroundColor])[3] === 255) break;
                }
                parent = parent.parentElement;
              }
              const a = luminance(pixel([foreground])),
                b = luminance(pixel(backgrounds));
              return {
                selector: element.className || element.tagName,
                ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
              };
            });
        });
        expect(results.length).toBeGreaterThanOrEqual(9);
        for (const result of results)
          expect(result.ratio, JSON.stringify(result)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}
