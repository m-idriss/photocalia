export function legacyLanguageRedirectUrl(requestUrl: string): URL | null {
  const url = new URL(requestUrl);

  if (url.pathname !== '/' || url.searchParams.get('lang') !== 'fr') {
    return null;
  }

  url.pathname = '/fr';
  url.searchParams.delete('lang');
  return url;
}
