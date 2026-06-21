import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { LanguageService } from '../../services/language.service';
import { SEARCH_ENTRIES, SearchEntry, SearchResultType } from './search-index';

interface RankedSearchEntry {
  entry: SearchEntry;
  score: number;
}

type SearchViewMode = 'grid' | 'list';

const SEARCH_VIEW_MODE_KEY = 'photocalia_search_view_mode';

@Component({
  selector: 'app-search',
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe, ScrollRevealDirective],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly languageService = inject(LanguageService);

  protected readonly searchQuery = signal('');
  protected readonly viewMode = signal<SearchViewMode>('grid');
  protected readonly results = computed(() => {
    const query = normalizeSearchTerm(this.searchQuery());
    const language = this.languageService.currentLang();

    if (!query) return SEARCH_ENTRIES;

    return SEARCH_ENTRIES.map((entry) => {
      const localized = entry.locales[language];
      const searchableTitle = normalizeSearchTerm(localized.title);
      const searchableDescription = normalizeSearchTerm(localized.description);
      const searchableTags = normalizeSearchTerm(entry.tags.join(' '));
      const searchableContent = normalizeSearchTerm(localized.content);

      let score = 0;
      if (searchableTitle.includes(query)) score += 8;
      if (searchableTags.includes(query)) score += 6;
      if (searchableDescription.includes(query)) score += 4;
      if (searchableContent.includes(query)) score += 2;

      return { entry, score };
    })
      .filter((result): result is RankedSearchEntry => result.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
      .map((result) => result.entry);
  });

  protected readonly hasQuery = computed(() => normalizeSearchTerm(this.searchQuery()).length > 0);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery.set(params.get('q') ?? '');
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedMode = localStorage.getItem(SEARCH_VIEW_MODE_KEY);
    if (savedMode === 'grid' || savedMode === 'list') {
      this.viewMode.set(savedMode);
    }
  }

  protected setViewMode(mode: SearchViewMode): void {
    this.viewMode.set(mode);

    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(SEARCH_VIEW_MODE_KEY, mode);
  }

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const query = input?.value ?? '';
    this.searchQuery.set(query);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected searchByTag(event: Event, tag: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchQuery.set(tag);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: tag },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected localized(entry: SearchEntry) {
    return entry.locales[this.languageService.currentLang()];
  }

  protected displayRoute(entry: SearchEntry): string {
    return entry.route === '/' ? '/home' : entry.route;
  }

  protected resultTypeLabel(type: SearchResultType): string {
    return `search.type.${type}`;
  }
}

export function normalizeSearchTerm(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
