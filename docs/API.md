# API Documentation

> Documentation for the Photocalia API endpoints and Firebase Functions.

## Table of Contents

- [Overview](#overview)
- [Firebase Functions](#firebase-functions)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)

---

## Overview

The application uses Firebase Functions to proxy external API requests and provide backend functionality. All functions are deployed as Google Cloud Functions and accessed through a unified proxy endpoint.

### Architecture

```
Client → Firebase Functions → External APIs
         └── Proxy API
         ├── GitHub API
         ├── Notion API
         └── Hello World (test)
```

### Base URL

```
Production: https://us-central1-<project-id>.cloudfunctions.net/
```

---

## Firebase Functions

### Function Structure

```
functions/
├── src/
│   ├── index.ts              # Main entry point and proxy
│   └── proxies/
│       ├── helloWorld.ts     # Test endpoint
│       ├── githubCommits.ts  # GitHub commit data
│       ├── githubSocial.ts   # GitHub profile & social links
│       └── notion.ts         # Notion database integration
```

### Deployment

#### Prerequisites

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Install function dependencies:
   ```bash
   cd functions
   npm install
   ```

#### Build and Deploy

```bash
# Build functions
cd functions
npm run build

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:proxyApi
```

---

## API Endpoints

### Proxy API

Unified proxy endpoint for all API requests.

**Endpoint**: `/proxyApi`  
**Method**: `GET`  
**CORS**: Enabled for all origins

#### Query Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `target`  | string | Yes      | Target service name |

#### Available Targets

- `hello` - Test endpoint
- `profile` - GitHub user profile
- `social` - Social media links
- `commit` - GitHub commit activity
- `notion` - Notion database items

#### Example Request

```bash
curl "https://us-central1-project.cloudfunctions.net/proxyApi?target=profile"
```

---

### Hello World (Test)

Test endpoint to verify function deployment.

**Target**: `hello`  
**Method**: `GET`

#### Response

```json
{
  "message": "Hello from Firebase!"
}
```

#### Example

```bash
curl "https://us-central1-project.cloudfunctions.net/proxyApi?target=hello"
```

---

### GitHub Profile

Fetch GitHub user profile information.

**Target**: `profile`  
**Method**: `GET`

#### Response

```json
{
  "login": "username",
  "id": 12345,
  "avatar_url": "https://avatars.githubusercontent.com/u/12345",
  "html_url": "https://github.com/username",
  "name": "Full Name",
  "bio": "User bio",
  "location": "City, Country",
  "public_repos": 42,
  "email": "user@example.com"
}
```

#### Example

```typescript
this.http.get<GithubUser>(`${apiUrl}?target=profile`).subscribe((user) => {
  console.log(user.name);
});
```

---

### Social Links

Fetch social media links for the user.

**Target**: `social`  
**Method**: `GET`

#### Response

```json
[
  {
    "provider": "LinkedIn",
    "url": "https://linkedin.com/in/username"
  },
  {
    "provider": "Twitter",
    "url": "https://twitter.com/username"
  }
]
```

#### Example

```typescript
this.http.get<SocialLink[]>(`${apiUrl}?target=social`).subscribe((links) => {
  links.forEach((link) => console.log(link.provider, link.url));
});
```

---

### GitHub Commits

Fetch GitHub commit activity for the last year.

**Target**: `commit`  
**Method**: `GET`

#### Response

```json
[
  {
    "date": 1704067200000,
    "value": 5
  },
  {
    "date": 1704153600000,
    "value": 3
  }
]
```

**Fields:**

- `date`: Unix timestamp (milliseconds)
- `value`: Number of commits on that date

#### Example

```typescript
this.http.get<CommitData[]>(`${apiUrl}?target=commit`).subscribe((commits) => {
  commits.forEach((commit) => {
    const date = new Date(commit.date);
    console.log(`${date.toDateString()}: ${commit.value} commits`);
  });
});
```

---

### Notion Items

Fetch recommended products and tools from Notion database.

**Target**: `notion`  
**Method**: `GET`

#### Response

```json
{
  "Software": [
    {
      "name": "VS Code",
      "url": "https://code.visualstudio.com",
      "description": "Code editor",
      "rank": 1
    }
  ],
  "Hardware": [
    {
      "name": "MacBook Pro",
      "url": "https://apple.com/macbook-pro",
      "description": "Laptop",
      "rank": 1
    }
  ]
}
```

**Structure:**

- Top-level keys are category names
- Each category contains an array of items
- Items are sorted by `rank` within each category

#### Example

```typescript
this.http.get<Record<string, any[]>>(`${apiUrl}?target=notion`).subscribe((data) => {
  Object.keys(data).forEach((category) => {
    console.log(`${category}:`, data[category]);
  });
});
```

---

## Error Handling

### Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description           | Cause                                  |
| ---- | --------------------- | -------------------------------------- |
| 200  | OK                    | Request successful                     |
| 400  | Bad Request           | Invalid target parameter               |
| 500  | Internal Server Error | Function error or external API failure |

### Example Error Handling

```typescript
this.http
  .get(`${apiUrl}?target=profile`)
  .pipe(
    catchError((error) => {
      console.error('API Error:', error.error);
      // Return fallback data or empty observable
      return of(null);
    }),
  )
  .subscribe((data) => {
    // Handle response
  });
```

---

## CORS Configuration

All functions use a strict CORS allowlist for security:

```typescript
const allowedOrigins = [
  'https://photocalia.com',
  'https://www.photocalia.com',
  'http://localhost:4200',
  'http://localhost:5000',
];

const corsHandler = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### Allowed Origins

- `https://photocalia.com` - Production website
- `https://www.photocalia.com` - Production website (www subdomain)
- `http://localhost:4200` - Local development (Angular dev server)
- `http://localhost:5000` - Local development (Firebase emulator)

### Preflight Requests

OPTIONS requests are handled automatically by the CORS middleware.

---

## Rate Limiting

### GitHub API

GitHub API has rate limits:

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour

The functions use authenticated requests when API tokens are configured.

### Notion API

Notion API rate limits:

- **Standard**: 3 requests/second per integration

---

## Environment Variables

### Required Secrets

Functions require the following secrets (set in Firebase):

| Secret                 | Description                  | Used By          |
| ---------------------- | ---------------------------- | ---------------- |
| `GITHUB_TOKEN`         | GitHub personal access token | GitHub functions |
| `NOTION_TOKEN`         | Notion integration token     | Notion function  |
| `NOTION_DATASOURCE_ID` | Notion database ID           | Notion function  |

### Setting Secrets

```bash
# Set GitHub token
firebase functions:secrets:set GITHUB_TOKEN

# Set Notion token
firebase functions:secrets:set NOTION_TOKEN

# Set Notion database ID
firebase functions:secrets:set NOTION_DATASOURCE_ID
```

---

## Development

### Local Testing

Run functions locally with Firebase emulator:

```bash
# Install emulator
firebase init emulators

# Start emulator
firebase emulators:start --only functions

# Access at http://localhost:5001
```

### Function Logs

View function logs:

```bash
# Recent logs
firebase functions:log

# Specific function
firebase functions:log --only proxyApi

# Follow logs in real-time
firebase functions:log --follow
```

---

## Performance

### Cold Starts

Functions may experience cold starts (1-3 seconds) when:

- Not called recently
- Deployed or updated
- Scaled down due to inactivity

### Optimization Tips

1. **Keep functions warm**: Use Cloud Scheduler to ping functions
2. **Minimize dependencies**: Reduce function size
3. **Use caching**: Cache API responses where appropriate
4. **Set max instances**: Limit concurrent executions

```typescript
setGlobalOptions({ maxInstances: 10 });
```

---

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Notion API Documentation](https://developers.notion.com/)
- [Google Cloud Functions](https://cloud.google.com/functions)
