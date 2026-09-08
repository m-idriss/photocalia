# Repository analysis summary

Status: refreshed 8 September 2026.

PhotoCalia is an Angular 22 / TypeScript 6 frontend for converting images and PDFs into reviewable calendar events and ICS exports. It is deployed on Vercel and depends on a separate Quarkus API, Firebase Authentication, Stripe and a private Notion operational-tracking workspace.

## Strengths

- Bilingual English/French prerendered marketing and guide content.
- Installable PWA shell, responsive UI and accessible review controls.
- Unit, lint, production build, blog-integrity and Playwright checks in CI.
- Privacy-safe bilingual image/PDF/DST fixtures with independent ICS validation.
- A credential-free browser smoke test covering upload, review, edit and download.
- Explicit frontend/backend ownership boundary and acquisition-readiness documentation.
- Server-backed plan retrieval with one frontend fallback catalog.

## Material risks still tracked

- Provider-backed accuracy checks still need a dedicated non-production identity, backend environment and spending limit (#916).
- AI providers still need a shared validated event model and controlled fallback policy (`3dime-api#214`).
- Backend outbox delivery, conversion observability and privacy lifecycle controls remain tracked in `3dime-api#215`, `#216` and `#217`.
- Third-party brand distribution requires human-owned accounts and publication approvals (#621).

## Verification baseline

```bash
npm ci
npm run verify:frontend
```

For current detail, use [ARCHITECTURE.md](ARCHITECTURE.md), [ACQUISITION_READINESS.md](ACQUISITION_READINESS.md), [PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md), [TESTING.md](TESTING.md) and [ROADMAP.md](ROADMAP.md). Historical version claims removed from this summary must not be used as transaction evidence.
