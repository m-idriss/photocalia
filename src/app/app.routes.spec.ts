import type { Route } from '@angular/router';
import { routes } from './app.routes';

describe('page route titles', () => {
  const staticPageRoutes = routes.filter(
    (route): route is Route & { title: string } =>
      typeof route.title === 'string' && route.data?.['seo'] !== undefined,
  );

  it('uses the same title for the router and SEO metadata', () => {
    for (const route of staticPageRoutes) {
      expect(route.data?.['seo'].title)
        .withContext(route.path ?? '')
        .toBe(route.title);
    }
  });

  it('uses a consistent PhotoCalia separator', () => {
    for (const route of staticPageRoutes) {
      const occurrences = route.title.split(' | ').length - 1;
      expect(occurrences)
        .withContext(route.path ?? '')
        .toBe(1);

      if (route.path === '') {
        expect(route.title.startsWith('PhotoCalia | ')).withContext(route.path).toBeTrue();
      } else {
        expect(route.title.endsWith(' | PhotoCalia'))
          .withContext(route.path ?? '')
          .toBeTrue();
      }
    }
  });
});
