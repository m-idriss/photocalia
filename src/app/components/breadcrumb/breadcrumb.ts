import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BLOG_ARTICLES } from '../../pages/blog/blog.models';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface BreadcrumbItem {
  label: string;
  route?: string;
}

const PAGE_LABEL_KEYS: Record<string, string> = {
  'how-it-works': 'breadcrumb.howItWorks',
  privacy: 'breadcrumb.privacy',
  terms: 'breadcrumb.terms',
  'legal-mentions': 'breadcrumb.legalMentions',
  blog: 'breadcrumb.blog',
  search: 'breadcrumb.search',
  pricing: 'breadcrumb.pricing',
  about: 'breadcrumb.about',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly currentUrl = signal(this.router.url);

  protected readonly items = computed<BreadcrumbItem[]>(() => {
    const language = this.languageService.currentLang();
    const segments = this.routeSegments();

    if (segments.length === 0) {
      return [];
    }

    const home: BreadcrumbItem = {
      label: this.languageService.translate('breadcrumb.home'),
      route: this.languageService.localizeRoute('/'),
    };
    const page = segments[0];

    if (page === 'blog' && segments[1]) {
      const article = BLOG_ARTICLES.find(({ slug }) => slug === segments[1]);
      return [
        home,
        {
          label: this.languageService.translate('breadcrumb.blog'),
          route: this.languageService.localizeRoute('/blog'),
        },
        {
          label:
            article?.locales[language].title ??
            this.languageService.translate('breadcrumb.article'),
        },
      ];
    }

    if (page === 'subscription' && segments[1] === 'success') {
      return [
        home,
        {
          label: this.languageService.translate('breadcrumb.pricing'),
          route: this.languageService.localizeRoute('/pricing'),
        },
        { label: this.languageService.translate('breadcrumb.subscriptionSuccess') },
      ];
    }

    if (page === 'donation' && segments[1] === 'success') {
      return [home, { label: this.languageService.translate('breadcrumb.donationSuccess') }];
    }

    return [
      home,
      {
        label: this.languageService.translate(PAGE_LABEL_KEYS[page] ?? 'breadcrumb.page'),
      },
    ];
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  private routeSegments(): string[] {
    const segments = this.currentUrl().split('?')[0].split('#')[0].split('/').filter(Boolean);
    return segments[0] === 'fr' ? segments.slice(1) : segments;
  }
}
