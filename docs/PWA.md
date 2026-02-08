# Progressive Web App (PWA) Documentation

This document provides comprehensive information about the PWA implementation in Photocalia.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Technical Implementation](#technical-implementation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

Photocalia is a fully functional Progressive Web App that provides an app-like experience on mobile and desktop devices. Users can install it on their home screen and use it like a native application, with offline support and the ability to share files directly from other apps.

## Features

### ✅ Service Worker

The app uses Angular Service Worker for intelligent caching:

- **App Shell Caching**: Critical app files (HTML, CSS, JS) are cached immediately
- **Lazy Asset Loading**: Images and media are cached on-demand
- **API Caching**: API responses are cached with a 1-hour expiry for better performance
- **Background Sync**: Service worker handles updates in the background

**Configuration**: `ngsw-config.json`

### ✅ Installability

The app can be installed on any device:

- **iOS**: Add to Home Screen via Safari
- **Android**: Install App via Chrome
- **Desktop**: Install via Chrome, Edge, or other Chromium browsers
- **Standalone Display**: Runs in its own window without browser UI

**Configuration**: `public/assets/manifest.json` - `display: "standalone"`

### ✅ Share Target

Users can share images and PDFs from other apps directly to Photocalia:

```json
"share_target": {
  "action": "/",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "files": [
      {
        "name": "image",
        "accept": ["image/*", "application/pdf"]
      }
    ]
  }
}
```

When a file is shared, it opens the app and navigates to the Calendar Converter section.

### ✅ App Shortcuts

Long-press the app icon to access quick shortcuts:

- **Calendar Converter**: Direct access to the file conversion tool

**Configuration**: `public/assets/manifest.json` - `shortcuts` array

### ✅ Update Notifications

The app automatically detects new versions and prompts users to reload:

```typescript
// In src/app/app.ts
this.swUpdate.versionUpdates
  .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
  .subscribe(() => {
    if (confirm('New version available. Load new version?')) {
      window.location.reload();
    }
  });
```

### ✅ Offline Support

The app works offline for previously cached content:

- All app shell files (HTML, CSS, JS) are cached immediately
- Images and media are cached when first accessed
- API responses are cached with a 1-hour expiry

## Installation

### iOS (Safari)

1. Open the website in Safari (not Chrome or Firefox)
2. Tap the **Share** button (square with an arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if desired (default: "Photocalia")
5. Tap **"Add"** in the top right

The app icon will appear on your home screen and launch in standalone mode.

**Note**: iOS requires Safari for PWA installation. Chrome and Firefox on iOS do not support PWA installation.

### Android (Chrome)

1. Open the website in Chrome
2. Tap the **menu** (⋮) in the top right corner
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Confirm the installation in the prompt

The app will be added to your home screen and app drawer.

**Alternative**: Chrome may show an automatic install banner at the bottom of the screen. Tap "Install" to proceed.

### Desktop (Chrome/Edge)

1. Open the website in Chrome or Edge
2. Look for the **install icon** (⊕ or computer with arrow) in the address bar
3. Click the icon and confirm installation
4. **Alternative**: Click the menu (⋮) → **"Install [app name]"**

The app will open in its own window and be added to your applications.

## Technical Implementation

### Architecture

```
PWA Components:
├── Service Worker (@angular/service-worker)
│   ├── ngsw-worker.js (generated)
│   ├── ngsw.json (generated config)
│   └── ngsw-config.json (source config)
├── Web App Manifest
│   └── public/assets/manifest.json
├── App Configuration
│   ├── src/app/app.config.ts (service worker provider)
│   └── src/app/app.ts (update checker & install handler)
└── Build Configuration
    └── angular.json (production service worker enable)
```

### Service Worker Registration

The service worker is registered in `src/app/app.config.ts`:

```typescript
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

**Key Points:**

- Only enabled in production builds (`!isDevMode()`)
- Registers after the app is stable (30 seconds)
- Uses Angular's optimized registration strategy

### Caching Strategy

Defined in `ngsw-config.json`:

1. **App Shell (Prefetch)**:
   - All critical files cached immediately on install
   - Includes HTML, CSS, JS, manifest
2. **Assets (Lazy)**:
   - Images, videos, fonts cached on first access
   - Reduces initial install size
3. **API (Performance)**:
   - API responses cached for 1 hour
   - Network-first with fallback to cache
   - Maximum 50 cached responses

### Install Prompt Handler

Custom install prompt in `src/app/app.ts`:

```typescript
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  this.deferredPrompt = e;
  console.log('PWA install prompt available');
});
```

This allows for custom install UI in the future.

## Configuration

### Manifest Configuration

File: `public/assets/manifest.json`

Key properties:

```json
{
  "name": "Photocalia - AI Calendar Converter",
  "short_name": "Photocalia",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#000000",
  "icons": [...],
  "shortcuts": [...],
  "share_target": {...}
}
```

**Customization:**

- `name`: Full app name (max 45 characters)
- `short_name`: Home screen name (max 12 characters)
- `theme_color`: Status bar color on mobile
- `background_color`: Splash screen background

### Service Worker Configuration

File: `ngsw-config.json`

```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|png|jpg|...)"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": ["https://*.photocalia.com/**", "https://*.a.run.app/**"],
      "cacheConfig": {
        "maxSize": 50,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "performance"
      }
    }
  ]
}
```

**Customization:**

- Add more asset patterns to cache
- Adjust API cache duration (`maxAge`)
- Change cache strategy (`performance` or `freshness`)

### Icons

Required icon sizes:

- **16x16**: Browser favicon
- **192x192**: Android app icon, iOS app icon
- **512x512**: High-res app icon, splash screen

All icons located in `public/assets/icons/`

**Icon Requirements:**

- PNG format
- Square aspect ratio
- Transparent or white background
- Purpose: `"any maskable"` for adaptive icons

## Testing

### Local Testing

1. **Build for production** (service worker only works in production):

   ```bash
   npm run build -- --configuration=production
   ```

2. **Serve the build** with a simple HTTP server:

   ```bash
   # Note: Your build output directory may vary. Check the build output for the actual path.
   npx http-server dist/Photocalia/browser -p 8080
   ```

3. **Open in browser**: <http://localhost:8080>

4. **Test PWA features**:
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered
   - Check Cache Storage for cached files
   - Test offline mode (DevTools → Network → Offline)

### Testing Installation

**Chrome DevTools:**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the sidebar
4. Verify all manifest properties are correct
5. Click **Service Workers** and verify registration
6. Use **Update on reload** for development testing

**Lighthouse Audit:**

1. Open DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App** category
4. Click **Generate report**
5. Review PWA score and recommendations

### Testing Offline Functionality

1. Install the app locally (see above)
2. Visit the app to cache initial content
3. Open DevTools → Network tab
4. Enable **Offline** mode
5. Refresh the page - app should still work
6. Navigate to cached pages - should load from cache

### Testing Share Target

**Desktop Chrome:**

1. Install the app locally
2. Find an image file
3. Right-click → Share → Select Photocalia

**Android:**

1. Deploy to a real domain with HTTPS
2. Install the app from Chrome
3. Open Gallery/Photos app
4. Select an image → Share → Select Photocalia
5. App should open with the file ready for conversion

**Note**: Share target requires **HTTPS protocol** (either a real domain with SSL or localhost with proper certificates). Standard HTTP or localhost without SSL won't work.

## Troubleshooting

### Service Worker Not Registering

**Symptoms**: No service worker in DevTools → Application → Service Workers

**Solutions**:

1. Verify you're running a **production build**:
   ```bash
   npm run build -- --configuration=production
   ```
2. Service workers require **HTTPS** (or localhost)
3. Check console for registration errors
4. Verify `ngsw-worker.js` exists in build output

### Install Prompt Not Showing

**Symptoms**: No install banner or button appears

**Solutions**:

1. **iOS**: Must use Safari, not Chrome
2. **Android**: Already installed apps won't show prompt
3. **Desktop**: Install icon appears in address bar
4. Check manifest validation in DevTools → Application → Manifest
5. Ensure all required manifest fields are present
6. Verify icons are accessible and correct sizes

### App Not Working Offline

**Symptoms**: White screen or errors when offline

**Solutions**:

1. Visit all pages while online to cache them
2. Check DevTools → Application → Cache Storage
3. Verify files are being cached by service worker
4. Check `ngsw-config.json` asset patterns
5. Rebuild and reinstall the app

### Share Target Not Working

**Symptoms**: App doesn't appear in share menu

**Solutions**:

1. Verify app is **installed** (not just bookmarked)
2. Must use **HTTPS** (share target doesn't work on localhost)
3. Check manifest `share_target` configuration
4. On iOS: Share target is **not supported** (iOS limitation)
5. On Android: Clear cache and reinstall the app

### Update Not Detected

**Symptoms**: New version deployed but app doesn't prompt for update

**Solutions**:

1. Service worker updates check periodically (every 24 hours)
2. Force update: DevTools → Application → Service Workers → Update
3. Close all tabs and reopen to trigger update check
4. Verify `ngsw.json` has a new timestamp
5. Check network tab for update requests

### Cache Not Clearing

**Symptoms**: Old content still showing after updates

**Solutions**:

1. Unregister service worker: DevTools → Application → Service Workers → Unregister
2. Clear cache: DevTools → Application → Clear Storage → Clear site data
3. Rebuild with new version number
4. Force refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

## Best Practices

### Development

1. **Always test production builds** - Service worker only works in production
2. **Use Chrome DevTools** - Best PWA debugging experience
3. **Test on real devices** - Emulators may not accurately reflect PWA behavior
4. **Version your builds** - Include version in manifest or HTML for easier debugging

### Deployment

1. **Use HTTPS** - Required for service workers
2. **Set proper cache headers** - Don't cache service worker file (ngsw-worker.js)
3. **Monitor service worker updates** - Ensure new versions deploy correctly
4. **Test all features** - Install, offline, share target, shortcuts

### Maintenance

1. **Update icons regularly** - Match your branding
2. **Review cache strategy** - Adjust based on usage patterns
3. **Monitor cache size** - Large caches can slow down the app
4. **Test on multiple browsers** - Safari, Chrome, Firefox, Edge

## Resources

- [Angular Service Worker Guide](https://angular.io/guide/service-worker)
- [Web.dev PWA Guide](https://web.dev/learn/pwa)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Builder](https://www.pwabuilder.com/) - Test and improve your PWA
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Audit your PWA

## Support

For issues or questions about PWA implementation:

1. Check this documentation
2. Review the [troubleshooting section](#troubleshooting)
3. Open an issue on GitHub with:
   - Browser and OS version
   - Steps to reproduce
   - Console errors
   - Service worker status (from DevTools)
