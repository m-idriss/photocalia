# Notion Webhook Setup Guide

This guide explains how to configure Notion webhooks to enable instant cache refresh when your Notion database changes.

## Overview

**Before (Fixed TTL):**
- Cache refreshes every 1 hour regardless of whether data changed
- Unnecessary API calls even when data is unchanged
- Up to 1 hour delay before updated data becomes visible

**After (Webhook-driven):**
- Cache refreshes immediately when Notion data changes
- No unnecessary API calls
- Instant visibility of updated data
- TTL extended to 24 hours as a safety fallback

## Architecture

```
┌─────────────────┐
│  Notion Database│
│   (Data Source) │
└────────┬────────┘
         │ Change detected
         │
         ▼
┌─────────────────────┐
│  Notion Webhook     │
│  (Notion Platform)  │
└─────────┬───────────┘
          │ POST request
          │ + signature
          ▼
┌──────────────────────────┐
│ notionWebhook Function   │
│ (Firebase Functions)     │
├──────────────────────────┤
│ 1. Verify signature      │
│ 2. Fetch fresh data      │
│ 3. Update cache directly │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────┐
│  Firestore Cache     │
│  (notion-cache/data) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Frontend App        │
│  (Gets fresh data)   │
└──────────────────────┘
```

## Setup Instructions

### 1. Deploy the Webhook Function

The webhook function is already implemented in `functions/src/proxies/notionWebhook.ts`. Deploy it to Firebase:

```bash
cd functions
npm run build
firebase deploy --only functions:notionWebhook
```

After deployment, note the function URL. It will look like:
```
https://notionwebhook-fuajdt22nq-uc.a.run.app
```

### 2. Configure Firebase Secrets

The webhook requires the following secrets to be configured in Firebase:

```bash
# Set existing secrets (already configured)
firebase functions:secrets:set NOTION_TOKEN
firebase functions:secrets:set NOTION_DATASOURCE_ID

# Set new webhook secret (generate a strong random string)
firebase functions:secrets:set NOTION_WEBHOOK_SECRET
```

**Generate a strong webhook secret:**
```bash
# On Linux/Mac
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configure Notion Webhook

⚠️ **Note**: As of 2024, Notion's webhook feature may still be in development. Check the [Notion API documentation](https://developers.notion.com/) for the latest webhook configuration options.

#### Expected Configuration Steps:

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Select your integration (or create a new one)
3. Navigate to the "Webhooks" or "Subscriptions" section
4. Click "Add webhook" or "Subscribe to database"
5. Configure the webhook:
   - **Webhook URL**: `https://notionwebhook-fuajdt22nq-uc.a.run.app`
   - **Database/Data Source ID**: Your Notion database ID (same as `NOTION_DATASOURCE_ID`)
   - **Events**: Select "Database updated", "Page created", "Page updated", "Page deleted"
   - **Webhook Secret**: The secret you generated in step 2

6. Save the webhook configuration

### 4. Test the Webhook

#### Manual Test

You can test the webhook manually using curl:

