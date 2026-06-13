import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../../shared/pipes/localize-route.pipe';
import { LocalizeDatePipe } from '../../../shared/pipes/localize-date.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BLOG_ARTICLES, BlogArticle } from '../blog.models';
import { PlanService } from '../../../services/plan.service';
import { LanguageService } from '../../../services/language.service';

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
  protected readonly siteUrl = 'https://photocalia.com';

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

      const related = [...BLOG_ARTICLES]
        .filter((article) => article.slug !== slug)
        .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
        .slice(0, 2);
      this.previousArticles.set(related);
    });
  }

  protected absoluteImageUrl(image: string): string {
    return image.startsWith('http') ? image : `${this.siteUrl}${image}`;
  }

  protected localized(article: BlogArticle) {
    return article.locales[this.languageService.currentLang()];
  }
}
