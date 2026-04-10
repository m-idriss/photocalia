<div align="center">

<img src="public/assets/logo.png" alt="Photocalia Logo" width="120" />

<h1>Photocalia</h1>

<h3>Turn any image or PDF into calendar events — instantly ✨</h3>

<a href="https://photocalia.com"><img src="https://img.shields.io/badge/Live_Demo-photocalia.com-00D4AA?style=for-the-badge" alt="Live Demo" /></a>
<a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" /></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" /></a>
<a href="public/assets/manifest.json"><img src="https://img.shields.io/badge/PWA-Ready-9C27B0?style=for-the-badge" alt="PWA Ready" /></a>

<p><strong>Stop typing events by hand.</strong> Photocalia reads your schedules, flyers, and timetables and delivers a ready-to-import <code>.ics</code> file in seconds — compatible with Google Calendar, Apple Calendar, Outlook, and more.</p>

<p><a href="https://photocalia.com">🚀 Try it free at photocalia.com</a></p>

<hr/>

<img src="public/assets/screenshots/iPhone_13_Pro_Max.jpeg" alt="Photocalia in action" width="375" />

<p><em>Drop an image. Get a calendar. Done.</em></p>

<p>📝 Screenshots are automatically refreshed daily via GitHub Actions.</p>

</div>

---

## ✨ Why Photocalia?

| Feature | Details |
|---------|---------|
| 🤖 **AI-Powered Extraction** | GPT-4 Vision reads dates, times, titles, and locations from any image or PDF |
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
