# Notion operational tracking

Status: current data description as of 7 August 2026. Configuration belongs to the private Quarkus backend, not this frontend repository.

The backend can write limited conversion and quota records to a private Notion workspace for support, abuse prevention and aggregate product measurement.

## Data fields observed in the backend

Depending on the operation and authentication state, a record can contain:

- user identifier;
- authenticated email address;
- timestamp and originating domain;
- success or error status;
- file and extracted-event counts;
- processing duration;
- a limited error message;
- plan and quota usage values.

Uploaded image/PDF content and extracted event bodies are not fields in this Notion tracking record. Error messages must remain bounded and must not include file contents, tokens or secrets.

## Access and configuration

- Keep the integration token in backend secret storage.
- Grant the integration access only to the required databases.
- Restrict workspace membership to operators with a documented support or compliance need.
- Never put Notion tokens or database identifiers in frontend environment files.
- Review Notion access during employee/contractor offboarding and during an acquisition handover.

Exact environment-variable names and deployment commands are maintained with the backend. Copying historical Firebase Functions instructions into this repository would create an unsafe and inaccurate second source of truth.

## Retention and deletion

Notion tracking entries do not currently have a documented short automatic expiry. Until the backend implements and verifies one, treat them as retained until manual deletion or anonymization following a verified request and periodic operational review.

A privacy request must be reconciled across Firebase/Firestore account and quota records, Notion operational records, Stripe records where applicable, and provider logs controlled by PhotoCalia. Record the request, systems checked, outcome, exceptions and completion date without storing unnecessary identity evidence.

See [PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md) for the complete operating matrix.
