# Testing and verification

Status: current frontend test workflow as of 7 August 2026.

## One-command verification

```bash
npm run verify:frontend
```

This runs:

1. bilingual blog generation integrity;
2. public pricing/provider claim consistency;
3. golden dataset schema and coverage checks;
4. ESLint;
5. the full headless unit-test suite;
6. an optimized production build;
7. a clean-tree check for unintended generated changes.

The credential-free converter browser smoke is required separately in pull-request CI because it
starts a development server and installs Chromium.

## Focused commands

```bash
npm run blog:check
npm run claims:check
npm run fixtures:check
npm run lint
npm run test:ci
npm run build:ci
npm run e2e
```

Do not document a fixed test count or build duration: both legitimately change as coverage grows. The CI result for the exact commit is the source of truth.

## Critical converter smoke test

The required pull-request smoke path uses a development-only synthetic authentication seam and
intercepts the conversion, quota and plans API calls. It uploads the privacy-safe English golden
PNG, verifies the submitted timezone, reviews two events, edits one title, confirms the review
warning, downloads the result, and independently checks title, date, timezone semantics, location,
all-day behavior and event count with `ical.js`. It needs no production credentials and cannot be
enabled in a production build.

```bash
npx playwright test e2e/app.spec.ts --grep "uploads, reviews"
```

Golden SVG sources, generated PNG/PDF files, expected models and provenance live in
`e2e/fixtures/golden/`. Regenerate renderings with `npm run fixtures:generate`.
Validate required English/French, PNG/PDF, multi-event, all-day, ambiguity and DST coverage with
`npm run fixtures:check`.

Provider-backed accuracy runs remain a separate controlled-schedule requirement. They need a
dedicated non-production Firebase identity, backend environment and spending limit; do not place a
long-lived production token in GitHub Actions. Until that environment exists, the deterministic PR
smoke protects workflow and ICS behavior but does not claim provider accuracy.

## High-value manual stories

### Anonymous visitor

- English and French routes render translated copy.
- Cookie preferences are understandable and reversible.
- The converter clearly asks for Google sign-in.
- Pricing displays the live API quotas.
- Legal, privacy, terms and support links resolve.

### Authenticated conversion

- Google sign-in completes on an authorized domain.
- JPG, PNG and PDF selection validates type and size.
- Multiple files display progress independently.
- Extracted events can be edited before export.
- ICS download and Google Calendar handoff work.
- Quota usage refreshes after successful conversion.

### Subscription

- Monthly and yearly prices are consistent with Stripe products.
- Checkout creates an authenticated session for the selected plan.
- Successful payment returns to the subscription-success route.
- Backend entitlement matches the plan endpoint.
- Cancellation and billing support follow the published process.

Checkout and conversion tests can create cost or financial state. Use dedicated test accounts and Stripe test mode unless the owner explicitly authorizes a production transaction.

## Release evidence

Keep the following with the pull request or release:

- exact commit SHA;
- CI and dependency-audit results;
- Vercel preview and production deployment IDs;
- desktop and mobile route checks;
- API boundary checks;
- any known limitation accepted for release.

For acquisition diligence, provide evidence from the current commit rather than screenshots from an older release.
