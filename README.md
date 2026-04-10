<div align="center">

<img src="public/assets/logo.png" alt="Photocalia Logo" width="120" />

# Photocalia

### Turn any image or PDF into calendar events — instantly ✨

[![Live Demo](https://img.shields.io/badge/Live_Demo-photocalia.com-00D4AA?style=for-the-badge)](https://photocalia.com)
[![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-9C27B0?style=for-the-badge)](public/assets/manifest.json)

**Stop typing events by hand.** Photocalia reads your schedules, flyers, and timetables and delivers a ready-to-import `.ics` file in seconds — compatible with Google Calendar, Apple Calendar, Outlook, and more.

[🚀 Try it free at photocalia.com](https://photocalia.com)

---

<img src="public/assets/screenshots/iPhone_13_Pro_Max.jpeg" alt="Photocalia in action" width="375" />

*Drop an image. Get a calendar. Done.*

> 📝 Screenshots are automatically refreshed daily via GitHub Actions.

</div>

---

## ✨ Why Photocalia?

| Feature | Details |
|---------|---------|
| 🤖 **AI-Powered Extraction** | Google Gemini reads dates, times, titles, and locations from any image or PDF |
| 📅 **One-Click ICS Export** | Download a standard `.ics` file compatible with every major calendar app |
| ✏️ **Edit Before You Export** | Review and tweak events before committing to your calendar |
| 📦 **Batch Processing** | Upload multiple files at once and convert them in a single run |
| 📱 **PWA — Works Offline** | Install on your phone or desktop and use it like a native app |
| 🌐 **Responsive Design** | Polished experience on mobile, tablet, and desktop |

Backend: [3dime-api](https://github.com/m-idriss/3dime-api) (Quarkus REST API)

## Quick Start

**Prerequisites:** Node.js 20+, npm 10+

```bash
npm install       # Install dependencies
npm start         # Dev server → http://localhost:4200
npm test          # Unit tests
npm run build -- --configuration=production  # Production build
firebase deploy --only hosting               # Deploy to Firebase
```

For Firebase setup (required for the converter): see [Firebase Auth Setup](docs/FIREBASE_AUTH_SETUP.md)

## Documentation

[Architecture](docs/ARCHITECTURE.md), [Installation](docs/INSTALLATION.md), [Services](docs/SERVICES.md), [API Reference](docs/API.md), [Deployment](docs/DEPLOYMENT.md), [Testing](docs/TESTING.md), [Firebase Auth](docs/FIREBASE_AUTH_SETUP.md), [Roadmap](docs/ROADMAP.md), [Full Index](docs/README.md)

---

MIT License — **Idriss** · [photocalia.com](https://photocalia.com) · [@m-idriss](https://github.com/m-idriss)
