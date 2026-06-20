import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../../shared/pipes/localize-route.pipe';
import { LocalizeDatePipe } from '../../../shared/pipes/localize-date.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BLOG_ARTICLES, BlogArticle } from '../blog.models';
import { PlanService } from '../../../services/plan.service';
import { LanguageService } from '../../../services/language.service';

export function selectRelatedArticles(
  currentArticle: BlogArticle,
  articles: readonly BlogArticle[],
  limit = 3,
): BlogArticle[] {
  const currentTags = new Set(currentArticle.tags);

  return [...articles]
    .filter((article) => article.slug !== currentArticle.slug)
    .map((article) => ({
      article,
      sharedTags: article.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      return b.article.datePublished.localeCompare(a.article.datePublished);
    })
    .slice(0, limit)
    .map(({ article }) => article);
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, LocalizeDatePipe, TranslatePipe],
  templateUrl: './article.html',
  styleUrl: './article.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Article implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  protected readonly planService = inject(PlanService);
  protected readonly siteUrl = 'https://www.photocalia.com';

  readonly article = signal<BlogArticle | null>(null);
  readonly previousArticles = signal<BlogArticle[]>([]);
  protected readonly localizedArticle = computed(() => {
    const article = this.article();
    return article?.locales[this.languageService.currentLang()] ?? null;
  });
  protected readonly contentHtml = computed(() =>
    (this.localizedArticle()?.contentHtml ?? '').replaceAll(
      '{freeLimit}',
      String(this.planService.freePlanLimit()),
    ),
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      const found = slug ? (BLOG_ARTICLES.find((article) => article.slug === slug) ?? null) : null;
      this.article.set(found);

      this.previousArticles.set(found ? selectRelatedArticles(found, BLOG_ARTICLES) : []);
    });
  }

  protected absoluteImageUrl(image: string): string {
    return image.startsWith('http') ? image : `${this.siteUrl}${image}`;
  }

  protected localized(article: BlogArticle) {
    return article.locales[this.languageService.currentLang()];
  }
}
