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

@Injectable({
    providedIn: 'root'
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
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map(route => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            }),
            filter(route => route.outlet === 'primary'),
            mergeMap(route => route.data)
        ).subscribe((data: any) => {
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

        // Open Graph Tags
        this.metaService.updateTag({ property: 'og:title', content: seo.title });
        this.metaService.updateTag({ property: 'og:description', content: seo.description });
        this.metaService.updateTag({ property: 'og:type', content: seo.type || 'website' });
        this.metaService.updateTag({ property: 'og:url', content: seo.ogUrl || this.dom.location.href });

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

        // Update Canonical URL
        this.updateCanonicalUrl(seo.ogUrl || this.dom.location.href);

        // Inject per-page structured data (replaces previous page's data)
        this.updatePageStructuredData(seo.structuredData || []);
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

    private updatePageStructuredData(schemas: object[]) {
        // Remove previously injected per-page structured data scripts
        const existing = this.dom.querySelectorAll(`script[${this.PAGE_STRUCTURED_DATA_ATTR}]`);
        existing.forEach(el => el.parentNode?.removeChild(el));

        // Inject new per-page structured data
        schemas.forEach(schema => {
            const script = this.dom.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.setAttribute(this.PAGE_STRUCTURED_DATA_ATTR, 'true');
            script.textContent = JSON.stringify(schema, null, 2);
            this.dom.head.appendChild(script);
        });
    }
}
