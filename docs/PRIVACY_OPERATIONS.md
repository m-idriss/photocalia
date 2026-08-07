# Privacy operations register

Status: acquisition-readiness baseline as of 7 August 2026.

This register records what the frontend and inspected backend currently do. It deliberately distinguishes verified behavior from retention work that still needs an owner. It is operational documentation, not legal advice.

| Data category | Purpose | System/processors | Current handling | Deletion owner |
| --- | --- | --- | --- | --- |
| Google account identifier, email, optional name/photo | Authentication and account display | Firebase Authentication / Google | Retained with the account | Firebase project administrator |
| Uploaded image/PDF content and visible event details | Generate calendar events | PhotoCalia API; server-selected Gemini or Claude provider | Sent for request processing; not intentionally persisted by PhotoCalia after the request | Backend operator; provider controls governed by its processing agreement |
| Generated ICS associated with an idempotency reservation | Avoid duplicate processing/charging | Backend quota store / Firestore | May be held with the reservation; exact expiry must be verified in backend operations | Backend and Firebase project administrator |
| User ID, email, plan and quota usage | Enforce limits and subscriptions | Backend / Firestore; selected Notion records | Retained while the account or operational obligation is active; no frontend deletion control | Backend and Firebase project administrator |
| Conversion timestamp, status, domain, counts, duration, limited error | Support, abuse prevention and aggregate measurement | Private Notion workspace | No documented short automatic expiry; manual deletion/anonymization required today | Notion workspace owner |
| Checkout, subscription and payment records | Billing, fraud prevention and accounting | Stripe and backend | Provider and statutory retention periods apply | Stripe account and backend owner |
| IP address, request/browser metadata and security logs | Hosting, security and diagnosis | Vercel and Google Cloud | Provider-configured logs and retention | Vercel and Google Cloud project owners |
| Consent choice and anonymous browser identifier | Consent state and unauthenticated continuity | Browser local storage | Stored on the user's device until cleared | User/browser; frontend maintainer for format changes |

## Request procedure

1. Receive requests at `privacy@photocalia.com` and log only the minimum information required.
2. Verify identity proportionately; do not collect identity documents by default.
3. Search Firebase Authentication, Firestore/quota storage, Notion and Stripe using the verified account identifiers.
4. Delete or correct records PhotoCalia controls, and document any legal or technical retention exception.
5. Coordinate provider requests where controller-side deletion is insufficient.
6. Confirm completion to the requester and retain a minimal compliance log.

## Required follow-up controls

- Assign written retention periods to account/quota, idempotency, Notion and infrastructure-log records.
- Automate expiry or anonymization where the purpose does not justify indefinite retention.
- Add a tested account deletion workflow that covers frontend, backend and notifications.
- Keep the public privacy policy synchronized with backend provider configuration.
- During a transaction, transfer processing agreements, subprocessors, access lists and deletion evidence separately from source code.

## Processor due-diligence links

- [Google Cloud Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum)
- [Anthropic privacy policy](https://www.anthropic.com/legal/privacy)
- [Notion privacy policy](https://www.notion.so/privacy)
- [Vercel Data Processing Addendum](https://vercel.com/legal/dpa)
- [Stripe privacy policy](https://stripe.com/privacy)
