import { homePageTitle, pageTitle } from './page-title.utils';

describe('page title utilities', () => {
  it('appends the site name to page titles', () => {
    expect(pageTitle('Pricing')).toBe('Pricing | PhotoCalia');
  });

  it('places the site name first on the home page', () => {
    expect(homePageTitle('AI calendar converter')).toBe('PhotoCalia | AI calendar converter');
  });
});
