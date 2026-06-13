import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import type { SeoData } from '../../services/seo.service';
import { BLOG_ARTICLES } from './blog.models';

const siteUrl = 'https://photocalia.com';

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
  if (!article) return 'Article not found | PhotoCalia';

  return `${article.locales[routeLanguage(route)].title} | PhotoCalia`;
};

export const blogSeoResolver: ResolveFn<SeoData> = (route) => {
  const article = findArticle(route.paramMap.get('slug'));
  if (!article) {
    return {
      title: 'Article not found | PhotoCalia',
      description: 'The requested PhotoCalia article could not be found.',
      type: 'article',
      structuredData: [],
    };
  }

  const localized = article.locales[routeLanguage(route)];
  const articleUrl = `${siteUrl}/blog/${article.slug}`;
  const imageUrl = article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`;

  return {
    title: `${localized.title} | PhotoCalia`,
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${siteUrl}/blog`,
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
          url: siteUrl,
        },
        image: imageUrl,
        mainEntityOfPage: articleUrl,
      },
    ],
  };
};
