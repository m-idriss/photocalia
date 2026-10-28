# Synthetic core-journey QA

Run the dedicated suite with the installed project dependencies and Chromium:

```sh
npm run qa:core:list
npx playwright install chromium
npm run qa:core
```

The list command is discovery only. A local Playwright exit code alone is not inventory qualification; verify the case counts too. A real successful run must execute **exactly ten cases**, with no skips or retries. The GitHub job reports collected/passed/failed/skipped counts and a scenario table, and fails if inventory is missing, incomplete, skipped, or unexpectedly failing.

## Coverage inventory

1. Signed-out upload gating without a real authentication-provider login.
2. English timed/all-day golden calendar upload, review, edit, and ICS download.
3. French-language golden calendar data round trip.
4. DST/timezone boundary golden calendar data round trip.
5. A 390 px viewport upload/download flow and overflow check.
6. Unsupported input rejected without conversion.
7. Oversized input rejected using the current application's upload limit.
8. Controlled 503 error, retained input, and recovery on explicit user retry.
9. Quota-exhausted batch stopped without checkout or additional conversion.
10. Browser request-policy probes, including popup navigation and WebSockets.

Existing golden fixtures are read-only. Calendar responses are synthesized in memory from their expected values and downloads are parsed with the existing calendar library. This checks UI and serialization behavior; it does not measure document recognition or model accuracy. The existing development-only synthetic identity is not a real Google/Firebase login. Provider authentication, backend behavior, and real payment processing are outside this suite.

## Isolation and request policy

`playwright.qa.config.ts` fixes the server at `http://127.0.0.1:4202`, starts a fresh Angular development server, disables HMR/live reload, and refuses conflicting target-URL environment overrides. CI never reuses an existing server. Each test has a fresh browser context; service workers, traces, and video are disabled.

The shared fixture installs context-level HTTP and WebSocket guards before navigation, including popup requests. Only the exact loopback page origin at `/` or `/ng-cli-ws` may use a development WebSocket, preserving compatibility when the new specs are run with the default local Playwright configuration. The dedicated QA configuration disables HMR/live reload, so it does not need that connection. It fulfills only an explicit method/path list on the existing loopback API origin or the selected local page origin. Unknown API paths, even under the page's origin, cannot fall through to a real backend. Unexpected external service requests are aborted and fail the test. Counts and origins are recorded without payloads, query strings, credentials, or authentication state.

Application assets are fetched only from the exact configured loopback origin without following redirects. External preconnect/DNS-prefetch hints are removed from the test document; the application's CSP is retained. The existing cal-heatmap CSS URL is fulfilled with empty local CSS. The exact PDF worker URL matching the installed dependency version is fulfilled with the installed worker file, so the PDF golden cases need no CDN access. The exact release-display URL is fulfilled with synthetic release metadata. No general external-host allowlist is present.

The guard regression checks policy decisions for real production/auth/payment origin shapes without making requests to those origins. Browser probes use reserved `.invalid` hosts and are expected to be aborted; real service hosts are never contacted by those probes. Explicit probe origins are accepted only as deliberately blocked events, never as network destinations.

Browser routing is not a process-wide network sandbox. The server still executes local repository code; its development API destination is loopback. Dependency and browser installation require their normal package-network access. Do not provide production secrets to this job or interpret this suite as proof that arbitrary server-side code cannot access a network.

An optional `QA_CHROMIUM_EXECUTABLE_PATH` may point to an absolute, preinstalled local browser path for workspace validation. CI uses Playwright's installed browser by default. This option changes only the browser executable, not the target origin.

## Execution limits and evidence

The suite uses one Chromium worker, zero retries, a 45-second test timeout, and a ten-minute global timeout. The separate GitHub job is limited to fifteen minutes and `contents: read`. Actions are pinned by verified full SHAs; checkout does not persist credentials. There are no secret references or deployment steps in the new job.

Reports live under `test-results/qa/` and `playwright-report/qa/`, both already ignored by Git. GitHub retains synthetic reports and failure screenshots for three days. No HAR, trace archive, video, real session state, environment file, or customer document is captured. These reports contain synthetic test data only.

## CI and release behavior

The additive `Core journey QA (synthetic data)` job uses the existing frontend workflow's PR/manual triggers. Existing frontend and upstream-contract jobs are unchanged. The new job is **not automatically a required branch check**. The owner must review a complete passing run and separately require that exact context before claiming it blocks production merges.

This work does not authorize a merge or production deployment. Frontend main merges currently trigger automatic production deployment, so implementation stays in a draft PR until explicitly authorized. No autonomous QA agent or daily agent schedule is activated, and no model request is needed.

Task: [QA-001](https://github.com/m-idriss/photocalia-agents/issues/5).
