# Backend Caching Implementation

This document explains the backend caching system implemented for the Photocalia SaaS application.

## Overview

The backend caching system uses Firebase Firestore to cache API responses, providing:
- **Fast response times** - Data is returned immediately from cache when available
- **Reduced API calls** - Background refresh only when cache is stale
- **Automatic updates** - Cache refreshes in the background without blocking requests
- **Version detection** - Only updates cache when data actually changes

## Architecture

### CacheManager Utility

The `CacheManager` class (`functions/src/utils/cache.ts`) provides a unified caching interface for all Firebase Functions.

**Key Features:**
- Returns cached data immediately if available
- Refreshes cache in background when TTL expires
- Detects data changes using version hashing
- Prevents excessive API calls with cooldown periods
- Handles errors gracefully

**Configuration Options:**
```typescript
interface CacheOptions {
  collection: string;    // Firestore collection name
  key: string;          // Document ID for cache entry
  ttl: number;          // Time-To-Live in milliseconds
  forceCooldown?: number; // Minimum time between forced refreshes
}
```

## Cached Endpoints

### 1. GitHub Commits (`githubCommits`)
- **Collection:** `github-cache`
- **Key:** `commits-{months}` (dynamic based on months parameter)
- **TTL:** 1 hour
- **Force Cooldown:** 5 minutes
- **Use Case:** GitHub contribution activity data

### 2. GitHub Profile & Social Links (`githubSocial`)
- **Collection:** `github-cache`
- **Key:** `profile` or `social-links` (based on target)
- **TTL:** 1 hour
- **Force Cooldown:** 5 minutes
- **Use Case:** GitHub profile information and social media links

### 3. Notion Data (`notionFunction`)
- **Collection:** `notion-cache`
- **Key:** `data`
- **TTL:** 1 hour
- **Force Cooldown:** 5 minutes
- **Use Case:** Portfolio content (experience, education, hobbies, tech stack)

### 4. Statistics (`statisticsFunction`)
- **Collection:** `stats-cache`
- **Key:** `statistics`
- **TTL:** 5 minutes
- **Force Cooldown:** 1 minute
- **Use Case:** Platform usage statistics (more frequently updated)

## How It Works

### Normal Request Flow

1. **Request arrives** → Check Firestore for cached data
2. **Cache hit** → Return cached data immediately to client
3. **Check staleness** → If TTL expired, refresh in background
4. **Background refresh** → Fetch fresh data from API
5. **Version check** → Compare new data with cached version
6. **Update if changed** → Only update cache if data differs

### First Request (Cache Miss)

1. **Request arrives** → No cached data found
2. **Fetch fresh** → Call external API synchronously
3. **Store in cache** → Save to Firestore with version
4. **Return to client** → Send fresh data

### Force Refresh

Add `?force=true` to any endpoint to force a refresh:
```
https://api.photocalia.com?target=profile&force=true
```

**Note:** Force refresh respects cooldown period to prevent abuse.

## Cache Data Structure

Each cache entry in Firestore has this structure:
```typescript
{
  version: string;      // Hash of data for change detection
  data: T;             // Actual cached data
  lastCheckAt: number; // Timestamp of last refresh check (ms)
  updatedAt: string;   // ISO timestamp of last data update
}
```

## Benefits

### Performance
- **Sub-100ms response times** from cache
- **No API rate limiting** for cached requests
- **Reduced latency** for end users worldwide

### Reliability
- **Graceful degradation** when APIs are down
- **Automatic recovery** when APIs come back online
- **No cold starts** affecting user experience

### Cost Efficiency
- **Fewer external API calls** reduces quota usage
- **Lower Firebase Functions execution time** (faster = cheaper)
- **Reduced bandwidth** from third-party services

### User Experience
- **Instant data loading** from cache
- **Fresh data** updated in background
- **Consistent performance** across all users

## Monitoring

### Cache Hits/Misses
All cache operations are logged:
```
Cache hit for commits-12 (age: 1234567)
Cache miss for profile - fetching fresh data
Cache updated for social-links (version changed)
```

### Error Handling
Errors are logged and don't affect user experience:
```
Background refresh failed for commits-12
Cache refresh error for profile
```

## Development

### Testing Locally
When running Firebase emulators, cache will work locally:
```bash
npm run dev
```

### Clearing Cache
To clear cache for a specific endpoint, use the `clear()` method:
```typescript
const cache = new CacheManager({ /* config */ });
await cache.clear();
```

Or manually delete from Firestore console.

### Adding Cache to New Endpoints

1. Import the cache utilities:
```typescript
import { CacheManager, simpleHash } from "../utils/cache";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
```

2. Initialize Firebase Admin:
```typescript
initializeFirebaseAdmin();
```

3. Create cache manager:
```typescript
const cache = new CacheManager<YourDataType>({
  collection: "your-cache",
  key: "your-key",
  ttl: 3600000, // 1 hour
  forceCooldown: 300000 // 5 minutes
});
```

4. Use in request handler:
```typescript
const data = await cache.get(
  async () => fetchFromYourAPI(),
  simpleHash,
  req.query.force === "true"
);
```

## Security Considerations

- Cache is stored in Firestore with default security rules
- No sensitive credentials are cached
- API tokens remain in environment variables
- Cache can be manually cleared if needed
- Force refresh has cooldown to prevent abuse

## Future Enhancements

Potential improvements:
- [ ] Cache warming on deployment
- [ ] Redis/Memcached for even faster access
- [ ] Cache analytics dashboard
- [ ] Automatic cache invalidation rules
- [ ] Cache size monitoring and limits
- [ ] Multi-region cache replication
