import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { LocalizeDatePipe } from '../../shared/pipes/localize-date.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { LanguageService } from '../../services/language.service';
import { BLOG_ARTICLES, BlogArticle } from './blog.models';

type BlogViewMode = 'grid' | 'list';

const BLOG_VIEW_MODE_KEY = 'photocalia_blog_view_mode';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, LocalizeDatePipe, TranslatePipe, ScrollRevealDirective],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly languageService = inject(LanguageService);

  readonly articles = [...BLOG_ARTICLES].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );

  protected readonly searchQuery = signal('');
  protected readonly viewMode = signal<BlogViewMode>('grid');
  protected readonly filteredArticles = computed(() => {
    const query = normalizeSearchTerm(this.searchQuery());
    const language = this.languageService.currentLang();

    if (!query) return this.articles;

    return this.articles.filter((article) => {
      const localized = article.locales[language];
      const searchableText = normalizeSearchTerm(
        [
          article.slug,
          article.keywords,
          article.tags.join(' '),
          localized.title,
          localized.description,
          stripHtml(localized.contentHtml),
        ].join(' '),
      );

      return searchableText.includes(query);
    });
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedMode = localStorage.getItem(BLOG_VIEW_MODE_KEY);
    if (savedMode === 'grid' || savedMode === 'list') {
      this.viewMode.set(savedMode);
    }
  }

  protected setViewMode(mode: BlogViewMode): void {
    this.viewMode.set(mode);

    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(BLOG_VIEW_MODE_KEY, mode);
  }

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchQuery.set(input?.value ?? '');
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected searchByTag(event: Event, tag: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchQuery.set(tag);
  }

  protected localized(article: BlogArticle) {
    return article.locales[this.languageService.currentLang()];
  }
}

function normalizeSearchTerm(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}
