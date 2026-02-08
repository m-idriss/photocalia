# Installation & Setup Guide

> Complete guide to setting up Photocalia for development

## Prerequisites

### Required Software
- **Node.js**: 20+ (Functions require Node 22 but work with 20)
- **npm**: 10+
- **Git**: For version control

### Optional Software
- **Chrome/Chromium**: For testing (headless mode)
- **Firebase CLI**: For deploying Firebase Functions
- **Bruno**: For API testing

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/m-idriss/Photocalia.git
cd Photocalia
```

### 2. Install Dependencies

```bash
# Install main dependencies (takes ~30 seconds)
npm install

# Optional: Install Firebase Functions dependencies
cd functions && npm install && cd ..
```

### 3. Verify Installation

```bash
# Build the project to verify everything is set up correctly
npm run build
```

Expected output:
- Build completes in ~14 seconds
- Warnings about bundle size are normal
- Output in `dist/Photocalia/` directory

## Development Server

### Start the Server

```bash
# Start development server (runs on http://localhost:4200/)
npm start

# OR using Angular CLI directly
ng serve
```

The server starts in ~4 seconds and runs with hot reload enabled.

### Access the Application

Open your browser and navigate to:
```
http://localhost:4200/
```

The application automatically reloads when you modify source files.

### Development Features

- **Hot Reload**: Automatic refresh on file changes
- **Source Maps**: For debugging TypeScript
- **Error Overlay**: Build errors shown in browser
- **Fast Refresh**: Preserves component state when possible

## Configuration

### Content Customization

Update your personal information in the component files:

1. **Profile Card**: `src/app/components/profile-card/`
2. **About Section**: `src/app/components/about/`
3. **Tech Stack**: `src/app/components/tech-stack/`
4. **Experience**: `src/app/components/experience/`
5. **Education**: `src/app/components/education/`
6. **Contact**: `src/app/components/contact/`

### Styling Customization

Customize the theme in `src/styles.scss` using CSS custom properties:

```scss
:root {
  --primary-color: #00d4aa;
  --accent-color: #3b82f6;
  --background: #000000;
  --glass-bg: rgba(255, 255, 255, 0.1);
}
```

For detailed design customization, see [Design System Documentation](./DESIGN_SYSTEM.md).

### Environment Variables

The application uses environment files for configuration:
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

**⚠️ Important**: Never commit secrets, API keys, or credentials to the repository!

#### Development Environment

Use example files as templates:
1. Create environment files from examples
2. Configure with your local settings
3. Add to `.gitignore` (already configured)

#### Production Environment

Use platform-specific configuration:
- **Netlify/Vercel**: Environment variables in dashboard
- **Firebase**: Use Firebase config and secrets
- **GitHub Actions**: Repository secrets

## API Integration

### Firebase Authentication

The Calendar Converter requires Firebase Authentication with Google provider.

**Quick Setup:**
1. Create Firebase project in [Firebase Console](https://console.firebase.google.com)
2. Enable Google authentication provider
3. Add Firebase config to environment files
4. Configure authorized domains

See [Firebase Authentication Setup Guide](./FIREBASE_AUTH_SETUP.md) for detailed instructions.

### Notion Integration

For the Stuff section (recommended tools):
1. Set up Notion API credentials
2. Configure Firebase Functions in `functions/src/`
3. Deploy Firebase Functions for API endpoints

See [API Documentation](./API.md) for details.

### GitHub API

The GitHub Activity section uses the GitHub API:
- No authentication required for public profiles
- Rate limited to 60 requests/hour without auth
- Consider adding authentication for higher limits

## Firebase Functions Setup

### Prerequisites
- Firebase CLI installed globally
- Firebase project created

### Installation

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Install Functions dependencies
cd functions && npm install
```

### Configuration

Set up secrets for API keys:

```bash
# OpenAI API key (for Calendar Converter)
firebase functions:secrets:set OPENAI_API_KEY

# GitHub token (for API proxy)
firebase functions:secrets:set GITHUB_TOKEN

# Notion credentials (for Stuff section)
firebase functions:secrets:set NOTION_TOKEN
firebase functions:secrets:set NOTION_DATASOURCE_ID
```

### Build Functions

```bash
cd functions
npm run build
```

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:converterFunction
```

See [Firebase Functions Documentation](../functions/README.md) for more details.

## Progressive Web App (PWA) Setup

The application includes full PWA support with service workers.

### PWA Features
- 🔄 **Service Worker** - Automatic caching and offline support
- 📱 **Installable** - Add to home screen on mobile and desktop
- 📤 **Share Target** - Share images/PDFs directly to converter
- ⚡ **App Shortcuts** - Quick access to features
- 🔔 **Update Notifications** - Automatic version detection

### Configuration Files
- `ngsw-config.json` - Service worker caching strategy
- `public/assets/manifest.json` - App manifest with icons and shortcuts
- `angular.json` - Build configuration with service worker enabled

### Testing PWA Locally

```bash
# Build for production (enables service worker)
npm run build -- --configuration=production

# Serve the production build
npx http-server dist/Photocalia/browser -p 8080

# Open http://localhost:8080 and test PWA features
```

See [PWA Documentation](./PWA.md) for installation instructions and feature details.

## Troubleshooting

### Common Issues

#### `ng: not found`
**Solution**: Ensure dependencies are installed:
```bash
npm install
```

#### Build Warnings
**Issue**: Bundle size warnings appear during build

**Solution**: These warnings are expected and tracked. The app is optimized but has rich features. Future optimizations planned.

#### Port Already in Use
**Issue**: Port 4200 is already in use

**Solution**: Either stop the other process or use a different port:
```bash
ng serve --port 4201
```

#### Firebase Functions Not Working
**Issue**: Functions fail to deploy or run locally

**Solution**:
1. Check Node.js version (20+ required)
2. Verify Firebase CLI is installed
3. Ensure secrets are set correctly
4. Check function logs: `firebase functions:log`

#### Test Failures
**Issue**: Some tests fail with HttpClient errors

**Solution**: This is expected. Tests require HttpClient provider setup which is in progress. Tests execute successfully but some show errors.

### Getting Help

If you encounter issues:

1. **Check Documentation**: Search docs for your issue
2. **GitHub Issues**: Check existing issues
3. **Create Issue**: Open new issue with details
4. **Community**: Use GitHub Discussions

## Next Steps

After installation:

1. **Explore Components**: Review [Component Documentation](./COMPONENTS.md)
2. **Understand Services**: Read [Services Documentation](./SERVICES.md)
3. **Learn Design System**: Study [Design System](./DESIGN_SYSTEM.md)
4. **Start Contributing**: Follow [Contributing Guidelines](../CONTRIBUTING.md)

## Quick Reference

```bash
# Development
npm start                 # Start dev server
npm run build            # Build for production
npm test                 # Run tests

# Firebase
firebase deploy          # Deploy all
firebase emulators:start # Run locally

# Code Quality
npx prettier --write src/  # Format code
```

---

**Related Documentation:**
- [Development Guidelines](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
