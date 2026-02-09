# Firebase Emulator Setup Guide

This guide explains how to properly configure your development environment to use Firebase Functions emulator without encountering infinite loops or unnecessary overhead.

## Understanding the Architecture

### Production
In production, the application uses a `proxyApi` function as a single entry point that routes requests to various backend services:
- Frontend → `https://api.3dime.com` (proxyApi) → Individual Cloud Functions

### Development (Emulator Mode)
In development with the Firebase emulator, all functions are exposed directly at their own endpoints:
- Frontend → `http://localhost:5001/{project}/{region}/{functionName}` → Individual Functions

**Important:** The `proxyApi` function is NOT available in emulator mode to prevent infinite loops and unnecessary overhead.

## Configuration Steps

### 1. Update Environment Configuration

For development, configure your `src/environments/environment.ts` to point directly to the emulator:

```typescript
export const environment = {
  production: false,
  // Option A: Point directly to a specific function (recommended for testing one feature)
  apiUrl: 'http://localhost:5001/image-to-ics/us-central1/converterFunction',
  
  // Option B: Use a base URL and construct full paths in services
  // apiUrl: 'http://localhost:5001/image-to-ics/us-central1',
  
  firebase: {
    // Your Firebase config
  },
};
```

### 2. Update Service Layer (if using Option B)

If using a base URL, update your services to construct full function URLs:

```typescript
// Before (using proxyApi)
getQuotaStatus(): Observable<QuotaStatusResponse> {
  return this.http.post(`${this.baseUrl}?target=quotaStatus`, { userId: this.userId });
}

// After (direct function call)
getQuotaStatus(): Observable<QuotaStatusResponse> {
  return this.http.post(`${this.baseUrl}/quotaStatusFunction`, { userId: this.userId });
}
```

### 3. Available Function Endpoints

When running the emulator, the following functions are available:

| Target | Function Name | Emulator URL |
|--------|--------------|--------------|
| profile | githubSocial | `http://localhost:5001/image-to-ics/us-central1/githubSocial` |
| social | githubSocial | `http://localhost:5001/image-to-ics/us-central1/githubSocial?target=social` |
| commit | githubCommits | `http://localhost:5001/image-to-ics/us-central1/githubCommits` |
| notion | notionFunction | `http://localhost:5001/image-to-ics/us-central1/notionFunction` |
| converter | converterFunction | `http://localhost:5001/image-to-ics/us-central1/converterFunction` |
| statistics | statisticsFunction | `http://localhost:5001/image-to-ics/us-central1/statisticsFunction` |
| quotaStatus | quotaStatusFunction | `http://localhost:5001/image-to-ics/us-central1/quotaStatusFunction` |

## Starting the Emulator

### 1. Install Functions Dependencies
```bash
cd functions
npm install
```

### 2. Build Functions
```bash
npm run build
```

### 3. Start Emulator
```bash
# From the functions directory
npm run serve

# Or from the project root
firebase emulators:start --only functions
```

### 4. Start Angular Dev Server
In a separate terminal:
```bash
npm start
```

The Angular app will run at `http://localhost:4200` and connect to the emulator at `http://localhost:5001`.

## Troubleshooting

### Issue: "proxyApi is not available in emulator mode"
**Cause:** Your frontend is trying to call `proxyApi` in development mode.

**Solution:** Update your environment configuration to call functions directly (see Step 1 above).

### Issue: CORS errors
**Cause:** The emulator might not be configured to accept requests from your frontend origin.

**Solution:** Ensure `http://localhost:4200` is in the `allowedOrigins` list in each function's CORS configuration.

### Issue: Function not found (404)
**Cause:** Incorrect function name or URL structure.

**Solution:** 
1. Verify the function is deployed/built: `ls functions/lib/`
2. Check the emulator logs for registered functions
3. Ensure URL follows pattern: `http://localhost:5001/{projectId}/{region}/{functionName}`

## Best Practices

1. **Separate Configs:** Maintain separate environment files for development and production
2. **Direct Calls:** Always call functions directly in development (don't use proxyApi)
3. **Use Emulator:** Test all function changes locally before deploying
4. **Watch Mode:** Use `npm run build:watch` in functions directory for automatic rebuilds
5. **Check Logs:** Monitor emulator logs to understand request flow

## Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firebase Functions CORS Configuration](https://firebase.google.com/docs/functions/http-events#cors)
- [Angular Environment Configuration](https://angular.dev/tools/cli/environments)
