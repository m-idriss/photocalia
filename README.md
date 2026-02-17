<div align="center">

# 🌟 Photocalia

<img src="public/assets/logo.png" alt="Photocalia Logo" width="120" height="120"/>

### ✨ AI-Powered Calendar Converter ✨

*A sophisticated Angular 21+ SaaS application featuring an AI-powered image/PDF to calendar conversion tool*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-photocalia.com-00D4AA?style=for-the-badge)](https://photocalia.com)
[![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-9C27B0?style=for-the-badge)](public/assets/manifest.json)

---

</div>

## 🎯 Overview

Photocalia is a modern, high-performance calendar conversion SaaS built with Angular 21+. The application features an **AI-powered Calendar Converter** that transforms images and PDFs containing calendar information into downloadable ICS files using GPT-4 Vision.

**Key Technologies**: Angular 21.1+ standalone components, TypeScript 5.9+, OpenAI GPT-4 Vision, External API Backend (3dime-api), Progressive Web App capabilities.

## ✨ Key Features

### 📅 **AI Calendar Converter**

Transform images and PDFs into calendar events instantly!

- **🧠 GPT-4 Vision AI** - Intelligent extraction of dates, times, and event details
- **📤 Drag & Drop Upload** - Supports JPG, PNG, and PDF files
- **📦 Batch Processing** - Process multiple files with progress tracking
- **✏️ Event Editing** - Edit or delete events before downloading
- **📄 PDF Support** - Automatic PDF-to-image conversion using PDF.js
- **📅 ICS Export** - Download calendar files compatible with Google Calendar, Outlook, Apple Calendar
- **🔐 Secure Authentication** - Firebase Google Sign-In for API access
- **📱 PWA Share Target** - Share images from other apps directly to the converter

**[📖 Full Converter Documentation →](docs/CONVERTER.md)**

### 🎨 **Modern SaaS Design**
- **Glassmorphism UI** - Stunning frosted glass effects with modern aesthetics
- **Responsive Layout** - Flawless experience across all devices
- **Smooth Animations** - Subtle micro-interactions and fluid transitions
- **PWA Ready** - Installable, works offline, app-like experience

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Angular 21.1, TypeScript 5.9, RxJS 7.8, SCSS |
| **AI Integration** | OpenAI GPT-4 Vision (gpt-4o), PDF.js for PDF processing |
| **Backend** | External API ([3dime-api](https://github.com/m-idriss/3dime-api)), Firebase Authentication |
| **PWA** | Service Worker, Web App Manifest, Offline Support |
| **Build Tools** | Angular CLI 21.1, esbuild, Karma + Jasmine |
| **Deployment** | Firebase Hosting, GitHub Actions CI/CD |
| **APIs** | GitHub API, Firebase |

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/m-idriss/photocalia.git
cd photocalia
npm install

# Start development server
npm start
# Open http://localhost:4200/

# Build for production
npm run build -- --configuration=production
```

### Prerequisites
- Node.js 20+
- npm 10+

**[📖 Detailed Setup Guide →](docs/INSTALLATION.md)**

## ⚙️ Configuration

### Customization

Customize the theme in `src/styles.scss` using CSS custom properties:

```scss
:root {
  --primary-color: #00d4aa;
  --accent-color: #3b82f6;
  --background: #000000;
  --glass-bg: rgba(255, 255, 255, 0.1);
}
```

### Firebase Setup (Required for Calendar Converter)

1. Create Firebase project in [Firebase Console](https://console.firebase.google.com)
2. Enable Google authentication provider
3. Add Firebase config to environment files
4. Set OpenAI API key as Firebase secret

**[📖 Complete Setup Guide →](docs/FIREBASE_AUTH_SETUP.md)**

**[📖 Firebase Emulator Setup →](EMULATOR_SETUP.md)** - Configure local development environment

### PWA Features

- 📱 Installable on mobile and desktop
- 📤 Share images/PDFs from other apps to converter
- ⚡ Quick access shortcuts
- 🔄 Offline support

**[📖 PWA Installation Guide →](docs/PWA.md)**

## 🔒 Security

⚠️ **Never commit secrets, API keys, or credentials to the repository!**

- Use Firebase secrets for backend API keys
- Configure environment variables in deployment platform
- Restrict API keys to specific domains
- Store CI/CD secrets in GitHub repository settings

**[📖 Security Guidelines →](SECURITY.md)**

## 🌐 Deployment

### Quick Deploy

```bash
# Build for production
npm run build -- --configuration=production

# Deploy to Firebase
firebase deploy --only hosting
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages, Firebase
- **Auto Deploy**: GitHub Actions (configured for FTP)
- **Server Configuration**: `.htaccess` and `_redirects` included automatically

**[📖 Complete Deployment Guide →](docs/DEPLOYMENT.md)**

## 🧪 Testing

```bash
# Run unit tests (90 tests)
npm test

# Run in headless mode (CI)
CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false

# Run API tests with Bruno
bru run bruno-collections/photocalia-api
```

**[📖 Complete Testing Guide →](docs/TESTING.md)**

## 📚 Documentation

### 🎯 Start Here
- **[System Architecture](ARCHITECTURE.md)** - **⭐ Complete technical overview**
- **[Installation Guide](docs/INSTALLATION.md)** - Complete setup instructions
- **[Calendar Converter](docs/CONVERTER.md)** - AI conversion feature details

### Essential Guides
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to production
- **[PWA Guide](docs/PWA.md)** - Progressive Web App features
- **[Development Guidelines](docs/DEVELOPMENT.md)** - Workflow and best practices

### Technical Docs
- **[Components](docs/COMPONENTS.md)** - Component architecture
- **[Services](docs/SERVICES.md)** - Service APIs
- **[Design System](docs/DESIGN_SYSTEM.md)** - Styling and theming
- **[API Reference](docs/API.md)** - Backend API endpoints
- **[Testing Guide](docs/TESTING.md)** - Testing strategies

### Additional Resources
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Project Roadmap](ROADMAP.md)** - Future features and timeline
- **[Security Policy](SECURITY.md)** - Security guidelines

**[📖 Full Documentation Index →](docs/README.md)**

## 📸 Screenshots

<div align="center">

### 📅 AI Calendar Converter

![Photocalia Desktop Screenshot](public/assets/screenshots/desktopPage1920x1080.jpeg)
*Transform images and PDFs into calendar events with AI-powered extraction*

### 📱 Mobile Experience

<img src="public/assets/screenshots/iPhone_13_Pro_Max.jpeg" alt="Photocalia Mobile Screenshot" width="375" />

*Fully responsive design optimized for all devices*

> 📝 **Note**: Screenshots are automatically updated daily via GitHub Actions.

</div>



## 🏗️ Architecture

**Modern Angular Stack:**
- Standalone components with TypeScript strict mode
- RxJS for reactive data streams
- SCSS with CSS custom properties for theming
- External backend API (3dime-api) for AI processing
- Service Worker for PWA capabilities

**Project Structure:**
```
src/app/
├── components/          # UI components (converter, calendar-view, etc.)
├── services/           # Data services (auth, converter, calendar-state)
├── models/             # TypeScript interfaces
└── app.ts              # Main application
```

**[📖 Complete System Architecture →](ARCHITECTURE.md)** - Comprehensive technical documentation  
**[📖 Component Details →](docs/COMPONENTS.md)** - Individual component documentation

## 📊 Performance

- ⚡ **Build Time**: ~9 seconds (optimized with esbuild)
- 📦 **Bundle Size**: 1.03 MB raw / 229 KB transferred (50%+ improvement)
- 🧪 **Tests**: 90 unit tests, all passing ✅
- 🚀 **Load Time**: < 3 seconds on 3G
- ♿ **Accessibility**: WCAG AA compliant
- 🔍 **SEO**: Optimized meta tags

## 🤝 Contributing

Contributions are welcome! 

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m '✨ Add amazing feature'`
4. Push and open a Pull Request

**[📖 Contributing Guidelines →](CONTRIBUTING.md)**

## 👨‍💻 Author

**Idriss**

🌐 [photocalia.com](https://photocalia.com) • 💼 [LinkedIn](https://www.linkedin.com/in/i-mohamady/) • 🐙 [GitHub](https://github.com/m-idriss)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision API
- Angular team for the amazing framework
- Firebase for hosting and functions
- The open-source community

---

<div align="center">

**Made with ❤️ using Angular 21+ and TypeScript**

*Modern SaaS architecture • AI-powered conversion • Progressive Web App*

[![Star this repo](https://img.shields.io/github/stars/m-idriss/photocalia?style=social)](https://github.com/m-idriss/photocalia)
[![Follow @m-idriss](https://img.shields.io/github/followers/m-idriss?label=Follow&style=social)](https://github.com/m-idriss)

</div>
