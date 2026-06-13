import type { SupportedLanguage } from '../../services/language.service';

export interface LocalizedBlogArticle {
  title: string;
  description: string;
  imageAlt: string;
  contentHtml: string;
}

export interface BlogArticle {
  slug: string;
  author: string;
  authorUrl: string;
  datePublished: string;
  dateModified: string;
  readingTime: string;
  tags: readonly string[];
  image: string;
  keywords: string;
  locales: Record<SupportedLanguage, LocalizedBlogArticle>;
}

export { BLOG_ARTICLES, BLOG_SLUGS } from './generated/blog.generated';
