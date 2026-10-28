# Isolated local preview

This preview tests the interface and a persistent signed-in session without using the production Firebase project or backend. It uses the Firebase Authentication Emulator with the demo project `demo-photocalia-preview` and an in-memory fixture API. It does not authenticate a real Google account, perform AI conversions, or create checkout sessions.

## Run on the Mac

Use the installed Firebase CLI and open three terminals in the repository:

```sh
npm run preview:auth
```

```sh
npm run preview:api
```

```sh
npm run preview:mobile
```

Open `http://localhost:4201/fr`. A phone on the same Wi-Fi can use `http://<MAC-LAN-IP>:4201/fr`. Select **Essayer la connexion de test** to open the local demo account. The test-mode banner identifies this configuration.

The frontend proxies its authentication requests to the emulator on port 9099 and fixture requests to port 9098. The production Content Security Policy, Firebase authorized domains, production API URL and production environment file are unchanged. Restarting the emulator clears its in-memory accounts.

## Verify

With the three services running:

```sh
PHOTOCALIA_PREVIEW_URL=http://127.0.0.1:4201 npx playwright test e2e/preview-auth.spec.ts --workers=1
```

These browser checks exercise local sign-in/sign-out, persisted-session reload positioning and the touch menu, and reject requests to the production authentication/API hosts. They are skipped unless `PHOTOCALIA_PREVIEW_URL` is explicitly set.

Unit tests in `auth-preview.utils.spec.ts` verify that production builds and real Firebase projects cannot enable this mode. The normal `build:ci` command continues to use the production configuration; the preview environment is selected only by `--configuration=preview`.
