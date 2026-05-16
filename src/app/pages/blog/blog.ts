import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { BLOG_ARTICLES } from './blog.models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe, ScrollRevealDirective],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  readonly articles = [...BLOG_ARTICLES].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );
}
