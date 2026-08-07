# PhotoCalia roadmap

Status: 7 August 2026. GitHub issues are the execution source of truth.

## Current product

The Angular 22 frontend is hosted on Vercel. It provides Google authentication through Firebase, browser-side file preparation, an editable conversion review flow and ICS export. A separate Quarkus backend owns AI-provider selection, quotas, subscriptions, operational tracking and payment integration.

## Priority roadmap

### P0 — truthful customer and transaction information

- #913: frontend alignment of plan quotas, provider claims, privacy, retention and architecture is
  implemented and ready for publication.
- Verify backend enforcement and provider/retention controls with `3dime-api#213` and the production configuration.

### P1 — API reliability

- #914: frontend error-code handling and a dated legacy quota adapter are implemented; publish and
  consume a versioned OpenAPI artifact when the backend dependency is ready.
- Generate frontend DTOs, define stable error codes and fail CI on breaking changes.

### P1 — converter maintainability

- #915: explicit conversion states, API, file/PDF, quota and ICS services, pure event utilities,
  event review and export components are implemented.
- Continue reducing legacy converter styles after the extracted child components have been observed
  in production.

### P1 — conversion quality

- #916: synthetic bilingual image/PDF/DST fixtures, independent ICS validation and a
  credential-free browser smoke path are implemented.
- Run provider-backed accuracy checks only in a controlled scheduled environment.

### Distribution

- #621: prepare and launch third-party brand profiles and demonstrations with human-owned accounts and explicit publication approval.

## Delivery rules

- Keep production secrets and backend deployment out of this repository.
- Require lint, tests, production build, blog integrity and critical browser checks before release.
- Keep public promises synchronized with observed production behavior.
- Deliver risky refactors in small reversible milestones with behavioral tests.
