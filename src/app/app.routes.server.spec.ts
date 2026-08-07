import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  const pillarPaths = [
    'add-event-to-calendar-from-photo',
    'photo-to-calendar',
    'image-to-google-calendar',
    'pdf-to-calendar',
    'ocr-calendar-extraction',
  ];

  it('prerenders every English and French commercial pillar page', () => {
    for (const path of pillarPaths) {
      for (const localizedPath of [path, `fr/${path}`]) {
        expect(serverRoutes.find((route) => route.path === localizedPath)?.renderMode)
          .withContext(localizedPath)
          .toBe(RenderMode.Prerender);
      }
    }
  });

  it('client-renders payment return pages that depend on query parameters', () => {
    for (const path of [
      'subscription/success',
      'donation/success',
      'fr/subscription/success',
      'fr/donation/success',
    ]) {
      expect(serverRoutes.find((route) => route.path === path)?.renderMode)
        .withContext(path)
        .toBe(RenderMode.Client);
    }
  });
});
