# Notion webhook status

The Firebase Functions webhook architecture previously documented here is not part of the current production frontend deployment.

PhotoCalia now treats Notion as a backend-owned integration. Operational conversion/quota tracking and any content synchronization must be configured, deployed and monitored in the separate Quarkus backend. Do not provision tokens, webhook secrets or deployment commands from this frontend repository.

Before enabling a Notion webhook:

1. Confirm the current backend endpoint and signature-verification implementation.
2. Store the token and signing secret in backend secret storage.
3. Scope the integration to the minimum required database.
4. Test replay protection, bounded error logging and failure alerts.
5. Document cache behavior and rollback in the backend runbook.
6. Update the public privacy policy if the data categories or purposes change.

For conversion tracking fields and retention responsibilities, see [NOTION_TRACKING_SETUP.md](NOTION_TRACKING_SETUP.md) and [PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md).
