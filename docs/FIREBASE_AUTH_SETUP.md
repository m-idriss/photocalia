# Firebase Authentication Setup

This guide explains how to set up Firebase Authentication with Google provider for the Calendar Converter feature.

## Prerequisites

- Firebase account ([console.firebase.google.com](https://console.firebase.google.com))
- Google Cloud project (created automatically with Firebase)

## Firebase Console Setup

### 1. Create/Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select your existing project (e.g., `your-project-name`)
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle to **Enable**
6. Set support email (your email)
7. Click **Save**

### 3. Configure Authorized Domains

1. In Authentication → Settings → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `photocalia.com` (for production)
   - Any other domains you'll deploy to

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon `</>`
4. Register your app (e.g., "Photocalia")
5. Copy the `firebaseConfig` object

Example config:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyC...', // Your API key
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.firebasestorage.app',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123def456',
};
```

## Application Configuration

### Update Environment Files

Update your environment configuration files with the Firebase config:

**`src/environments/environment.ts`** (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://api.3dime.com',
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
```

**`src/environments/environment.prod.ts`** (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.3dime.com',
  firebase: {
    apiKey: 'YOUR_PRODUCTION_API_KEY',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_PRODUCTION_APP_ID',
  },
};
```

### Security Notes

⚠️ **Important Security Considerations:**

1. **Firebase API Keys are Safe for Client-Side Use**
   - Firebase API keys for web apps are not secret
   - They identify your Firebase project to Google servers
   - Security is enforced by Firebase Security Rules and authorized domains

2. **Restrict API Keys (Recommended)**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Find your API key
   - Click "Edit API key"
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domains (e.g., `photocalia.com`, `*.photocalia.com`, `localhost:4200`)
   - Under "API restrictions", select "Restrict key" and enable only required APIs:
     - Identity Toolkit API
     - Token Service API

3. **Configure Authorized Domains**
   - Only whitelisted domains in Firebase Console can use authentication
   - This prevents unauthorized domains from using your Firebase project

4. **Never Commit Secrets**
   - While Firebase web config can be public, avoid committing it to Git if you prefer
   - Use environment variables or secret management for production
   - The example files have placeholder values

## Testing Authentication

### Development

1. Start the development server:

   ```bash
   npm start
   ```

2. Navigate to `http://localhost:4200/`

3. Scroll to the Calendar Converter section

4. Click "🔐 Sign in with Google"

5. Sign in with your Google account

6. After authentication:
   - User avatar and menu appear in top-right of converter card
   - Upload zone becomes available
   - You can upload and convert files

### Sign Out

1. Click the user avatar/menu button
2. Click "Sign Out" in the dropdown

## Authentication Flow

```
User clicks "Sign in with Google"
         ↓
Firebase opens Google Sign-In popup
         ↓
User selects Google account
         ↓
Google authenticates user
         ↓
Firebase returns user credentials
         ↓
AuthService updates user state (signals)
         ↓
UI updates automatically (Angular signals)
         ↓
Converter shows upload interface
```

## Troubleshooting

### "auth/unauthorized-domain"

**Problem:** Domain not authorized in Firebase Console

**Solution:**

1. Go to Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"
3. Wait a few minutes for changes to propagate

### "auth/popup-blocked"

**Problem:** Browser blocked the authentication popup

**Solution:**

1. Allow popups for your domain
2. Try again
3. Consider implementing redirect-based auth as fallback

### "auth/cancelled-popup-request"

**Problem:** User closed popup or multiple sign-in attempts

**Solution:**

1. Wait for previous popup to close
2. Try signing in again
3. Clear browser cache if persistent

### API Key Errors

**Problem:** Invalid API key or project configuration

**Solution:**

1. Verify Firebase config matches Firebase Console
2. Check API key restrictions in Google Cloud Console
3. Ensure required APIs are enabled:
   - Identity Toolkit API
   - Token Service API

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
