# PhotoCalia API boundary

Status: frontend compatibility notes as of 7 August 2026.

The Angular application calls the separately deployed Quarkus backend at `https://api.photocalia.com/v1`. The backend repository, deployment and secrets are separate transaction assets.

## Current consumers

| Frontend capability | Endpoint family | Authentication |
| --- | --- | --- |
| Convert files | `/converter` | Firebase ID token |
| Read quota | `/converter/quota-status` | Firebase ID token |
| Read public plans | `/converter/plans` | Public |
| Read public statistics | `/converter/statistics` | Public |
| Create checkout/manage subscription | `/subscriptions` | Firebase ID token |
| Donation checkout | `/donations` | As required by endpoint |

The authoritative, versioned schema snapshot is `contracts/3dime-api/openapi-v1.json`. TypeScript
types generated from it live in `src/app/generated/3dime-api.ts`; application models alias those
types instead of duplicating endpoint DTOs by hand.

## Contract status

The backend generates `contracts/openapi-v1.json` from its Quarkus annotations and verifies the
committed artifact in backend CI. Its runtime routes are `/v1/api-schema`,
`/v1/api-schema/public`, and `/v1/api-schema/admin`; those routes are admin-protected, so builds
consume the versioned repository artifact rather than production authentication state.

To update the frontend after an intentional backend contract change:

1. In `3dime-api`, run `scripts/update-openapi-contract.sh` and review the schema diff.
2. In this repository, run `npm run contracts:update` while the sibling backend checkout is present.
3. Review both the OpenAPI and generated TypeScript diffs.
4. Run `npm run contracts:check`; frontend CI runs the same verification before compiling consumers.

The frontend currently isolates the temporary legacy quota response branches behind
`ENABLE_LEGACY_QUOTA_RESPONSE_UNTIL_2026_10_01`. Remove that flag and both fallback shapes no later
than 1 October 2026, after the generated contract is required in CI.

## Error handling rule

Frontend behavior should branch on HTTP status and stable error codes, never on English error-message text. Unknown responses must degrade to a generic localized error while preserving a diagnostic correlation value when one is supplied by the API.

The backend sends `errorCode` and `requestId`. The compatibility mapper recognizes these frontend codes: `INVALID_REQUEST`,
`AUTHENTICATION_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `QUOTA_EXCEEDED`, `RATE_LIMITED`,
`SERVICE_UNAVAILABLE`, `NETWORK_ERROR`, and `UNKNOWN`. The backend schema must either adopt these
codes. Backend codes are mapped explicitly: `VALIDATION_ERROR` to `INVALID_REQUEST`,
`IDEMPOTENCY_CONFLICT` to `CONFLICT`, `RATE_LIMIT_EXCEEDED` to `RATE_LIMITED`, and provider,
datastore, processing, and internal failures to `SERVICE_UNAVAILABLE`.

## Authentication

Protected requests use:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

Do not place Firebase service credentials, provider keys or Stripe secrets in this frontend repository.
