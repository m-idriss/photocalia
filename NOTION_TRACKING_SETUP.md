# Notion Usage Tracking Setup Guide

This guide explains how to set up a Notion database for tracking converter usage in the Photocalia application.

## Overview

The usage tracking system logs conversion events to a Notion database, allowing you to monitor:
- Number of conversions performed
- Timestamp of each conversion
- Success/failure status
- Domain origin (local vs production) for environment tracking
- Number of files uploaded/processed
- Number of calendar events extracted from those files
- Processing duration (optional)

## Prerequisites

- A Notion account (free or paid)
- Access to create databases in your Notion workspace
- A Notion integration with API access

## Step 1: Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in the details:
   - **Name**: `Photocalia Usage Tracker` (or any name you prefer)
   - **Logo**: Optional
   - **Associated workspace**: Select your workspace
4. Click **"Submit"**
5. Copy the **Internal Integration Token** (starts with `secret_`)
   - Save this token securely - you'll need it for the `NOTION_TRACKING_TOKEN` environment variable

## Step 2: Create the Tracking Database

1. Create a new **Database** in Notion (full page or inline)
2. Name it: **"Converter Usage Tracking"** (or any name you prefer)
3. Add the following properties (columns):

   | Property Name | Property Type | Description |
   |--------------|---------------|-------------|
   | `Action` | Title | The type of action (e.g., "conversion") |
   | `User ID` | Text | Anonymous user identifier (generated client-side) |
   | `Timestamp` | Date | When the action occurred |
   | `Status` | Select | Success or Error |
   | `Domain` | Text | Origin domain (local, production, or full URL) |
   | `File Count` | Number | Number of files uploaded/processed |
   | `Event Count` | Number | Number of calendar events extracted |
   | `Duration (ms)` | Number | Processing time in milliseconds (optional) |
   | `Error Message` | Text | Error details if status is Error |
   | `Assigned` | Text | User mention for notifications (auto-populated) |

4. Configure the **Status** select property with two options:
   - ✅ **Success** (green)
   - ❌ **Error** (red)

## Step 3: Share Database with Integration

1. Open your **Converter Usage Tracking** database
2. Click **Share** (top right corner)
3. Click **"Add connections"** or **"Add integration"**
4. Select your integration (`Photocalia Usage Tracker`)
5. Click **"Confirm"**

## Step 4: Get the Database ID

The database ID is in the URL of your database page:

```
https://www.notion.so/{workspace}/{database_id}?v={view_id}
```

Example:
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         This is the database ID
```

Copy the database ID (32 characters, alphanumeric).

## Step 5: Get Your Notion User ID (Optional - For Mentions)

To receive notifications when new conversion entries are created, you can configure auto-mentions by getting your Notion User ID:

1. **Using the Notion API Explorer**:
   - Go to your workspace settings
   - Click on **"Connections"** or **"Integrations"**
   - Use the Notion API to list users: `GET https://api.notion.com/v1/users`
   - Find your user object and copy the `id` field

