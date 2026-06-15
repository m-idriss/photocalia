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
});
