import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

// Inspect the actual build output: route configuration alone cannot prove indexability.
const buildDir = path.resolve(process.argv[2] || 'dist/photocalia/browser');
const origin = 'https://www.photocalia.com';
const sitemap = await readFile(path.join(buildDir, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(urls.length > 0, 'The built sitemap must contain pages');
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');
// Independent baseline: deleting a page from the generated sitemap must fail CI.
// New URLs are allowed; intentional removals must explicitly update this reviewed list.
const requiredPaths = JSON.parse(
  await readFile(new URL('./seo-required-paths.json', import.meta.url), 'utf8'),
);
for (const requiredPath of requiredPaths) {
  const expected = `${origin}${requiredPath === '/' ? '' : requiredPath}`;
  assert.ok(urls.includes(expected), `Required URL missing from sitemap: ${expected}`);
}

const pages = new Map();
const errors = [];

function elements(node, tag) {
  return [
    ...(node.tagName === tag ? [node] : []),
    ...(node.childNodes || []).flatMap((child) => elements(child, tag)),
  ];
}
function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}
function text(node) {
  return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
}
async function load(pagePath) {
  const file = path.join(buildDir, pagePath.replace(/^\//, ''), 'index.html');
  return parse(await readFile(file, 'utf8'));
}
function check(condition, message) {
  assert.ok(condition, message);
}
for (const url of urls) {
  try {
    const parsedUrl = new URL(url);
    check(parsedUrl.origin === origin, `Unexpected sitemap origin: ${url}`);
    const pagePath = parsedUrl.pathname;
    const dom = await load(pagePath);
    const links = elements(dom, 'link');
    const metas = elements(dom, 'meta');
    const canonical = links.filter((link) => attr(link, 'rel') === 'canonical');
    check(canonical.length === 1 && attr(canonical[0], 'href') === url, 'Incorrect canonical');
    check(
      elements(dom, 'h1').length === 1 && text(elements(dom, 'h1')[0]).trim(),
      'Expected one nonempty H1',
    );
    const titles = elements(dom, 'title');
    check(
      titles.length === 1 && text(titles[0]).includes('Photocalia'),
      'Missing title or inconsistent brand',
    );
    check(
      metas.some((meta) => attr(meta, 'name') === 'description' && attr(meta, 'content')?.trim()),
      'Missing description',
    );
    check(
      !metas.some(
        (meta) =>
          ['robots', 'googlebot'].includes(attr(meta, 'name')) &&
          /noindex|\bnone\b/i.test(attr(meta, 'content') || ''),
      ),
      'Sitemap page is noindex',
    );
    const french = pagePath === '/fr' || pagePath.startsWith('/fr/');
    check(
      attr(elements(dom, 'html')[0], 'lang') === (french ? 'fr' : 'en'),
      'Incorrect document language',
    );
    const base = french ? pagePath.slice(3) : pagePath === '/' ? '' : pagePath;
    for (const [lang, href] of Object.entries({
      en: `${origin}${base}`,
      fr: `${origin}/fr${base}`,
      'x-default': `${origin}${base}`,
    })) {
      const alternate = links.filter((link) => attr(link, 'hreflang') === lang);
      check(
        alternate.length === 1 && attr(alternate[0], 'href') === href,
        `Incorrect ${lang} alternate`,
      );
      check(urls.includes(href), `Alternate missing from sitemap: ${href}`);
    }
    const main = elements(dom, 'main')[0];
    check(main && text(main).trim().length > 100, 'Missing prerendered main content');
    const hrefs = elements(dom, 'a')
      .map((a) => attr(a, 'href'))
      .filter(Boolean);
    pages.set(url, { dom, hrefs });
  } catch (error) {
    errors.push(`${url}: ${error.message}`);
  }
}
// All sitemap pages must be discoverable by real HTML links from the home page.
const seen = new Set();
const queue = [origin];
while (queue.length) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  for (const href of pages.get(url)?.hrefs || []) {
    const target = new URL(href, url);
    const normalized = `${target.origin}${target.pathname === '/' ? '' : target.pathname}`;
    if (pages.has(normalized) && !seen.has(normalized)) queue.push(normalized);
  }
}
for (const url of pages.keys()) {
  if (!seen.has(url)) errors.push(`${url}: no crawlable path from the home page`);
}
for (const prefix of ['', '/fr']) {
  try {
    const home = pages.get(`${origin}${prefix}`);
    const mainLinks = elements(elements(home.dom, 'main')[0], 'a').map((a) => attr(a, 'href'));
    for (const slug of ['photo-to-calendar', 'pdf-to-calendar', 'image-to-google-calendar']) {
      check(
        mainLinks.includes(`${prefix}/${slug}`),
        `Missing contextual link to ${prefix}/${slug}`,
      );
    }
    const search = await load(`${prefix}/search`);
    check(
      elements(search, 'meta').some(
        (meta) => attr(meta, 'name') === 'robots' && /noindex/.test(attr(meta, 'content') || ''),
      ),
      'Internal search must remain noindex',
    );
  } catch (error) {
    errors.push(`${prefix || '/'}: ${error.message}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${urls.length} rendered sitemap pages, canonical/hreflang, crawlable links and search exclusions.`,
  );
}
