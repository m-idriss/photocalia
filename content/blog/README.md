# Blog content

Each article lives in its own directory:

```text
content/blog/<slug>/
├── index.md  # English content and shared metadata
└── fr.md     # French content and localized metadata
```

## Add an article

1. Create the article directory using the URL slug.
2. Add `index.md` with all required front matter fields and the English body.
3. Add `fr.md` with `title`, `description`, `imageAlt`, and the French body.
4. Add the referenced hero image under `public/assets/images/blog/`.
5. Run `npm run blog:generate`.
6. Run `npm run build` to validate both localized prerendered routes.

The generator automatically creates:

- the typed Angular article registry;
- the English and French article listings;
- the dynamic article route data;
- SEO metadata and structured data;
- the English and French prerender route list.

## English front matter

```yaml
---
slug: example-article
title: 'Example article'
description: 'Short listing and SEO description.'
author: Idriss
authorUrl: https://3dime.com
datePublished: 2026-06-13
dateModified: 2026-06-13
readingTime: '5 min'
tags: ['guide', 'calendar']
image: /assets/images/blog/example-article.jpg
imageAlt: 'Description of the hero image'
keywords: 'example keyword, calendar guide'
---
```

Use `{freeLimit}` in Markdown when the text should include the current free-plan limit.

Do not edit `src/app/pages/blog/generated/blog.generated.ts` or
`content/blog/prerender-routes.txt` manually. Both files are generated.
