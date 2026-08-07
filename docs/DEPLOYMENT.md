# Production deployment

Status: current frontend deployment as of 7 August 2026.

## Production topology

- Source branch: `main`
- Frontend platform: Vercel
- Primary URL: `https://www.photocalia.com`
- Canonical host: `www.photocalia.com`
- Build command: `npm run vercel-build`
- Application output: `dist/photocalia/browser`
- API: separately deployed at `https://api.photocalia.com/v1`

`firebase.json` remains a portability configuration, not the current production frontend deployment path.

## Release gate

Run from a clean checkout with Node 22.22.3 or newer:

```bash
npm ci
npm run verify:frontend
```

The verification command checks generated blog content, lint, unit tests, the production build and unexpected generated changes.

## Normal release

1. Create a focused branch.
2. Run the release gate locally.
3. Open a pull request.
4. Require CI, security, quality, Lighthouse and Vercel preview checks to pass.
5. Review the preview on desktop and mobile.
6. Merge to `main`.
7. Confirm the Vercel production deployment references the merge commit.
8. Verify the primary routes, API status, security headers and service-worker update.

Do not use a manual production promotion to bypass a failing pull-request gate.

## Required post-deploy checks

```bash
curl -I https://www.photocalia.com/
curl -I https://photocalia.com/
curl -I https://www.photocalia.com/fr
curl -I https://www.photocalia.com/sitemap.xml
curl -I https://www.photocalia.com/assets/i18n/en.json
```

Expected results:

- primary English and French pages return `200`;
- the apex domain redirects to `www`;
- CSP, HSTS, frame, referrer and content-type headers are present;
- `sitemap.xml` remains public;
- stable translation files revalidate and are not marked immutable.

Also confirm the public read-only API endpoints:

- `GET /v1/converter/plans`
- `GET /v1/converter/statistics`

Never exercise checkout, conversion or account actions as a health check unless test identities and explicit authorization are available.

## Configuration and secrets

Public Firebase web configuration is built into the browser bundle. Secret AI, Stripe and backend credentials belong to the backend/provider environments and must not be committed here.

Before transferring production:

- export an inventory of Vercel environment variables without secret values;
- document which backend variables are required in the separate backend repository;
- transfer provider ownership first, then rotate reusable credentials;
- keep the previous production deployment available for rollback.

## Rollback

Use Vercel's deployment history to promote the last known-good production build, then revert the responsible Git commit through a pull request. After rollback, repeat the post-deploy checks and confirm the service worker is no longer serving the defective asset set.
