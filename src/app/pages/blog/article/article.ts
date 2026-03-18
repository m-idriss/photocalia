import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BLOG_ARTICLES, BlogArticle } from '../blog.models';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit {
  private readonly router = inject(Router);

  readonly article = signal<BlogArticle | null>(null);

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
  }
}
