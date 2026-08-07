# Installation and local setup

Status: Angular frontend setup as of 7 August 2026.

## Prerequisites

- Node.js 22.22.3 or newer in the Node 22 line
- npm 10 or newer
- Git
- Chrome/Chromium for the browser test suite

## Install and verify

```bash
git clone https://github.com/m-idriss/photocalia.git
cd photocalia
npm ci
npm run verify:frontend
```

`npm ci` uses the locked dependency graph. Do not use a production secret in a local environment file.

## Start the frontend

```bash
npm start
```

The application is available at `http://localhost:4200`. The default development environment calls the backend at `http://localhost:8080/v1`.

## Environment files

Use these committed templates:

- `src/environments/environment.example.ts`
- `src/environments/environment.prod.example.ts`

The required public client configuration includes the API base URL and Firebase web-app settings. Firebase web configuration identifies the project but is not a server credential. AI-provider, Notion, Stripe and Firebase service credentials belong only in backend/provider secret storage.

## External dependencies

This repository contains the frontend only:

- Firebase Authentication provides Google Sign-In.
- The separately operated Quarkus backend provides conversion, quotas, subscriptions and donation endpoints.
- Vercel hosts the production frontend.

To run the full conversion flow locally, start an authorized checkout of `3dime-api` separately and follow that repository's setup. Backend deployment is not performed from this frontend repository.

## Useful checks

```bash
npm run lint
npm run test:ci
npm run build:ci
npm run blog:check
```

See [DEVELOPMENT.md](DEVELOPMENT.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [API.md](API.md) for the current project boundaries.
