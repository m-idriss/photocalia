# PhotoCalia architecture

Status: current frontend architecture as of 7 August 2026.

## Product boundary

PhotoCalia turns an image or PDF containing dates into editable calendar events and an ICS export. The customer journey is:

1. Visit the English or French web application.
2. Sign in with Google through Firebase Authentication.
3. Upload one or more JPG, PNG or PDF files.
4. Send the prepared file payload to the conversion API.
5. Review and edit extracted events.
6. Export an ICS file or open Google Calendar.

The frontend repository does not contain the AI model credentials, Stripe secret keys or the production backend implementation.

## Runtime map

| Layer | Current implementation | Ownership boundary |
| --- | --- | --- |
| Web application | Angular 22, TypeScript 6, server prerendering, PWA shell | This repository |
| Frontend hosting | Vercel, production region `cdg1` | Vercel project and domain |
| Authentication | Firebase Authentication with Google Sign-In | Firebase project `image-to-ics` |
| Conversion API | `https://api.photocalia.com/v1` | Separate Quarkus/Google Cloud backend |
| Subscription checkout | API-created Stripe Checkout session | Backend and Stripe account |
| Product analytics | Vercel Analytics and Speed Insights | Vercel project |
| Public usage statistics | `/v1/converter/statistics` | Backend data |
| Content | Prerendered routes, generated bilingual blog, public assets | This repository |

## Frontend structure

- `src/app/pages/`: route-level pages, including home, pricing, legal pages, blog and SEO pillar pages.
- `src/app/components/`: converter, calendar editor, navigation, footer, consent and reusable UI.
- `src/app/services/`: authentication, conversion, subscriptions, plan limits, language, SEO and logging.
- `src/app/app.routes.ts`: English routes plus localized `/fr` route generation.
- `src/app/app.routes.server.ts`: prerender list for crawlable pages.
- `public/assets/i18n/`: English and French copy loaded at runtime.
- `scripts/generate-blog.mjs`: validates and generates the published blog index.
- `vercel.json`: production headers, caching policy and SPA rewrites.
- `middleware.ts`: canonical redirect for the legacy `?lang=fr` URL.

## Security and privacy controls

- Firebase ID tokens are attached to API requests when a user is authenticated.
- Uploaded files are converted to request payloads in the browser; secrets are not stored in this repository.
- The backend selects Gemini or Claude from server configuration; public copy does not promise a fixed model.
- Limited operational records can include the authenticated user ID and email in a private Notion workspace.
- Production responses set CSP, HSTS, frame, referrer and permissions headers.
- Browser error logs are same-origin, size-limited and exclude query strings.
- Cookie consent distinguishes essential behavior from optional analytics.
- The UI requires users to review AI-generated events before export.

Uploaded content is not intentionally persisted after request processing. Account, quota,
idempotency, Notion, payment and infrastructure records have different retention obligations; see
[PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md). Backend authorization, expiry automation, deletion
coverage and Stripe webhook enforcement must be verified in the separate backend during a
transaction.

## Availability and degradation

- Static and prerendered marketing pages remain available if the conversion API is unavailable.
- Conversion and live quota retrieval require internet access and the backend API.
- The PWA provides an installable application shell; it does not claim offline AI conversion.
- Pricing keeps server-renderable fallback quotas but refreshes limits from the public plans endpoint.
- Translation files revalidate instead of being cached immutably under stable filenames.

## Build and release

```bash
npm ci
npm run verify:frontend
```

Production is deployed by Vercel from `main`. A release is acceptable only when lint, unit tests, the production build, clean-tree validation and deployment checks pass.

## Transfer dependencies

An acquisition requires coordinated transfer or replacement of:

- the GitHub repository and branch protections;
- the Vercel project, environment configuration and `photocalia.com` domains;
- the Firebase project and Google OAuth configuration;
- the backend repository, Google Cloud resources and API domain;
- the Stripe account, products, prices and webhook secrets;
- analytics, monitoring, support mailboxes and social accounts.

No secret values should be placed in the data room or committed to this repository. Use the provider-specific account transfer flow and rotate credentials after closing.