2. **Alternative Method - Using Integration**:
   ```bash
   curl -X GET 'https://api.notion.com/v1/users' \
     -H 'Authorization: Bearer YOUR_INTEGRATION_TOKEN' \
     -H 'Notion-Version: 2022-06-28'
   ```
   - Look for your name in the response
   - Copy the `id` field from your user object (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

3. **Using Notion Pages**:
   - Create a test page and mention yourself using `@yourname`
   - Open the page source/API and find the mention block to extract your user ID

> **Note**: The User ID is a UUID format string (e.g., `12345678-1234-1234-1234-123456789abc`). This enables Notion to send you real-time notifications when new entries are created.

## Step 6: Configure Environment Variables

### For Firebase Functions

Create or update `/functions/.env`:

```bash
# Existing Notion variables (for content)
NOTION_TOKEN=secret_your_existing_token
NOTION_DATASOURCE_ID=your_existing_datasource_id

# NEW: Usage tracking variables
NOTION_TRACKING_TOKEN=secret_your_tracking_integration_token
NOTION_TRACKING_DB_ID=your_tracking_database_id

# Optional: User ID for auto-mentions and notifications
NOTION_USER_ID=your_notion_user_id
```

> **Note**: You can use the same `NOTION_TOKEN` for both content and tracking, or create separate integrations for better security and access control.
> **Tip**: Setting `NOTION_USER_ID` enables automatic mentions in the "Assigned" column, triggering real-time notifications when new conversion entries are created.

### For Local Development

Update `/.env.example` to include:

```bash
# Usage Tracking (Optional)
NOTION_TRACKING_TOKEN=secret_your_tracking_token
NOTION_TRACKING_DB_ID=your_tracking_database_id
NOTION_USER_ID=your_notion_user_id
```

## Step 7: Deploy and Test

1. **Set environment variables in Firebase**:
   
   The tracking variables are set as regular environment variables (not secrets). You can set them using:
   
   ```bash
   firebase functions:config:set \
     notion.tracking_token="secret_your_tracking_integration_token" \
     notion.tracking_db_id="your_tracking_database_id" \
     notion.user_id="your_notion_user_id"
   ```
   
   Or by creating a `.env` file in the `functions/` directory with:
   ```bash
   NOTION_TRACKING_TOKEN=secret_your_tracking_integration_token
   NOTION_TRACKING_DB_ID=your_tracking_database_id
   NOTION_USER_ID=your_notion_user_id
   ```

2. **Deploy functions** (if using Firebase):
   ```bash
   cd functions
   npm run deploy
   ```

3. **Test the tracking**:
   - Convert an image using the converter feature
   - Check your Notion database - a new entry should appear within seconds

## Database Schema

Here's the complete schema for reference:

```typescript
interface UsageTrackingEntry {
  Action: string;           // "conversion"
  "User ID": string;        // Anonymous ID (e.g., UUID)
  Timestamp: Date;          // ISO 8601 timestamp
  Status: "Success" | "Error";
  Domain?: string;          // "local", "production", or full URL
  "File Count": number;     // Number of files uploaded/processed
  "Event Count"?: number;   // Number of calendar events extracted
  "Duration (ms)"?: number; // Optional processing time
  "Error Message"?: string; // Optional error details
  Assigned?: string;        // User mention for notifications (auto-populated)
}
```

## Example Entry

After a successful conversion, you'll see entries like:

| Action | User ID | Timestamp | Status | Domain | File Count | Event Count | Duration (ms) | Error Message | Assigned |
|--------|---------|-----------|--------|--------|------------|-------------|---------------|---------------|----------|
| conversion | abc123-def456 | 2025-11-11 12:00:00 | ✅ Success | production | 2 | 5 | 1250 | - | @Admin |
| conversion | xyz789-uvw012 | 2025-11-11 12:05:00 | ❌ Error | local | 1 | 0 | - | Invalid file format | @Admin |

## Monitoring and Analytics

You can create Notion views to analyze your data:

1. **Total Conversions**: Count view filtered by Status = Success
2. **Error Rate**: Formula property: `Error Count / Total Count * 100`
3. **Usage by Date**: Timeline view grouped by Timestamp
4. **Usage by Domain**: Group by Domain to see local vs production traffic
   - "local" = localhost (127.x.x.x), 10.x.x.x, 192.168.x.x, and 172.16-31.x.x addresses
   - "production" = photocalia.com and www.photocalia.com
   - Other values = actual hostname for other sources
5. **Average Processing Time**: Average of Duration (ms) property
6. **Total Files Processed**: Sum of File Count property
7. **Total Events Created**: Sum of Event Count property for marketing metrics
8. **Events per File**: Formula property: `Event Count / File Count` (average efficiency)
9. **Real-time Notifications**: If `NOTION_USER_ID` is configured, the "Assigned" column will automatically mention you, triggering instant notifications for each new conversion entry

## Privacy Notes

- The tracking system generates **anonymous user IDs** using the current timestamp and a random value (e.g., `anon_<timestamp>_<random>`)
- **No personal information** (email, name, IP address) is collected
- User IDs are **not linked to authentication** accounts
- Data is stored **only in your private Notion workspace**

## Troubleshooting

### Entries not appearing in Notion

1. **Check integration permissions**: Ensure the database is shared with your integration
2. **Verify environment variables**: Confirm `NOTION_TRACKING_TOKEN` and `NOTION_TRACKING_DB_ID` are set correctly
3. **Check function logs**: Look for errors in Firebase Functions logs
4. **Test API connection**: Use Notion's API to manually create a test entry

### Error: "object not found"

- The database ID is incorrect, or
- The integration doesn't have access to the database

### Tracking is disabled

- If `NOTION_TRACKING_DB_ID` is not set, tracking is automatically disabled (feature is optional)

## Optional: Rate Limiting

If you have high traffic, consider implementing rate limiting:

1. Add a **buffer/batching mechanism** (send data every 30-60 seconds)
2. Use **Firestore** as an intermediate cache
3. Implement **Notion API rate limits** (≈ 3 requests/sec)

Example implementation in `converter.ts`:

```typescript
// Batch tracking entries
const trackingQueue: UsageEntry[] = [];

setInterval(() => {
  if (trackingQueue.length > 0) {
    batchLogToNotion(trackingQueue);
    trackingQueue.length = 0;
  }
}, 60000); // Every 60 seconds
```

## Security Best Practices

1. **Never commit** `.env` files with real tokens
2. **Use Firebase Secrets Manager** for production tokens
3. **Create separate integrations** for development and production
4. **Regularly rotate** integration tokens
5. **Monitor API usage** in Notion settings

## Support

For issues with this setup, check:
- [Notion API Documentation](https://developers.notion.com/)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- Project GitHub Issues

---

**Last Updated**: 2025-11-11
