import { homePageTitle, localizedPageTitle, pageTitle } from './page-title.utils';

describe('page title utilities', () => {
  it('appends the site name to page titles', () => {
    expect(pageTitle('Pricing')).toBe('Pricing | PhotoCalia');
  });

  it('places the site name first on the home page', () => {
    expect(homePageTitle('AI calendar converter')).toBe('PhotoCalia | AI calendar converter');
  });

  it('selects the French title for a French route', () => {
    const resolver = localizedPageTitle('English title', 'Titre français');

    expect(resolver({} as never, { url: '/fr/photo-to-calendar' } as never)).toBe('Titre français');
    expect(resolver({} as never, { url: '/photo-to-calendar' } as never)).toBe('English title');
  });
});