```bash
# Test without signature (if NOTION_WEBHOOK_SECRET not set)
curl -X POST https://notionwebhook-fuajdt22nq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Test with signature (replace SECRET with your actual secret)
PAYLOAD='{"test":"webhook"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "YOUR_SECRET" | cut -d' ' -f2)

curl -X POST https://notionwebhook-fuajdt22nq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -H "Notion-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

#### Test by Updating Notion

1. Make a change to your Notion database (add, update, or delete an item)
2. Check Firebase Functions logs to verify the webhook was triggered:
   ```bash
   firebase functions:log --only notionWebhook
   ```
3. Verify the cache was updated by checking the `notion-cache` collection in Firestore

### 5. Verify Cache Updates

To verify that the webhook is working correctly:

1. **Check Firestore**: Open Firebase Console → Firestore → `notion-cache` collection → `data` document
   - Check the `updatedAt` timestamp
   - Verify the `version` hash changes after updates

2. **Check Function Logs**:
   ```bash
   firebase functions:log --only notionWebhook
   ```
   
   Look for log entries like:
   ```
   Cache updated successfully via webhook
   Categories: stuff, experience, education, hobbies, tech_stack
   Item count: 42
   ```

3. **Test Frontend**: Visit your website and verify that changes in Notion appear immediately (within a few seconds)

## Security Features

### Webhook Signature Verification

The webhook function verifies that requests are genuinely from Notion using HMAC-SHA256 signatures:

1. Notion signs the request body with your webhook secret
2. The signature is sent in the `Notion-Signature` header
3. The function computes the expected signature and compares it
4. If signatures don't match, the request is rejected with a 401 error

**Important**: Always use HTTPS and keep your webhook secret confidential.

### Environment-based Security

- The webhook secret is stored in Firebase Secrets (not in code)
- Secrets are never logged or exposed in responses
- Timing-safe comparison prevents timing attacks

## Monitoring and Troubleshooting

### Check Webhook Status

```bash
# View recent webhook invocations
firebase functions:log --only notionWebhook --limit 50

# Monitor webhook in real-time
firebase functions:log --only notionWebhook --follow
```

### Common Issues

#### 1. Webhook not triggering
- **Cause**: Notion webhook not configured correctly
- **Solution**: Verify webhook URL and database ID in Notion settings

#### 2. 401 Unauthorized error
- **Cause**: Invalid webhook signature
- **Solution**: 
  - Verify `NOTION_WEBHOOK_SECRET` matches the secret in Notion
  - Check that the signature is sent in the `Notion-Signature` header

#### 3. 500 Internal Server Error
- **Cause**: Missing secrets or Notion API error
- **Solution**:
  - Verify all required secrets are set: `NOTION_TOKEN`, `NOTION_DATASOURCE_ID`
  - Check Firebase Functions logs for detailed error messages

#### 4. Cache not updating
- **Cause**: Function succeeds but cache not written
- **Solution**:
  - Check Firestore permissions
  - Verify the cache manager configuration matches the main function

### Health Check

The webhook endpoint returns different status codes:

- **200**: Cache updated successfully
- **401**: Missing or invalid signature
- **405**: Method not allowed (only POST is accepted)
- **500**: Internal server error (check logs)

## Fallback Mechanism

Even with webhooks enabled, the system has built-in redundancy:

1. **Extended TTL**: Cache TTL is now 24 hours (was 1 hour)
2. **Background Refresh**: If a webhook is missed, the cache will refresh after 24 hours
3. **Force Refresh**: Clients can still force a refresh with `?force=true` parameter

## Benefits Summary

✅ **Instant Updates**: Changes in Notion appear immediately on the website  
✅ **Reduced Costs**: Fewer Notion API calls (only when data actually changes)  
✅ **Better Reliability**: Webhook + extended TTL provides dual protection  
✅ **Security**: HMAC signature verification prevents unauthorized cache updates  
✅ **Monitoring**: Comprehensive logging for debugging and monitoring  

## Migration Notes

### Before Deployment

The existing `notionFunction` continues to work during webhook setup:
- Cache TTL increased to 24 hours (from 1 hour)
- No breaking changes to the API
- Frontend code requires no changes

### After Deployment

1. Deploy both functions: `notionFunction` and `notionWebhook`
2. Configure webhook in Notion (see step 3)
3. Monitor logs to ensure webhooks are working
4. Optional: Keep both systems running for redundancy

## Related Files

- `functions/src/proxies/notionWebhook.ts` - Webhook handler implementation
- `functions/src/proxies/notion.ts` - Main Notion data fetching function
- `functions/src/utils/cache.ts` - Cache manager with `set()` method
- `functions/src/index.ts` - Function exports

## References

- [Notion API Documentation](https://developers.notion.com/)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Secrets Management](https://firebase.google.com/docs/functions/config-env)
