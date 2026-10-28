# Search visibility checks

## Before merging

Run `npm run build:ci && npm run seo:check`. The SEO check reads the generated HTML, rather than trusting router declarations. It checks every sitemap URL for its canonical URL, reciprocal language alternates, document language, title, description, H1, indexability and rendered main content. It also walks HTML links from the homepage and checks that internal search stays excluded from indexing.

The independent `scripts/seo-required-paths.json` baseline prevents accidental removal of existing sitemap URLs. New URLs are allowed; intentional removals require an explicit review of this list.

The public pages must retain their existing paths. Keep conversion, review, account and checkout routes functional. Never add fabricated ratings or testimonials.

## After an approved deployment

1. Verify the live homepage and photo/PDF landing pages in English and French. Compare their HTTP response, initial HTML, canonical, robots directives and actual links with the build output.
2. In Search Console, inspect the priority URLs and run a live test. An accessible URL is eligible, not guaranteed to be indexed.
3. Request indexing of a small set of improved, currently unindexed pages, subject to Google's quota. Start with `/photo-to-calendar`, `/image-to-google-calendar`, `/fr/photo-to-calendar` and `/fr/pdf-to-calendar`, then the photo-to-Google-Calendar and paper-schedule guides. Check each current status before submitting.
4. Keep existing redirect URLs out of the sitemap; do not treat intentional redirects as pages that need indexing. Do not click “validate fix” just because a content change was published.

## Measure after 28 days

Compare two complete 28-day periods, recording the actual date range and search type. Track clicks and impressions by landing page, available non-brand queries, country and device. Record indexation of priority URLs separately from the total count. Keep account analytics in a private report rather than this public repository.

Search Console hides some queries. Query subtotals do not necessarily equal the totals, and average position is not a fixed rank. Small samples and seasonality prevent attributing every change to a release. No rank or indexing deadline is guaranteed.

## English homepage and PDF copy experiment

Treat the homepage and `/pdf-to-calendar` copy changes as a measured experiment, not a proven ranking fix. The homepage targets photo/image conversion; the PDF page explains schedule-to-calendar conversion and the ICS output. Only their English titles, descriptions and opening copy change; the homepage HTML fallback uses the same metadata as its route.

Before release, keep the deployment date, previous copy and a per-page Search Console baseline in a private report. After release, verify the live HTML and note Google's next crawl date for each page. Review after 14 and 28 complete days, allowing for reporting delay. Compare equal-length periods with the same weekdays, search type, page, country and device. Track clicks, impressions, CTR and available query positions separately for each page; site-wide averages and index counts are not success criteria for this experiment.

Check the relevant query families: photo/image to calendar for home; PDF to calendar and PDF to ICS for the PDF page. Use only observed data, and do not treat hidden queries or missing rows as zero demand. Avoid overlapping copy changes during the observation period. If comparable segments keep declining after recrawl, review or revert this copy-only change rather than undoing crawlable links, canonicals or other unrelated work. Do not infer conversion improvement from clicks alone.

References:
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/help/crawling-index-faq
- https://support.google.com/webmasters/answer/7576553
- https://support.google.com/webmasters/answer/17010575
- https://support.google.com/calendar/answer/37118
