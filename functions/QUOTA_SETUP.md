# Quota System Setup Guide

This guide walks you through setting up the quota system for the converterFunction.

## Prerequisites

- Notion account with workspace access
- Firebase project with Functions enabled
- Firebase CLI installed and authenticated

## Step 1: Create Notion Database

1. **Create a new database in Notion**
   - Open Notion and create a new page
   - Add a database (full page or inline)
   - Name it "Converter Quota Database"

2. **Configure database properties**
   
   Add the following properties (case-sensitive):

   | Property Name | Type | Configuration |
   |--------------|------|---------------|
   | User ID | Title | Default title property |
   | Usage Count | Number | Format: Number |
   | Last Reset | Date | Format: Date only |
   | Plan | Select | Options: free, pro, premium |

3. **Add select options for "Plan"**
   - Click on the "Plan" property
   - Add three options:
     - `free` (default)
     - `pro`
     - `premium`

4. **Get database ID**
   - Click "Share" in the top-right corner
   - Click "Copy link"
   - Extract the database ID from the URL:
     ```
     https://notion.so/workspace/[DATABASE_ID]?v=...
                                  ^^^^^^^^^^^^^^
     ```
   - Save this ID for later (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Step 2: Create Notion Integration

1. **Go to Notion Integrations**
   - Visit https://www.notion.so/my-integrations
   - Click "New integration"

2. **Configure integration**
   - Name: "Converter Quota Service"
   - Associated workspace: Select your workspace
   - Capabilities: 
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
   - Click "Submit"

3. **Get integration token**
   - Copy the "Internal Integration Token" (starts with `secret_`)
   - Save this token for later (format: `secret_xxxxxxxxxxxxxxxxxxxxx`)

4. **Connect integration to database**
   - Open your quota database in Notion
   - Click "..." menu in top-right
   - Click "Add connections"
   - Select your "Converter Quota Service" integration
   - Click "Confirm"

## Step 3: Configure Firebase Secrets

### Option A: Using Firebase CLI (Recommended)

```bash
# Navigate to your project directory
cd /path/to/Photocalia/functions

# Set Notion quota token
firebase functions:secrets:set NOTION_TRACKING_TOKEN
# When prompted, paste your integration token (secret_xxx...)

# Set Notion quota database ID
firebase functions:secrets:set NOTION_QUOTA_DB_ID
# When prompted, paste your database ID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Functions → Secrets
4. Add secret: `NOTION_TRACKING_TOKEN` → Paste integration token
5. Add secret: `NOTION_QUOTA_DB_ID` → Paste database ID

## Step 4: Deploy Functions

```bash
# Deploy only the converterFunction
firebase deploy --only functions:converterFunction

# Or deploy all functions
firebase deploy --only functions
```

## Step 5: Verify Setup

### Test quota checking

```bash
# Test with curl (replace URL with your function URL)
curl -X POST https://converterfunction-xxx.run.app \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user@example.com",
    "files": [{"dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."}],
    "timeZone": "UTC",
    "currentDate": "2025-11-15"
  }'
```

### Expected behavior

1. **First 3 requests**: Should succeed (200 OK)
2. **4th request**: Should return quota exceeded (429)

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

### Check Notion database

After testing:
1. Open your Notion database
2. You should see a new entry for `test-user@example.com`
3. Values:
   - User ID: `test-user@example.com`
   - Usage Count: `3`
   - Last Reset: Today's date
   - Plan: `free`

## Step 6: Manage User Quotas

### Upgrade a user to Pro

1. Open the Notion database
2. Find the user's row
3. Change "Plan" from `free` to `pro`
4. The user now has 100 conversions per month

### Reset a user's quota

1. Open the Notion database
2. Find the user's row
3. Set "Usage Count" to `0`
4. Update "Last Reset" to today's date

### Add a new user manually

1. Click "New" in the Notion database
2. Fill in:
   - User ID: User's email or identifier
   - Usage Count: `0`
   - Last Reset: Today's date
   - Plan: Select plan (free/pro/premium)

## Troubleshooting

### "Quota service DISABLED" in logs

**Cause**: Missing environment variables

**Solution**:
1. Verify secrets are set:
   ```bash
   firebase functions:secrets:access NOTION_TRACKING_TOKEN
   firebase functions:secrets:access NOTION_QUOTA_DB_ID
   ```
2. If missing, set them following Step 3
3. Redeploy function

### "Failed to fetch quota entry" in logs

**Cause**: Integration not connected to database

**Solution**:
1. Open Notion database
2. Click "..." → "Add connections"
3. Select your integration
4. Redeploy function

### All requests return 429 immediately

**Cause**: Database entries might have old "Last Reset" dates

**Solution**:
1. Open Notion database
2. Update "Last Reset" to today's date for affected users
3. Set "Usage Count" to `0`

### Quota not resetting monthly

**Cause**: Monthly reset happens on first request after month changes

**Solution**:
- Wait for first request after the month changes
- Reset happens automatically based on "Last Reset" date comparison
- Check server timezone vs user timezone

## Optional: Enable Tracking

The quota system integrates with the tracking service. To enable tracking of quota-exceeded events:

1. Ensure tracking database is configured:
   ```bash
   firebase functions:secrets:access NOTION_TRACKING_DB_ID
   firebase functions:secrets:access NOTION_TRACKING_TOKEN
   ```

2. Quota exceeded events will appear in the tracking database with:
   - Action: `quota_exceeded`
   - Status: `Error`
   - Error Message: `Quota exceeded: X/Y (plan: Z)`

## Security Best Practices

1. **Never commit secrets**: Always use Firebase secrets management
2. **Restrict database access**: Only share Notion database with necessary team members
3. **Monitor usage**: Regularly check quota database for anomalies
4. **Rotate tokens**: Periodically regenerate Notion integration token
5. **Set up alerts**: Monitor for suspicious quota patterns

## Next Steps

- ✅ System is ready to use!
- Monitor quota database for usage patterns
- Adjust plan limits as needed in `/functions/src/services/quota.ts`
- Set up billing/subscription system for automatic upgrades
- Consider adding email notifications for quota warnings

For more details, see [QUOTA.md](./QUOTA.md)
