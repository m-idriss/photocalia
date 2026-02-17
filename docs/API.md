# API Documentation

> Documentation for the Photocalia API endpoints provided by the external backend service.

## Table of Contents

- [Overview](#overview)
- [Backend API Structure](#backend-api-structure)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)

---

## Overview

The application uses an external backend API ([3dime-api](https://github.com/m-idriss/3dime-api)) to provide backend functionality. The backend is built with **Quarkus**, a modern Java framework optimized for cloud-native applications, providing fast startup times and low memory footprint. All endpoints are accessed through a unified API service.

### Architecture

```
Client → Backend API (3dime-api) → External APIs
         └── Proxy Layer
         ├── GitHub API
         ├── Notion API
         ├── OpenAI API (Converter)
         └── Statistics
```

### Base URL

```
Production: https://api.photocalia.com
```

---

## Backend API Structure

The backend API is a **Quarkus-based microservice** that handles:
- AI-powered calendar conversion
- GitHub integration
- Notion integration
- Usage tracking and quotas
- Caching and optimization

**Technology Stack:**
- **Framework**: Quarkus (Supersonic Subatomic Java)
- **Language**: Java
- **Architecture**: RESTful microservice
- **Deployment**: Cloud-native with fast startup and low memory usage

For detailed backend implementation, see the [3dime-api repository](https://github.com/m-idriss/3dime-api).

---

## API Endpoints

### Converter API

AI-powered calendar conversion endpoint.

**Endpoint**: `/converter`  
**Method**: `POST`  
**Authentication**: Required (Firebase ID token)

#### Request Body

```json
{
  "files": [
    {
      "dataUrl": "data:image/png;base64,...",
      "name": "calendar.png",
      "type": "image/png"
    }
  ],
  "timeZone": "America/New_York",
  "currentDate": "2025-02-17",
  "userId": "user123"
}
```

#### Response

```json
{
  "success": true,
  "icsContent": "BEGIN:VCALENDAR\nVERSION:2.0\n...",
  "events": [
    {
      "title": "Meeting",
      "start": "2025-02-17T10:00:00",
      "end": "2025-02-17T11:00:00",
      "location": "Office",
      "description": "Team meeting"
    }
  ]
}
```

---

### Quota Status

Check user's conversion quota.

**Endpoint**: `/converter/quotaStatus`  
**Method**: `GET`  
**Authentication**: Required

#### Query Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `userId`  | string | Yes      | User ID     |

#### Response

```json
{
  "remaining": 10,
  "limit": 20,
  "resetDate": "2025-03-01T00:00:00Z"
}
```

---

### Statistics

Get application usage statistics.

**Endpoint**: `/stats`  
**Method**: `GET`

#### Response

```json
{
  "totalConversions": 1234,
  "activeUsers": 567,
  "successRate": 0.95
}
```

---

## Error Handling

### Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description",
  "details": "Additional error information"
}
```

### Common HTTP Status Codes

| Code | Description           | Cause                            |
| ---- | --------------------- | -------------------------------- |
| 200  | OK                    | Request successful               |
| 400  | Bad Request           | Invalid request parameters       |
| 401  | Unauthorized          | Missing or invalid authentication|
| 429  | Too Many Requests     | Quota exceeded                   |
| 500  | Internal Server Error | Backend error or external API failure |

### Example Error Handling

```typescript
this.http
  .post(`${apiUrl}/converter`, requestData)
  .pipe(
    catchError((error) => {
      console.error('API Error:', error.error);
      // Handle specific error codes
      if (error.status === 429) {
        this.toastService.show('Quota exceeded. Please try again later.');
      }
      return throwError(() => error);
    }),
  )
  .subscribe((data) => {
    // Handle successful response
  });
```

---

## Authentication

### Firebase Authentication

The API requires Firebase Authentication tokens for protected endpoints.

#### Getting an ID Token

```typescript
import { Auth, user } from '@angular/fire/auth';

// Get current user's ID token
const currentUser = await this.auth.currentUser;
if (currentUser) {
  const idToken = await currentUser.getIdToken();
  // Use idToken in Authorization header
}
```

#### Request Headers

```http
POST /converter
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Anonymous users**: 5 conversions per day
- **Authenticated users**: 20 conversions per day
- **Premium users**: Unlimited conversions

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1709251200
```

---

## Additional Resources

- [3dime-api Repository](https://github.com/m-idriss/3dime-api) - Backend service source code
- [Converter Documentation](CONVERTER.md) - Calendar converter feature details
- [Authentication Setup](FIREBASE_AUTH_SETUP.md) - Firebase Auth configuration
- [Development Guide](DEVELOPMENT.md) - Local development setup
