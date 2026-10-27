# Frontend/backend API contract synchronization

## Checks and scope

Frontend CI runs a separate **Upstream API contract drift** job on its existing pull-request and manual triggers. It compares `contracts/3dime-api/openapi-v1.json` with the public `m-idriss/3dime-api` contract at `contracts/openapi-v1.json`.

The job resolves backend `main` once to an exact commit SHA, then reads the contract at that SHA. Its summary records both repositories, revision SHAs, paths, job/comparison result, and an offline reproduction command. Later upstream commits do not change evidence for an already completed run.

The comparator checks JSON equality while ignoring whitespace and object-key order. Numeric literals are compared as exact normalized decimal values, including integers beyond the floating-point safe range; equivalent notations such as `1000.0` and `1e3` remain equal. Numeric literals longer than 4096 characters fail closed. Array order is significant, including `required` and enum arrays. This intentionally conservative check detects any JSON change; it is not a classification of backward compatibility. It reports up to ten JSON-pointer locations and reasons, without schema values or entire documents. This complements `npm run contracts:check`, which verifies required frontend operations and generated TypeScript types against the local snapshot.

## Offline reproduction

Check out the exact frontend and backend SHAs shown in the failed job's summary in separate local directories, then run from the frontend checkout:

```sh
npm run contracts:upstream:test
npm run contracts:upstream -- contracts/3dime-api/openapi-v1.json ../3dime-api/contracts/openapi-v1.json
npm run contracts:check
```

The two explicit paths can also reference offline copies of the same files. The comparator and its tests use only built-in Node.js modules; they do not install dependencies or call the network. The existing generated-type check requires the project's installed dependencies.

## When the gate fails

- **JSON drift:** review the changes at the recorded upstream SHA. An intentional backend change may block frontend CI until a separately reviewed frontend synchronization is prepared. Do not silently accept drift or substitute a stale fallback.
- **Unavailable evidence:** verify GitHub access and retry through a new workflow run after the problem is resolved. HTTP failures, missing files, malformed JSON, and oversized files fail rather than skip the gate. No raw API error bodies are logged.
- **Malformed local input:** repair only through a reviewed source change. Do not edit generated contracts merely to make the gate green.

After an intentional API change has been reviewed, use the existing synchronization workflow in a separate task:

```sh
# From the frontend checkout, using a reviewed backend checkout:
node scripts/update-api-contract.mjs ../3dime-api/contracts/openapi-v1.json
npm run contracts:generate
npm run contracts:check
```

The existing `contracts:update` script imports the backend snapshot and regenerates types. Review both outputs and test affected consumers before opening a draft PR. The drift gate never runs this updater. This task does not authorize changes to payment, subscription, donation, pricing, or entitlement behavior.

## Bounds and permissions

The new job has a five-minute timeout and `contents: read` permission only. Its checkout and Node setup Actions are pinned to verified full commit SHAs. Checkout does not persist credentials. A temporary GitHub token is used only for public GitHub evidence collection; no new secret or model call is needed. Each HTTP request has a 15-second timeout and a 1 MiB response limit. Comparison nesting is limited to 128 levels. Each local input is limited to 1 MiB, must be valid UTF-8 JSON, and must be a regular file containing an object.

The upstream file is kept in the runner's temporary directory, outside the frontend working tree. No backend code, dependencies, service, production API, or customer fixture is executed or accessed. No schema, generated type, payment setting, price, deployment, or schedule is modified by the gate.

A failing job makes the workflow fail. Making **Upstream API contract drift** a required branch-protection check is a separate repository setting; adding this workflow does not configure that setting. Existing frontend jobs and triggers are unchanged. Reverting the gate through normal code review removes it; nothing is auto-merged or deployed.

## Inspected baseline

At frontend `382b468792f18fd1de0e5c062b0d7768e87784a9` and backend `56572c7a0c54b88b182514c09e703e91413c51a9`, the snapshots contain 26 paths and are JSON-equivalent despite different formatting. The initial `npm run contracts:check` passed. See [CTO-001](https://github.com/m-idriss/photocalia-agents/issues/3) for the task scope.

## Automatic production deployments

`vercel.json` explicitly enables automatic Git deployments for `main` with `git.deploymentEnabled.main: true`. A merge to `main` triggers the existing Vercel Git integration to build and deploy the production version. Other branch deployment settings keep their default behavior, including previews.

The GitHub `protected` ruleset requires pull requests and the `Upstream API contract drift` and `Lint, test, and build` checks before merging. These checks gate changes entering `main`; they are not a separate post-merge approval step inside Vercel. The active ruleset must be maintained in GitHub settings.

Automatic production deployment was explicitly authorized by the project owner. This does not enable daily AI-agent schedules, backend deployments, payment changes, price changes, or access to customer data. The documented Vercel behavior is described in [Git configuration](https://vercel.com/docs/project-configuration/git-configuration).
