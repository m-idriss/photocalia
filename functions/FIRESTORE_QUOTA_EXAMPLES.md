# Firestore-Based Quota System - Example Usage

## Overview

The new quota system uses Firestore as the primary source of truth with async background sync to Notion for CRM/reporting. The system is designed to work perfectly even if Notion is completely down.

## Architecture

```
┌─────────────────┐
│  API Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  checkQuota()   │────►│  Firestore       │ (PRIMARY - Real-time)
└────────┬────────┘     │  users/{uid}     │
         │              └──────────────────┘
         │                       │
         │                       │ Background sync
         │                       ▼
         │              ┌──────────────────┐
         │              │  Notion          │ (SECONDARY - Reporting)
         │              │  Quota Database  │
         │              └──────────────────┘
         ▼
┌─────────────────┐
│  Allow/Deny     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ incrementUsage()│
└─────────────────┘
```

## Example 1: Using Quota Service in an API Endpoint

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { getQuotaService } from "../services/quota";

export const myApiFunction = onRequest(async (req, res) => {
  const quotaService = getQuotaService();
  
  // Get user ID from request (Firebase Auth, custom token, etc.)
  const userId = req.body.userId || "anonymous";
  
  // 1. Check quota BEFORE processing the request
  const quotaCheck = await quotaService.checkQuota(userId);
  
  if (!quotaCheck.allowed) {
    // User has exceeded quota
    return res.status(429).json({
      error: "Monthly quota exceeded",
      message: `You've used ${quotaCheck.limit - quotaCheck.remaining}/${quotaCheck.limit} requests this month`,
      details: {
        plan: quotaCheck.plan,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining,
      }
    });
  }
  
  // 2. Process the actual request
  try {
    const result = await processRequest(req.body);
    
    // 3. Increment usage AFTER successful processing
    // This is fire-and-forget - we don't await it
    quotaService.incrementUsage(userId)
      .catch(err => console.error("Failed to increment quota:", err));
    
    return res.status(200).json({
      success: true,
      data: result,
      quota: {
        remaining: quotaCheck.remaining - 1,
        limit: quotaCheck.limit,
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Processing failed" });
  }
});
```

## Example 2: Get Quota Status

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { getQuotaService } from "../services/quota";

export const quotaStatusFunction = onRequest(async (req, res) => {
  const quotaService = getQuotaService();
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  
  // Get current quota status
  const status = await quotaService.getQuotaStatus(userId);
  
  if (!status) {
    return res.status(404).json({ error: "User not found" });
  }
  
  return res.status(200).json({
    success: true,
    quota: {
      usageCount: status.usageCount,
      limit: status.limit,
      remaining: status.remaining,
      plan: status.plan,
      percentUsed: Math.round((status.usageCount / status.limit) * 100),
    }
  });
});
```

## Example 3: Migrate Legacy User from Notion

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { migrateUserFromNotion } from "../services/migration";

export const migrateUserFunction = onRequest(async (req, res) => {
  const userId = req.body.userId;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  
  // Migrate user from Notion to Firestore
  const success = await migrateUserFromNotion(userId);
  
  if (success) {
    return res.status(200).json({
      success: true,
      message: `User ${userId} migrated successfully`
    });
  } else {
    return res.status(400).json({
      success: false,
      message: `User ${userId} already exists or migration failed`
    });
  }
});
```

## Example 4: Batch Migrate Multiple Users

```typescript
import { batchMigrateUsersFromNotion } from "../services/migration";

async function migrateAllUsers() {
  // Get list of user IDs from somewhere (Notion, database, etc.)
  const userIds = ["user1@example.com", "user2@example.com", "user3@example.com"];
  
  const result = await batchMigrateUsersFromNotion(userIds);
  
  console.log(`Migration complete:`, result);
  // Output: { succeeded: 2, failed: 1 }
}
```

## Example 5: Update User Plan (Admin Operation)

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { getQuotaService } from "../services/quota";

export const updateUserPlanFunction = onRequest(async (req, res) => {
  // Verify admin auth here...
  
  const { userId, plan } = req.body;
  
  if (!userId || !plan) {
    return res.status(400).json({ error: "userId and plan are required" });
  }
  
  if (!["free", "pro", "premium"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan type" });
  }
  
  const quotaService = getQuotaService();
  await quotaService.updateUserPlan(userId, plan);
  
  return res.status(200).json({
    success: true,
    message: `User ${userId} upgraded to ${plan} plan`
  });
});
```

## Example 6: Firestore Security Rules

Add these security rules to protect user quota data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User quota documents
    match /users/{userId} {
      // Users can read their own quota
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only server (admin) can write quota data
      allow write: if false;
    }
  }
}
```

## Example 7: Direct Firestore Access (if needed)

```typescript
import { getFirestore } from "firebase-admin/firestore";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";

async function directFirestoreAccess(userId: string) {
  initializeFirebaseAdmin();
  const db = getFirestore();
  
  // Read user quota document
  const userDoc = await db.collection("users").doc(userId).get();
  
  if (userDoc.exists) {
    const data = userDoc.data();
    console.log("Quota data:", data);
    // {
    //   plan: "free",
    //   quotaUsed: 2,
    //   quotaLimit: 3,
    //   periodStart: Timestamp,
    //   createdAt: Timestamp,
    //   updatedAt: Timestamp
    // }
  }
}
```

## Key Features

### 1. **Automatic User Creation**
```typescript
// If user doesn't exist, they are auto-created with FREE plan
const check = await quotaService.checkQuota("new-user@example.com");
// User is now in Firestore with:
// - plan: "free"
// - quotaUsed: 0
// - quotaLimit: 3
```

### 2. **Automatic Monthly Reset**
```typescript
// If it's a new month, quota automatically resets to 0
const check = await quotaService.checkQuota("user@example.com");
// If periodStart was last month, quotaUsed is automatically reset
```

### 3. **Atomic Increment**
```typescript
// Multiple concurrent requests are handled safely
await quotaService.incrementUsage(userId);
// Uses Firestore FieldValue.increment(1) - atomic and safe
```

### 4. **Non-Blocking Notion Sync**
```typescript
// Notion sync happens in background
await quotaService.incrementUsage(userId);
// Firestore updated immediately ✓
// Notion updated in background (if fails, only logs error) ✓
```

### 5. **Resilience to Notion Failures**
```typescript
// System works perfectly even if Notion is down
const check = await quotaService.checkQuota(userId);
// Only uses Firestore - Notion not involved in authorization ✓
```

## Testing

### Test Quota Check
```bash
curl -X POST http://localhost:5001/PROJECT_ID/us-central1/myApiFunction \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user@example.com"}'
```

### Test Quota Status
```bash
curl http://localhost:5001/PROJECT_ID/us-central1/quotaStatusFunction?userId=test-user@example.com
```

### Test Migration
```bash
curl -X POST http://localhost:5001/PROJECT_ID/us-central1/migrateUserFunction \
  -H "Content-Type: application/json" \
  -d '{"userId": "legacy-user@example.com"}'
```

## Migration Strategy

### Step 1: Deploy New Code (No Breaking Changes)
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Step 2: Migrate Existing Users (Optional)
```typescript
// Option A: Migrate on-demand (recommended)
// When a user makes a request, they are auto-created if they don't exist

// Option B: Bulk migrate all users
const allUserIds = await getAllUserIdsFromNotion();
const result = await batchMigrateUsersFromNotion(allUserIds);
```

### Step 3: Monitor Both Systems
- Firestore handles all real-time quota checks
- Notion receives background updates for reporting
- No downtime during migration

### Step 4: Verify (Optional)
```typescript
// Compare Firestore vs Notion data
async function verifyMigration(userId: string) {
  const firestoreStatus = await quotaService.getQuotaStatus(userId);
  const notionData = await notionSyncService.readFromNotion(userId);
  
  console.log("Firestore:", firestoreStatus);
  console.log("Notion:", notionData);
}
```

## Best Practices

1. **Always check quota BEFORE processing**: Avoid wasting resources on requests that will be denied
2. **Increment quota AFTER success**: Only count successful operations
3. **Use fire-and-forget for increment**: Don't await incrementUsage() unless you need to
4. **Handle errors gracefully**: Quota check errors should allow the request (fail-open)
5. **Monitor Firestore usage**: Set up alerts for quota collection size and read/write operations
6. **Keep Notion sync optional**: Never depend on Notion for authorization

## Troubleshooting

### User quota not resetting monthly
- Check that `periodStart` is being updated correctly
- Verify timezone issues (uses UTC)
- Look for errors in Firestore write operations

### Notion sync failing
- Check environment variables: `NOTION_TRACKING_TOKEN`, `NOTION_QUOTA_DB_ID`
- Verify Notion database schema matches expected format
- Check logs for sync errors (should not affect main functionality)

### Quota count incorrect
- Verify atomic increment is being used (FieldValue.increment)
- Check for race conditions in concurrent requests
- Review logs for failed increment operations
