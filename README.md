# Photocalia

[![Live Demo](https://img.shields.io/badge/Live_Demo-photocalia.com-00D4AA?style=for-the-badge)](https://photocalia.com)
[![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-9C27B0?style=for-the-badge)](public/assets/manifest.json)

AI-powered image/PDF to calendar conversion SaaS built with Angular 21+. Transforms images containing calendar info into downloadable `.ics` files using Google Gemini, with drag & drop upload, batch processing, event editing, and PWA support.

Backend: [3dime-api](https://github.com/m-idriss/3dime-api) (Quarkus REST API)

## Quick Start

**Prerequisites:** Node.js 20+, npm 10+

```bash
npm install
npm start
# Open http://localhost:4200/
```

For Firebase setup (required for the converter): see [Firebase Auth Setup](docs/FIREBASE_AUTH_SETUP.md)

## Commands

```bash
npm start                                    # Dev server (http://localhost:4200)
npm test                                     # Unit tests
npm run build -- --configuration=production  # Production build
firebase deploy --only hosting               # Deploy to Firebase
```

## Project Structure

```
src/app/
├── components/    # UI components (converter, calendar-view, etc.)
├── services/      # Data services (auth, converter, calendar-state)
├── models/        # TypeScript interfaces
└── app.ts         # Main application
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and technical overview |
| [Installation](docs/INSTALLATION.md) | Detailed setup instructions |
| [Services](docs/SERVICES.md) | Service APIs and data management |
| [API Reference](docs/API.md) | Backend API endpoints |
| [Deployment](docs/DEPLOYMENT.md) | Production deploy and CI/CD |
| [Testing](docs/TESTING.md) | Unit tests, API tests, CI |
| [Firebase Auth](docs/FIREBASE_AUTH_SETUP.md) | Firebase authentication setup |
| [Roadmap](docs/ROADMAP.md) | Planned features and timeline |
| [Full Index](docs/README.md) | All documentation |

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Idriss** — [photocalia.com](https://photocalia.com) | [@m-idriss](https://github.com/m-idriss)
