# QA — reviewed coverage proposals

## Verified baseline

- [Frontend CI 40742920963](https://github.com/m-idriss/photocalia/actions/runs/40742920963) passed 314 unit tests, 10 synthetic core journeys, four additional browser smoke cases and three API-handler tests, plus build and contract checks.
- Existing core journey, Lighthouse and SEO checks are present. Their success does not establish complete coverage, WCAG compliance or absence of accessibility defects.

## Proposals requiring investigation

1. Inspect current Playwright/Jasmine inventories and identify specific uncovered navigation or localized URL cases. Add tests only for verified gaps; do not duplicate existing journeys.
2. Inspect Lighthouse configuration and SEO assertions before proposing explicit accessibility assertions. Record concrete issues, applicable pages and attainable criteria; do not claim that accessibility auditing is absent.
3. Use local synthetic fixtures and mocks. Do not use real customer sessions, documents, payment flows or provider requests to qualify these proposals.

## Interpretation and execution boundary

Reviewed on October 28, 2026. The original model proposals came from [planning run 40737332878](https://github.com/m-idriss/photocalia-agents/actions/runs/40737332878), which inspected bounded public build descriptors and workflow metadata, not full source or customer metrics. Unsupported absence/coverage assertions have been removed. These documents are planning records, not executable tasks or evidence that the suggested features are missing.

Do not infer a missing control from missing observations. Before implementation, inspect the current source, existing tests and workflow definitions, record a concrete gap and approve a bounded task. These proposals do not expand the automatic code/release catalogue. No payment, pricing, customer-data, authentication, production-provider or outreach operation is authorized by merging this document.
