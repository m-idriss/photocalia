import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { format } from 'prettier';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'blog');
const outputFile = path.join(root, 'src', 'app', 'pages', 'blog', 'generated', 'blog.generated.ts');
const routesFile = path.join(contentDir, 'prerender-routes.txt');
const sitemapFile = path.join(root, 'public', 'sitemap.xml');
const siteUrl = 'https://www.photocalia.com';
const checkOnly = process.argv.includes('--check');

const staticPages = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/how-it-works', changefreq: 'monthly', priority: '0.9' },
  { path: '/add-event-to-calendar-from-photo', changefreq: 'monthly', priority: '0.9' },
  { path: '/photo-to-calendar', changefreq: 'monthly', priority: '0.9' },
  { path: '/image-to-google-calendar', changefreq: 'monthly', priority: '0.9' },
  { path: '/pdf-to-calendar', changefreq: 'monthly', priority: '0.9' },
  { path: '/ocr-calendar-extraction', changefreq: 'monthly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.4' },
  { path: '/legal-mentions', changefreq: 'yearly', priority: '0.3' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
];

const requiredSharedFields = [
  'slug',
  'title',
  'description',
  'author',
  'authorUrl',
  'datePublished',
  'dateModified',
  'readingTime',
  'tags',
  'image',
  'imageAlt',
  'keywords',
];
const requiredLocalizedFields = ['title', 'description', 'imageAlt'];

function requireFields(data, fields, source) {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === '') {
      throw new Error(`${source}: missing front matter field "${field}"`);
    }
  }
}

function renderMarkdown(markdown, locale) {
  const html = marked.parse(markdown, {
    async: false,
    gfm: true,
  });

  const rendered = html
    .replace('<p>', '<p class="lead">')
    .replaceAll('<a href="http', '<a target="_blank" rel="noopener noreferrer" href="http')
    .trim();

  if (locale !== 'fr') return rendered;

  return rendered.replace(/href="\/(?!fr(?:\/|"))([^"]*)"/g, (_match, pagePath) => {
    return `href="/fr${pagePath ? `/${pagePath}` : ''}"`;
  });
}

function normalizeDate(value, source, field) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  throw new Error(`${source}: "${field}" must use YYYY-MM-DD format`);
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sitemapEntry({ path: pagePath, lastmod, changefreq, priority, image }) {
  const englishUrl = `${siteUrl}${pagePath}`;
  const frenchPath = pagePath ? `/fr${pagePath}` : '/fr';
  const frenchUrl = `${siteUrl}${frenchPath}`;

  const render = (loc, localizedPriority) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(englishUrl)}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${escapeXml(frenchUrl)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(englishUrl)}" />
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${localizedPriority}</priority>
${image ? `    <image:image>\n      <image:loc>${escapeXml(`${siteUrl}${image}`)}</image:loc>\n    </image:image>\n` : ''}  </url>`;

  return [
    render(englishUrl, priority),
    render(frenchUrl, Math.max(0.1, Number(priority) - 0.1).toFixed(1)),
  ];
}

async function readMarkdown(file, fields, locale) {
  const source = await readFile(file, 'utf8');
  const parsed = matter(source);
  requireFields(parsed.data, fields, path.relative(root, file));

  return {
    data: parsed.data,
    contentHtml: renderMarkdown(parsed.content, locale),
  };
}

const directories = (await readdir(contentDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const articles = [];

for (const directory of directories) {
  const articleDir = path.join(contentDir, directory);
  const english = await readMarkdown(
    path.join(articleDir, 'index.md'),
    requiredSharedFields,
    'en',
  );
  const french = await readMarkdown(path.join(articleDir, 'fr.md'), requiredLocalizedFields, 'fr');

  if (english.data.slug !== directory) {
    throw new Error(
      `${path.relative(root, articleDir)}: directory must match slug "${english.data.slug}"`,
    );
  }
  if (!Array.isArray(english.data.tags) || english.data.tags.length === 0) {
    throw new Error(`${path.relative(root, articleDir)}: "tags" must be a non-empty array`);
  }

  articles.push({
    slug: english.data.slug,
    author: english.data.author,
    authorUrl: english.data.authorUrl,
    datePublished: normalizeDate(
      english.data.datePublished,
      path.relative(root, articleDir),
      'datePublished',
    ),
    dateModified: normalizeDate(
      english.data.dateModified,
      path.relative(root, articleDir),
      'dateModified',
    ),
    readingTime: english.data.readingTime,
    tags: english.data.tags,
    image: english.data.image,
    keywords: english.data.keywords,
    locales: {
      en: {
        title: english.data.title,
        description: english.data.description,
        imageAlt: english.data.imageAlt,
        contentHtml: english.contentHtml,
      },
      fr: {
        title: french.data.title,
        description: french.data.description,
        imageAlt: french.data.imageAlt,
        contentHtml: french.contentHtml,
      },
    },
  });
}

const source = await format(
  `/* This file is generated by scripts/generate-blog.mjs. Do not edit manually. */
import type { BlogArticle } from '../blog.models';

export const BLOG_ARTICLES = ${JSON.stringify(articles, null, 2)} as const satisfies readonly BlogArticle[];

export const BLOG_SLUGS = BLOG_ARTICLES.map((article) => article.slug);
`,
  { parser: 'typescript', printWidth: 100, singleQuote: true },
);

const sitemapEntries = [
  ...staticPages.flatMap(sitemapEntry),
  ...articles.flatMap((article) =>
    sitemapEntry({
      path: `/blog/${article.slug}`,
      lastmod: article.dateModified,
      changefreq: 'monthly',
      priority: '0.7',
      image: article.image,
    }),
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.join('\n')}
</urlset>
`;

const routes = `${articles.flatMap((article) => [`/blog/${article.slug}`, `/fr/blog/${article.slug}`]).join('\n')}\n`;
const generatedFiles = [
  [outputFile, source],
  [routesFile, routes],
  [sitemapFile, sitemap],
];

if (checkOnly) {
  const staleFiles = [];

  for (const [file, expected] of generatedFiles) {
    let actual;
    try {
      actual = await readFile(file, 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      actual = null;
    }

    if (actual !== expected) {
      staleFiles.push(path.relative(root, file));
    }
  }

  if (staleFiles.length > 0) {
    console.error('Generated blog artifacts are stale:');
    for (const file of staleFiles) {
      console.error(`- ${file}`);
    }
    console.error('Run "npm run blog:generate" and commit the updated files.');
    process.exit(1);
  }

  console.log(
    `Verified ${articles.length} blog articles and ${sitemapEntries.length} sitemap URLs.`,
  );
} else {
  await mkdir(path.dirname(outputFile), { recursive: true });
  for (const [file, content] of generatedFiles) {
    await writeFile(file, content);
  }
  console.log(
    `Generated ${articles.length} blog articles and ${sitemapEntries.length} sitemap URLs.`,
  );
}
