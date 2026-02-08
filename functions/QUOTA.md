# Quota System Documentation

## Overview

The quota system limits the number of conversions a user can perform per month based on their subscription plan. This prevents abuse and prepares the system for future subscription tiers.

## Features

- **Monthly Usage Limits**: Track and enforce conversion limits per user per month
- **Multiple Plan Tiers**: Support for free, pro, and premium plans with different limits
- **Automatic Reset**: Usage counts reset monthly at the start of each month
- **Anonymous Support**: Track anonymous users separately
- **Graceful Degradation**: If quota service is disabled, all requests are allowed
- **Quota Exceeded Logging**: All quota exceeded events are logged for analytics

## Plan Limits

| Plan | Monthly Conversion Limit |
|------|------------------------|
| Free | 3 conversions |
| Pro | 100 conversions |
| Premium | 1000 conversions |

## Notion Database Schema

The quota system requires a Notion database with the following schema:

### Database Properties

| Property Name | Type | Description |
|--------------|------|-------------|
| User ID | Title | Unique identifier for the user (e.g., email, UUID, or "anonymous") |
| Usage Count | Number | Number of conversions used this month |
| Last Reset | Date | Timestamp of the last monthly reset |
| Plan | Select | User's subscription plan (options: free, pro, premium) |

### Select Options for "Plan"

- `free` (default)
- `pro`
- `premium`

### Example Database Entry

```
User ID: user@example.com
Usage Count: 2
Last Reset: 2025-11-15
Plan: free
```

## Environment Variables

The quota service requires the following environment variables:

```bash
# Notion API token for quota database access
NOTION_TRACKING_TOKEN=secret_xxx

# Notion database ID for quota storage
NOTION_QUOTA_DB_ID=xxx-xxx-xxx-xxx
```

### Setting Environment Variables

For Firebase Functions:

```bash
# Set quota token
firebase functions:config:set notion.quota_token="secret_xxx"

# Set quota database ID
firebase functions:config:set notion.quota_db_id="xxx-xxx-xxx-xxx"

# Deploy with new config
firebase deploy --only functions
```

For local development (`.env` file):

```bash
NOTION_TRACKING_TOKEN=secret_xxx
NOTION_QUOTA_DB_ID=xxx-xxx-xxx-xxx
```

## API Behavior

### Successful Conversion (Within Quota)

**Request:**
```bash
POST /converterFunction
{
  "userId": "user@example.com",
  "files": [...]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "icsContent": "BEGIN:VCALENDAR..."
}
```

### Quota Exceeded

**Request:**
```bash
POST /converterFunction
{
  "userId": "user@example.com",
  "files": [...]
}
```

**Response (429 Too Many Requests):**
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

## Implementation Details

### QuotaService Class

Located in `/functions/src/services/quota.ts`

#### Key Methods

- `checkQuota(userId: string)`: Check if user has quota available
- `incrementUsage(userId: string)`: Increment usage count after successful conversion
- `getQuotaStatus(userId: string)`: Get current quota status for a user
- `getQuotaLimit(plan: PlanType)`: Get quota limit for a plan

### Integration with converterFunction

The quota check is integrated early in the conversion pipeline:

1. Extract userId from request (or use "anonymous")
2. Check quota availability
3. If exceeded, return HTTP 429 with error message
4. Process conversion if quota allows
5. Increment usage count on successful conversion
6. Log quota-exceeded events for analytics

### Tracking Integration

Quota exceeded events are logged to the tracking service:

```typescript
trackingService.logQuotaExceeded(
  userId,
  usageCount,
  limit,
  plan,
  domain
);
```

This creates entries in the tracking database with:
- Action: `quota_exceeded`
- Status: `Error`
- Error Message: `Quota exceeded: X/Y (plan: Z)`

## Manual Quota Management

Administrators can manually manage user quotas through the Notion database:

### Increase User Quota

1. Open the Notion quota database
2. Find the user's entry
3. Change the "Plan" to `pro` or `premium`
4. The new limit will apply immediately on next request

### Reset User Quota

1. Open the Notion quota database
2. Find the user's entry
3. Set "Usage Count" to `0`
4. Update "Last Reset" to current date

### Add New User Entry

New users are automatically created with default values on first request:
- Usage Count: 0
- Last Reset: Current date
- Plan: free

But you can pre-create entries manually:
1. Click "New" in the Notion database
2. Fill in the User ID
3. Set Usage Count to 0
4. Set Last Reset to current date
5. Select Plan (default: free)

## Testing

### Test with cURL

**Test within quota:**
```bash
curl -X POST https://converterfunction-xxx.run.app \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "files": [{"dataUrl": "data:image/jpeg;base64,..."}],
    "timeZone": "UTC",
    "currentDate": "2025-11-15"
  }'
```

**Test quota exceeded:**
Make 4 requests with the same userId (free plan limit is 3):
```bash
for i in {1..4}; do
  echo "Request $i"
  curl -X POST https://converterfunction-xxx.run.app \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "test-user-2",
      "files": [{"dataUrl": "data:image/jpeg;base64,..."}],
      "timeZone": "UTC",
      "currentDate": "2025-11-15"
    }'
  echo ""
done
```

The 4th request should return HTTP 429.

## Monitoring

Monitor quota system health through:

1. **Tracking Database**: Check for `quota_exceeded` events
2. **Firebase Function Logs**: Look for quota-related log messages
3. **Quota Database**: Monitor usage patterns and trends

### Log Messages

- `Quota service ENABLED`: Quota system initialized successfully
- `Quota service DISABLED`: Quota system disabled (missing config)
- `Quota entry created`: New user added to quota database
- `Quota entry updated`: User quota data updated
- `Quota check error`: Error checking quota (allows request by default)
- `Failed to increment usage`: Error incrementing usage count

## Security Considerations

- **API Token Security**: Keep NOTION_TRACKING_TOKEN secret
- **Database Permissions**: Restrict database access to function service account
- **Rate Limiting**: Quota system provides basic rate limiting per user
- **Anonymous Users**: All anonymous users share the same quota (consider using client headers for better identification)

## Future Enhancements

- [ ] Add `X-Client-Origin` header for better anonymous user tracking
- [ ] Implement hourly or daily quotas in addition to monthly
- [ ] Add webhook for real-time quota alerts
- [ ] Create admin dashboard for quota management
- [ ] Add subscription payment integration
- [ ] Implement usage analytics and reporting
- [ ] Add grace period for users exceeding quota
- [ ] Support for custom quota limits per user
- [ ] Email notifications when quota is near limit

## Troubleshooting

### Quota service not working

**Symptom**: All requests are allowed even when quota should be exceeded

**Solutions**:
1. Check environment variables are set correctly
2. Verify Notion database ID is correct
3. Check Notion API token has access to database
4. Review function logs for error messages

### Users can't convert even with available quota

**Symptom**: HTTP 429 returned when user should have quota

**Solutions**:
1. Check user's entry in Notion database
2. Verify "Last Reset" date is correct
3. Manually reset "Usage Count" to 0
4. Check for timezone issues with monthly reset

### Quota not resetting monthly

**Symptom**: Usage count doesn't reset at the start of a new month

**Solutions**:
1. Monthly reset happens on first request after the month changes
2. Check timezone of server vs user
3. Verify "Last Reset" date is being updated correctly
4. Check for errors in quota service logs

## Support

For issues or questions about the quota system:
1. Check function logs in Firebase Console
2. Review tracking database for quota_exceeded events
3. Verify Notion database schema matches documentation
4. Open an issue on GitHub with relevant logs
