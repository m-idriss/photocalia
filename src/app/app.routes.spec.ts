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

  it('uses a consistent Photocalia separator', () => {
    for (const route of staticPageRoutes) {
      const occurrences = route.title.split(' | ').length - 1;
      expect(occurrences)
        .withContext(route.path ?? '')
        .toBe(1);

      if (route.path === '') {
        expect(route.title.startsWith('Photocalia | ')).withContext(route.path).toBeTrue();
      } else {
        expect(route.title.endsWith(' | Photocalia'))
          .withContext(route.path ?? '')
          .toBeTrue();
      }
    }
  });

  it('keeps the internal search page out of the Google index', () => {
    const searchRoute = routes.find((route) => route.path === 'search');

    expect(searchRoute?.data?.['seo'].robots).toBe('noindex, follow');
  });

  it('provides localized metadata for the French blog landing page', () => {
    const blogRoute = routes.find((route) => route.path === 'blog');

    expect(blogRoute?.data?.['seo'].localized.fr.title).toBe(
      'Guides photo vers calendrier et OCR | PhotoCalia',
    );
    expect(blogRoute?.data?.['seo'].localized.fr.description).toContain('Guides pratiques');
  });
});
