import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { LocalizeDatePipe } from '../../shared/pipes/localize-date.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { BLOG_ARTICLES } from './blog.models';

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

  readonly articles = [...BLOG_ARTICLES].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );

  protected readonly viewMode = signal<BlogViewMode>('grid');

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
}
