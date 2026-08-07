import { legacyLanguageRedirectUrl } from './legacy-language-redirect';

describe('legacyLanguageRedirectUrl', () => {
  it('moves the legacy French homepage URL to /fr without the language query', () => {
    const redirect = legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=fr');

    expect(redirect?.toString()).toBe('https://www.photocalia.com/fr');
  });

  it('preserves unrelated tracking parameters', () => {
    const redirect = legacyLanguageRedirectUrl(
      'https://www.photocalia.com/?lang=fr&utm_source=legacy',
    );

    expect(redirect?.toString()).toBe('https://www.photocalia.com/fr?utm_source=legacy');
  });

  it('ignores non-French and non-home URLs', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=en')).toBeNull();
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/blog?lang=fr')).toBeNull();
  });
});
