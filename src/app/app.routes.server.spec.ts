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
});
