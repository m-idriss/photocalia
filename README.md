<div align="center">

<img src="public/assets/logo.png" alt="Photocalia Logo" width="120" />

<h1>Photocalia</h1>

<h3>Turn any image or PDF into calendar events — instantly ✨</h3>

<a href="https://www.photocalia.com"><img src="https://img.shields.io/badge/Production-photocalia.com-00D4AA?style=for-the-badge" alt="Production site" /></a>
<a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 22" /></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" /></a>
<a href="public/assets/manifest.json"><img src="https://img.shields.io/badge/PWA-Ready-9C27B0?style=for-the-badge" alt="PWA Ready" /></a>

<p><strong>Stop typing events by hand.</strong> Photocalia reads your schedules, flyers, and timetables and delivers a ready-to-import <code>.ics</code> file in seconds — compatible with Google Calendar, Apple Calendar, Outlook, and more.</p>

<p><a href="https://www.photocalia.com">🚀 Try PhotoCalia in production</a></p>

<hr/>

<img src="public/assets/screenshots/iPhone_13_Pro_Max.jpeg" alt="Photocalia in action" width="375" />

<p><em>Drop an image. Get a calendar. Done.</em></p>

<p>📝 Screenshots are automatically refreshed daily via GitHub Actions.</p>

</div>

---

## ✨ Why Photocalia?

| Feature | Details |
|---------|---------|
| 🤖 **AI-Powered Extraction** | Multimodal AI reads dates, times, titles, and locations from images and PDFs |
| 📅 **One-Click ICS Export** | Download a standard `.ics` file compatible with every major calendar app |
| ✏️ **Edit Before You Export** | Review and tweak events before committing to your calendar |
| 📦 **Batch Processing** | Upload multiple files at once and convert them in a single run |
| 📱 **PWA — Works Offline** | Install on your phone or desktop and use it like a native app |
| 🌐 **Responsive Design** | Polished experience on mobile, tablet, and desktop |

Backend: separately operated Quarkus REST API at `api.photocalia.com`. Access to the backend repository and its cloud resources must be transferred separately during an acquisition.

## Quick Start

**Prerequisites:** Node.js 22.22.3+, npm 10+

```bash
npm ci            # Install the exact locked dependency set
npm start         # Dev server → http://localhost:4200
npm run verify:frontend  # Blog integrity, lint, tests, production build, clean-tree check
```

The frontend deploys to Vercel from `main`. Firebase is used for Google authentication; the conversion API and Stripe checkout are external production dependencies.

## Documentation

[Current architecture](docs/ARCHITECTURE.md), [acquisition readiness](docs/ACQUISITION_READINESS.md), [deployment](docs/DEPLOYMENT.md), [testing](docs/TESTING.md), [Firebase Auth](docs/FIREBASE_AUTH_SETUP.md), [full index](docs/README.md)

---

MIT License — **Idriss** · [photocalia.com](https://www.photocalia.com) · [@m-idriss](https://github.com/m-idriss)
