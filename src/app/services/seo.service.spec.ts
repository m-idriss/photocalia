import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let document: Document;
  let router: { url: string; events: typeof EMPTY };
  let service: SeoService;

  beforeEach(() => {
    router = { url: '/fr/how-it-works', events: EMPTY };

    TestBed.configureTestingModule({
      providers: [
        Meta,
        Title,
        SeoService,
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { firstChild: null, outlet: 'primary', data: EMPTY },
        },
      ],
    });

    document = TestBed.inject(DOCUMENT);
    service = TestBed.inject(SeoService);
  });

  it('uses a self-referencing canonical for a French page', () => {
    service.updateSeoTags({
      title: 'Comment ça marche',
      description: 'Description',
    });

    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://www.photocalia.com/fr/how-it-works',
    );
    expect(
      document.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="en"]')?.href,
    ).toBe('https://www.photocalia.com/how-it-works');
    expect(
      document.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="fr"]')?.href,
    ).toBe('https://www.photocalia.com/fr/how-it-works');
  });

  it('applies route-specific robots directives', () => {
    router.url = '/subscription/success';

    service.updateSeoTags({
      title: 'Subscription activated',
      description: 'Description',
      robots: 'noindex, nofollow',
    });

    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe(
      'noindex, nofollow',
    );
  });

  it('uses French metadata on a French route', () => {
    const homeOnlySchema = document.createElement('script');
    homeOnlySchema.setAttribute('data-home-structured-data', '');
    document.head.appendChild(homeOnlySchema);

    service.updateSeoTags({
      title: 'How it works',
      description: 'English description',
      localized: {
        fr: {
          title: 'Comment ça marche',
          description: 'Description française',
          keywords: 'photo vers calendrier',
        },
      },
    });

    expect(TestBed.inject(Title).getTitle()).toBe('Comment ça marche');
    expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      'Description française',
    );
    expect(document.querySelector<HTMLMetaElement>('meta[name="keywords"]')?.content).toBe(
      'photo vers calendrier',
    );
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.content).toBe(
      'fr_FR',
    );
    expect(document.querySelector('script[data-home-structured-data]')).toBeNull();
  });

  it('does not reuse English structured data on a French page', () => {
    service.updateSeoTags({
      title: 'How it works',
      description: 'English description',
      structuredData: [{ '@context': 'https://schema.org', '@type': 'FAQPage' }],
      localized: {
        fr: {
          title: 'Comment ça marche',
          description: 'Description française',
        },
      },
    });

    expect(document.querySelector('script[data-page-structured-data]')).toBeNull();
  });

  it('uses localized structured data when it is supplied', () => {
    service.updateSeoTags({
      title: 'About',
      description: 'English description',
      structuredData: [{ '@type': 'BreadcrumbList', name: 'About' }],
      localized: {
        fr: {
          title: 'À propos',
          description: 'Description française',
          structuredData: [{ '@type': 'BreadcrumbList', name: 'À propos' }],
        },
      },
    });

    const schema = document.querySelector('script[data-page-structured-data]');
    expect(schema?.textContent).toContain('À propos');
    expect(schema?.textContent).not.toContain('"About"');
  });
});
