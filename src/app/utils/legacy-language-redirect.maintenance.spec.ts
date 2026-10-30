import { legacyLanguageRedirectUrl } from './legacy-language-redirect';

describe('legacy redirect URL boundaries', () => {
  it('preserves a fragment when migrating the legacy homepage', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=fr#intro')?.toString()).toBe('https://www.photocalia.com/fr#intro');
  });
  it('preserves encoded tracking values without adding parameters', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=fr&source=a%26b')?.toString()).toBe('https://www.photocalia.com/fr?source=a%26b');
  });
  it('removes duplicate language parameters after a matching first value', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=fr&lang=en')?.toString()).toBe('https://www.photocalia.com/fr');
  });
  it('ignores language-like text in another parameter', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?next=lang%3Dfr')).toBeNull();
  });
  it('does not migrate an already localized page', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/fr?lang=fr')).toBeNull();
  });
  it('requires the exact language value', () => {
    expect(legacyLanguageRedirectUrl('https://www.photocalia.com/?lang=FR')).toBeNull();
  });
});
