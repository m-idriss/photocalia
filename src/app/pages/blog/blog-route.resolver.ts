import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SITE_URL, type SeoData } from '../../services/seo.service';
import { pageTitle } from '../../utils/page-title.utils';
import { BLOG_ARTICLES } from './blog.models';

function findArticle(slug: string | null) {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

function routeLanguage(route: ActivatedRouteSnapshot) {
  return route.pathFromRoot.some((snapshot) =>
    snapshot.url.some((segment) => segment.path === 'fr'),
  )
    ? 'fr'
    : 'en';
}

export const blogTitleResolver: ResolveFn<string> = (route) => {
  const article = findArticle(route.paramMap.get('slug'));
  if (!article) return pageTitle('Article not found');

  return pageTitle(article.locales[routeLanguage(route)].title);
};

export const blogSeoResolver: ResolveFn<SeoData> = (route) => {
  const article = findArticle(route.paramMap.get('slug'));
  if (!article) {
    return {
      title: pageTitle('Article not found'),
      description: 'The requested PhotoCalia article could not be found.',
      robots: 'noindex, nofollow',
      type: 'article',
      structuredData: [],
    };
  }

  const language = routeLanguage(route);
  const localized = article.locales[language];
  const languagePrefix = language === 'fr' ? '/fr' : '';
  const articleUrl = `${SITE_URL}${languagePrefix}/blog/${article.slug}`;
  const imageUrl = article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`;

  return {
    title: pageTitle(localized.title),
    description: localized.description,
    keywords: article.keywords,
    author: article.author,
    ogImage: imageUrl,
    ogUrl: articleUrl,
    type: 'article',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}${languagePrefix}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${SITE_URL}${languagePrefix}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: localized.title,
            item: articleUrl,
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: localized.title,
        description: localized.description,
        author: { '@type': 'Person', name: article.author, url: article.authorUrl },
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        publisher: {
          '@type': 'Organization',
          name: 'PhotoCalia',
          url: SITE_URL,
        },
        image: imageUrl,
        mainEntityOfPage: articleUrl,
      },
    ],
  };
};
