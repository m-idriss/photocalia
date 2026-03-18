import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  author?: string;
  type?: string;
  structuredData?: object[];
}

const BASE_URL = 'https://photocalia.com';
const FR_PREFIX = '/fr';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private dom = inject(DOCUMENT);

  private readonly PAGE_STRUCTURED_DATA_ATTR = 'data-page-structured-data';

  constructor() {
    this.setupRouting();
  }

  private setupRouting() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data),
      )
      .subscribe((data: Record<string, unknown>) => {
        if (data.seo) {
          this.updateSeoTags(data.seo);
        }
      });
  }

  updateSeoTags(seo: SeoData) {
    // Set Title
    this.titleService.setTitle(seo.title);

    // Set Meta Tags
    this.metaService.updateTag({ name: 'description', content: seo.description });

    if (seo.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: seo.keywords });
    }

    if (seo.author) {
      this.metaService.updateTag({ name: 'author', content: seo.author });
    }

    // Determine current path and canonical URL
    const currentPath = this.router.url.split('?')[0].split('#')[0];
    const pagePath = this.stripLangPrefix(currentPath);
    const canonicalUrl = `${BASE_URL}${pagePath === '/' ? '' : pagePath}`;

    // Open Graph Tags
    this.metaService.updateTag({ property: 'og:title', content: seo.title });
    this.metaService.updateTag({ property: 'og:description', content: seo.description });
    this.metaService.updateTag({ property: 'og:type', content: seo.type || 'website' });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

    if (seo.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: seo.ogImage });
    }

    // Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: seo.title });
    this.metaService.updateTag({ name: 'twitter:description', content: seo.description });

    if (seo.ogImage) {
      this.metaService.updateTag({ name: 'twitter:image', content: seo.ogImage });
    }

    // Update Canonical URL (always points to the English version as canonical)
    this.updateCanonicalUrl(canonicalUrl);

    // Update hreflang tags for language alternates
    this.updateHreflangTags(pagePath);

    // Inject per-page structured data (replaces previous page's data)
    this.updatePageStructuredData(seo.structuredData || []);
  }

  /**
   * Strip /fr prefix from path to get the base page path.
   */
  private stripLangPrefix(path: string): string {
    if (path === FR_PREFIX || path === `${FR_PREFIX}/`) {
      return '/';
    }
    if (path.startsWith(`${FR_PREFIX}/`)) {
      return path.slice(FR_PREFIX.length);
    }
    return path;
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.dom.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.dom.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.dom.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Dynamically update hreflang <link> tags for the current page.
   * Creates path-based alternates:
   *   en → /page
   *   fr → /fr/page
   *   x-default → /page
   */
  private updateHreflangTags(pagePath: string) {
    const suffix = pagePath === '/' ? '' : pagePath;
    const enUrl = `${BASE_URL}${suffix}`;
    const frUrl = `${BASE_URL}${FR_PREFIX}${suffix || '/'}`;
    // Clean trailing slash for /fr/ root
    const frUrlClean =
      frUrl.endsWith('/') && frUrl !== `${BASE_URL}${FR_PREFIX}/`
        ? frUrl
        : frUrl === `${BASE_URL}${FR_PREFIX}/`
          ? `${BASE_URL}${FR_PREFIX}`
          : frUrl;

    this.setHreflang('en', enUrl);
    this.setHreflang('fr', frUrlClean);
    this.setHreflang('x-default', enUrl);
  }

  private setHreflang(lang: string, href: string) {
    let link: HTMLLinkElement | null = this.dom.querySelector(
      `link[rel="alternate"][hreflang="${lang}"]`,
    );
    if (!link) {
      link = this.dom.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      this.dom.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private updatePageStructuredData(schemas: object[]) {
    // Remove previously injected per-page structured data scripts
    const existing = this.dom.querySelectorAll(`script[${this.PAGE_STRUCTURED_DATA_ATTR}]`);
    existing.forEach((el) => el.parentNode?.removeChild(el));

    // Inject new per-page structured data
    schemas.forEach((schema) => {
      const script = this.dom.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute(this.PAGE_STRUCTURED_DATA_ATTR, 'true');
      script.textContent = JSON.stringify(schema, null, 2);
      this.dom.head.appendChild(script);
    });
  }
}
