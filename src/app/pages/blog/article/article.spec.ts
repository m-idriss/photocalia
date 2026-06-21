import { selectRelatedArticles } from './article';
import type { BlogArticle } from '../blog.models';

const baseArticle = {
  author: 'Idriss',
  authorUrl: 'https://3dime.com',
  dateModified: '2026-01-01',
  readingTime: '5 min',
  image: '/image.jpg',
  keywords: '',
  locales: {
    en: {
      title: 'Title',
      description: 'Description',
      imageAlt: 'Image',
      contentHtml: '<p>Content</p>',
    },
    fr: {
      title: 'Titre',
      description: 'Description',
      imageAlt: 'Image',
      contentHtml: '<p>Contenu</p>',
    },
  },
} satisfies Omit<BlogArticle, 'slug' | 'datePublished' | 'tags'>;

function article(slug: string, datePublished: string, tags: readonly string[]): BlogArticle {
  return {
    ...baseArticle,
    slug,
    datePublished,
    tags,
  };
}

describe('selectRelatedArticles', () => {
  it('prioritizes shared tags before recency', () => {
    const current = article('current', '2026-06-10', ['calendar', 'family']);
    const highlyRelated = article('highly-related', '2026-01-01', ['calendar', 'family']);
    const recentButWeak = article('recent-weak', '2026-06-14', ['calendar']);
    const unrelatedRecent = article('unrelated-recent', '2026-06-15', ['pricing']);

    const related = selectRelatedArticles(current, [
      current,
      unrelatedRecent,
      recentButWeak,
      highlyRelated,
    ]);

    expect(related.map((item) => item.slug)).toEqual([
      'highly-related',
      'recent-weak',
      'unrelated-recent',
    ]);
  });

  it('limits results and excludes the current article', () => {
    const current = article('current', '2026-06-10', ['calendar']);
    const related = selectRelatedArticles(
      current,
      [
        current,
        article('one', '2026-06-09', ['calendar']),
        article('two', '2026-06-08', ['calendar']),
        article('three', '2026-06-07', ['calendar']),
      ],
      2,
    );

    expect(related.map((item) => item.slug)).toEqual(['one', 'two']);
  });
});
