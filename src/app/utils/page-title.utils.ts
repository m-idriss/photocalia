export const SITE_NAME = 'PhotoCalia';
export const PAGE_TITLE_SEPARATOR = ' | ';

export function pageTitle(title: string): string {
  return `${title}${PAGE_TITLE_SEPARATOR}${SITE_NAME}`;
}

export function homePageTitle(description: string): string {
  return `${SITE_NAME}${PAGE_TITLE_SEPARATOR}${description}`;
}
