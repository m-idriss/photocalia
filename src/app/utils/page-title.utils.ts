import type { ResolveFn } from '@angular/router';

export const SITE_NAME = 'Photocalia';
export const PAGE_TITLE_SEPARATOR = ' | ';

export function pageTitle(title: string): string {
  return `${title}${PAGE_TITLE_SEPARATOR}${SITE_NAME}`;
}

export function homePageTitle(description: string): string {
  return `${SITE_NAME}${PAGE_TITLE_SEPARATOR}${description}`;
}

export function localizedPageTitle(english: string, french: string): ResolveFn<string> {
  return (_route, state) => {
    const path = state.url.split(/[?#]/)[0];
    const isFrenchPage = path === '/fr' || path.startsWith('/fr/');
    return isFrenchPage ? french : english;
  };
}
