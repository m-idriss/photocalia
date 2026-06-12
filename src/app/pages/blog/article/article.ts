import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../../shared/pipes/localize-route.pipe';
import { LocalizeDatePipe } from '../../../shared/pipes/localize-date.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BLOG_ARTICLES, BlogArticle } from '../blog.models';
import { PlanService } from '../../../services/plan.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, LocalizeDatePipe, TranslatePipe],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit {
  private readonly router = inject(Router);
  protected readonly planService = inject(PlanService);
  protected readonly planParams = computed(() => ({ freeLimit: this.planService.freePlanLimit() }));
  protected readonly siteUrl = 'https://photocalia.com';

  readonly article = signal<BlogArticle | null>(null);
  readonly previousArticles = signal<BlogArticle[]>([]);

  ngOnInit(): void {
    // Extract slug from URL path (works for both /blog/slug and /fr/blog/slug)
    const url = this.router.url.split('?')[0].split('#')[0];
    const segments = url.split('/').filter(Boolean);
    // Remove 'fr' prefix if present, then take the last segment after 'blog'
    const filtered = segments.filter((s) => s !== 'fr');
    const blogIndex = filtered.indexOf('blog');
    const slug = blogIndex >= 0 ? filtered[blogIndex + 1] : null;

    const found = slug ? (BLOG_ARTICLES.find((a) => a.slug === slug) ?? null) : null;
    this.article.set(found);

    // Get related articles (most recent first, excluding current; show up to 3)
    const related = [...BLOG_ARTICLES]
      .filter((a) => a.slug !== slug)
      .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
      .slice(0, 3);
    this.previousArticles.set(related);
  }

  protected absoluteImageUrl(image: string): string {
    return image.startsWith('http') ? image : `${this.siteUrl}${image}`;
  }
}
