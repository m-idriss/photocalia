# Repository analysis summary

Status: refreshed 7 August 2026.

PhotoCalia is an Angular 22 / TypeScript 6 frontend for converting images and PDFs into reviewable calendar events and ICS exports. It is deployed on Vercel and depends on a separate Quarkus API, Firebase Authentication, Stripe and a private Notion operational-tracking workspace.

## Strengths

- Bilingual English/French prerendered marketing and guide content.
- Installable PWA shell, responsive UI and accessible review controls.
- Unit, lint, production build, blog-integrity and Playwright foundations in CI.
- Explicit frontend/backend ownership boundary and acquisition-readiness documentation.
- Server-backed plan retrieval with one frontend fallback catalog.

## Material risks still tracked

- The production OpenAPI artifact is not publicly/versionably consumable, blocking full contract generation (#914 and `3dime-api#213`).
- Converter UI and orchestration remain too concentrated and need incremental decomposition (#915).
- A privacy-safe golden dataset and credential-free browser conversion smoke suite are incomplete (#916).
- Backend retention automation, deletion coverage and provider configuration require a separate operational audit (#913 follow-up).
- Third-party brand distribution requires human-owned accounts and publication approvals (#621).

## Verification baseline

```bash
npm ci
npm run verify:frontend
```

For current detail, use [ARCHITECTURE.md](ARCHITECTURE.md), [ACQUISITION_READINESS.md](ACQUISITION_READINESS.md), [PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md), [TESTING.md](TESTING.md) and [ROADMAP.md](ROADMAP.md). Historical version claims removed from this summary must not be used as transaction evidence.
