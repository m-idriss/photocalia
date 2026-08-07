# Testing and verification

Status: current frontend test workflow as of 7 August 2026.

## One-command verification

```bash
npm run verify:frontend
```

This runs:

1. bilingual blog generation integrity;
2. ESLint;
3. the full headless unit-test suite;
4. an optimized production build;
5. a clean-tree check for unintended generated changes.

## Focused commands

```bash
npm run blog:check
npm run lint
npm run test:ci
npm run build:ci
npm run e2e
```

Do not document a fixed test count or build duration: both legitimately change as coverage grows. The CI result for the exact commit is the source of truth.

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
