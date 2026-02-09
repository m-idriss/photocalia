# Firebase Functions

This directory contains the Firebase Cloud Functions for the Photocalia application, providing backend API endpoints and proxy services.

## Overview

The Firebase Functions serve as a backend layer for:
- **GitHub API Proxying**: Fetch user profile, social links, and commit activity
- **Notion API Integration**: Retrieve application data (experience, education, stuff, hobbies, tech stack)
- **Calendar Converter**: AI-powered image/PDF to ICS calendar conversion
- **Backend Caching**: Firestore-based caching for improved performance (see [CACHING.md](./CACHING.md))
- **CORS Handling**: Secure cross-origin requests with whitelisted domains

## Prerequisites

- **Node.js**: 22+ recommended (Node 20 works but Node 22 is recommended for full compatibility)
- **npm**: 10+
- **Firebase CLI**: Install with `npm install -g firebase-tools`
- **Firebase Project**: Set up in [Firebase Console](https://console.firebase.google.com)

## Installation

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts              # Main entry point and proxy API
│   ├── proxies/
│   │   ├── githubCommits.ts  # GitHub commit activity endpoint (cached)
│   │   ├── githubSocial.ts   # GitHub profile and social links (cached)
│   │   ├── notion.ts         # Notion API integration (cached)
│   │   ├── statistics.ts     # Platform statistics (cached)
│   │   └── converter.ts      # Calendar converter (AI-powered)
│   ├── utils/
│   │   ├── cache.ts          # Unified caching utility (CacheManager)
│   │   └── firebase-admin.ts # Firebase Admin initialization
│   └── services/
│       ├── tracking.ts       # Statistics tracking service
│       └── quota.ts          # User quota management service
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
├── CACHING.md                # Backend caching documentation
├── QUOTA.md                  # User quota system documentation
└── ARCHITECTURE.md           # System architecture and flow diagrams
```

## Available Functions

### 1. Proxy API (`proxyApi`)

Central proxy endpoint that routes requests to other functions.

**Endpoint**: `/proxyApi`  
**Method**: GET  
**Query Parameters**:
- `target` - Target function (`profile`, `social`, `commit`, `notion`, `converter`)
- `months` - (Optional) Number of months for commit history

**Example**:
```
GET /proxyApi?target=profile
GET /proxyApi?target=commit&months=12
```

### 2. GitHub Commits (`githubCommits`)

Fetches GitHub commit activity for the past N months.

**Endpoint**: `/githubCommits`  
**Method**: GET  
**Query Parameters**:
- `months` - Number of months (default: 12)

### 3. GitHub Social (`githubSocial`)

Retrieves GitHub profile information and social links.

**Endpoint**: `/githubSocial`  
**Method**: GET  
**Query Parameters**:
- `target` - `profile` or `social`

### 4. Notion Function (`notionFunction`)

Fetches application data from Notion database.

**Endpoint**: `/notionFunction`  
**Method**: GET

**Environment Variables Required**:
- `NOTION_TOKEN` - Notion API integration token
- `NOTION_DATASOURCE_ID` - Notion database ID

### 5. Converter Function (`converterFunction`)

Converts images/PDFs to ICS calendar files using Google Gemini AI with quota management.

**Endpoint**: `/converterFunction`  
**Method**: POST  
**Body**: JSON with image file data
```json
{
  "userId": "user@example.com",
  "files": [
    {
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQ..."
    }
  ],
  "timeZone": "America/New_York",
  "currentDate": "2025-11-02"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "icsContent": "BEGIN:VCALENDAR..."
}
```

**Response (Quota Exceeded - 429)**:
```json
{
  "error": "You've reached your monthly conversion limit. Please try again next month or contact us to upgrade your plan.",
  "message": "Monthly limit reached",
  "details": {
    "monthlyLimit": 3,
    "used": 3,
    "resetsAt": "start of next month"
  },
  "contact": "contact@photocalia.com"
}
```

**Environment Variables Required**:
- `SERVICE_ACCOUNT_JSON` - Google Cloud service account JSON for Gemini API authentication
- `NOTION_TRACKING_TOKEN` - Notion API token for quota management (optional)
- `NOTION_QUOTA_DB_ID` - Notion database ID for quota storage (optional)

**Configuration**:
- The converter uses **Google Gemini 1.5 Pro** for AI-powered calendar extraction. See [Gemini API Configuration](#gemini-api-configuration) for setup details.
- **Quota System**: Limits conversions per user per day to prevent abuse. See [QUOTA.md](./QUOTA.md) for complete documentation.
- If quota system is not configured, all requests are allowed by default.

## Development

### Local Development

1. **Install Firebase Emulator Suite**:
```bash
firebase init emulators
```

2. **Start Emulators**:
```bash
# From project root
firebase emulators:start
```

3. **Test Functions Locally**:
```bash
# Functions run at http://localhost:5001
curl http://localhost:5001/[project-id]/us-central1/proxyApi?target=profile
```

### Build Functions

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch
```

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:proxyApi
firebase deploy --only functions:githubCommits
```

## Configuration

### Environment Variables

Set secrets using Firebase CLI:

```bash
# GitHub API token (for higher rate limits)
firebase functions:secrets:set GITHUB_TOKEN

# Notion API credentials
firebase functions:secrets:set NOTION_TOKEN
firebase functions:secrets:set NOTION_DATASOURCE_ID

# Notion quota system (optional)
firebase functions:secrets:set NOTION_TRACKING_TOKEN
firebase functions:secrets:set NOTION_QUOTA_DB_ID

# Google Cloud service account for Gemini API
firebase functions:secrets:set SERVICE_ACCOUNT_JSON
```

### Gemini API Configuration

The converter function uses **Google Gemini 1.5 Pro** for AI-powered calendar extraction.

#### Prerequisites

1. **Google Cloud Project**: Create or use an existing project
2. **Enable Generative Language API**: 
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to "APIs & Services" > "Library"
   - Search for "Generative Language API"
   - Click "Enable"

3. **Create Service Account**:
   ```bash
   # Using gcloud CLI
   gcloud iam service-accounts create gemini-converter \
       --display-name="Gemini Converter Service Account"
   
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
       --member="serviceAccount:gemini-converter@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
       --role="roles/aiplatform.user"
   
   # Create and download key
   gcloud iam service-accounts keys create service-account-key.json \
       --iam-account=gemini-converter@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Set Firebase Secret**:
   ```bash
   # Read the JSON file content and set as secret
   firebase functions:secrets:set SERVICE_ACCOUNT_JSON
   # When prompted, paste the entire content of service-account-key.json
   
   # Or set from file directly
   cat service-account-key.json | firebase functions:secrets:set SERVICE_ACCOUNT_JSON
   ```

   **⚠️ Security Note**: Never commit `service-account-key.json` to version control. Add it to `.gitignore`.

#### Configuration Options

Optional environment variables for customizing prompts:

```bash
# Custom message for calendar extraction
firebase functions:config:set converter.base_text_message="Your custom extraction prompt"

# Custom system prompt for the AI
firebase functions:config:set converter.prompt="Your custom system prompt"
```

Example `.env` file for local development (see `.env.example`):
```bash
SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

#### API Details

- **Endpoint**: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent`
- **Authentication**: OAuth 2.0 with service account
- **Scope**: `https://www.googleapis.com/auth/generative-language`
- **Model**: `gemini-1.5-pro`
- **Parameters**:
  - Temperature: 0.1 (deterministic output)
  - Max Output Tokens: 4096

#### Testing Gemini Integration

Test locally using Firebase emulators:

```bash
# Set local environment variable
export SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Start emulators
firebase emulators:start

# Test the converter endpoint
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/converterFunction \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"dataUrl": "data:image/jpeg;base64,..."}],
    "timeZone": "UTC",
    "currentDate": "2025-11-02"
  }'
```

#### Troubleshooting Gemini API

**Authentication Errors (401/403)**:
- Verify service account has correct permissions
- Check that Generative Language API is enabled
- Ensure `SERVICE_ACCOUNT_JSON` secret is properly set
- Validate JSON format of service account key

**API Quota Errors**:
- Check quota limits in Google Cloud Console
- Implement rate limiting in your application
- Consider upgrading to a paid plan for higher limits

**Response Parsing Errors**:
- Verify response structure matches expected format
- Check for empty or malformed responses
- Review Gemini API response logs in Cloud Console

### CORS Configuration

Allowed origins are configured in `src/index.ts`:

```typescript
const allowedOrigins = [
  'https://photocalia.com',
  'https://www.photocalia.com',
  'http://localhost:4200',
  'http://localhost:5000'
];
```

Update this array to add more allowed origins.

### Function Options

Global function options are set in `src/index.ts`:

```typescript
setGlobalOptions({ 
  maxInstances: 10  // Maximum concurrent instances
});
```

## Testing

### API Testing with Bruno

The project includes a Bruno API collection for testing:

```bash
# See bruno-collections/photocalia-api/README.md
cd ../bruno-collections/photocalia-api
bru run .
```

### Manual Testing

```bash
# Test proxy API
curl "https://us-central1-[project-id].cloudfunctions.net/proxyApi?target=profile"

# Test GitHub commits (12 months)
curl "https://us-central1-[project-id].cloudfunctions.net/proxyApi?target=commit&months=12"

# Test Notion integration
curl "https://us-central1-[project-id].cloudfunctions.net/proxyApi?target=notion"
```

## Logs and Monitoring

### View Logs

```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only proxyApi

# Follow logs in real-time
firebase functions:log --follow
```

### Firebase Console

Monitor functions in the [Firebase Console](https://console.firebase.google.com):
- **Functions Dashboard**: View usage, errors, and performance
- **Logs**: Real-time and historical logs
- **Metrics**: Request count, execution time, memory usage

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  // Function logic
} catch (err) {
  console.error('Error:', err);
  return res.status(500).json({ 
    error: err.message 
  });
}
```

Common error responses:
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (CORS error)
- `500` - Internal Server Error

## Backend Caching

All API endpoints now include Firestore-based backend caching for improved performance. See **[CACHING.md](./CACHING.md)** for complete documentation.

### Quick Overview

- **Cache Storage**: Firestore collections (`github-cache`, `notion-cache`, `stats-cache`)
- **Response Time**: < 100ms from cache (vs 2-5 seconds from external APIs)
- **API Call Reduction**: ~99.9% fewer external API calls
- **Background Refresh**: Cache updates automatically when stale

### Cache Configuration

| Endpoint | TTL | Force Cooldown | Benefits |
|----------|-----|----------------|----------|
| GitHub Commits | 1 hour | 5 minutes | 40-60x faster |
| GitHub Profile/Social | 1 hour | 5 minutes | 20-40x faster |
| Notion Data | 1 hour | 5 minutes | 40-80x faster |
| Statistics | 5 minutes | 1 minute | 10x faster |

### Force Refresh

Add `?force=true` to any endpoint to force a cache refresh (respects cooldown):

```bash
curl "https://api.3dime.com?target=profile&force=true"
```

### Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed system architecture, flow diagrams, and performance metrics.

## Performance

### Optimization Tips

1. ✅ **Function Caching**: All endpoints now use Firestore caching
2. **Minimize Cold Starts**: Keep functions warm with scheduled pings
3. **Optimize Dependencies**: Use tree-shaking and minimize bundle size
4. **Set Timeouts**: Configure appropriate timeout values for functions
5. **Monitor Metrics**: Track execution time and memory usage

### Current Performance

**Without Cache** (cold):
- **Average Execution Time**: 2-5 seconds (external API calls)
- **Cold Start Time**: 1-2 seconds
- **Memory Usage**: 256MB default

**With Cache** (warm):
- **Average Execution Time**: < 100ms (Firestore read)
- **Cache Hit Rate**: > 95%
- **API Call Reduction**: ~99.9%
- **Concurrent Executions**: Max 10 instances

## Security

### Best Practices

1. **Never commit secrets**: Use Firebase secrets management
2. **Validate input**: Always validate request parameters
3. **Use CORS whitelist**: Restrict allowed origins
4. **Rate limiting**: Implement rate limiting for public endpoints
5. **Authentication**: Use Firebase Auth for protected endpoints

### Environment Security

```bash
# View configured secrets
firebase functions:secrets:access

# Delete a secret
firebase functions:secrets:destroy SECRET_NAME
```

## Troubleshooting

### Common Issues

**Issue**: Function not deploying
```bash
# Check Firebase CLI version
firebase --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: CORS errors
- Verify origin is in `allowedOrigins` array
- Check Firebase Hosting configuration
- Ensure credentials are properly configured

**Issue**: Function timeouts
- Increase timeout in function configuration
- Optimize API calls and processing
- Check for infinite loops or blocking operations

**Issue**: Environment variables not working
- Use Firebase secrets instead of environment variables
- Verify secrets are set: `firebase functions:secrets:access`
- Check function configuration in Firebase Console

## Documentation

For more information, see:
- **[CACHING.md](./CACHING.md)** - Backend caching system documentation
- **[QUOTA.md](./QUOTA.md)** - User quota management system documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and flow diagrams
- **[API Documentation](../docs/API.md)** (from repository root: `docs/API.md`) - Detailed API endpoint documentation
- **[Main README](../README.md)** (from repository root: `README.md`) - Project overview
- **[Firebase Functions Docs](https://firebase.google.com/docs/functions)** - Official documentation

## Contributing

When adding new functions:
1. Create function file in `src/proxies/`
2. Export function in `src/index.ts`
3. Update this README with endpoint documentation
4. Add tests to Bruno collection
5. Update API documentation in `docs/API.md`

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
