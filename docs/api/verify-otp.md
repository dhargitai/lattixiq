# API Endpoint: Verify OTP

## Overview

Verifies a one-time password (OTP) sent to the user's email for passwordless authentication. Users receive a 6-digit code via email that they must enter to complete authentication.

## Endpoint Details

- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Authentication**: None
- **Rate Limit**: 10 requests per minute per IP

## Request

### Headers

| Header       | Type   | Required | Description                |
| ------------ | ------ | -------- | -------------------------- |
| Content-Type | string | Yes      | Must be `application/json` |

### Request Body

```typescript
interface VerifyOTPRequest {
  email: string;
  token: string; // 6-digit OTP code
  type: "email"; // OTP type for email authentication
}
```

Example:

```json
{
  "email": "user@example.com",
  "token": "123456",
  "type": "email"
}
```

## Response

### Success Response

**Status Code**: `200 OK`

```typescript
interface VerifyOTPResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
    email_confirmed_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  };
  isNewUser: boolean;
}
```

Example:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2024-01-15T10:00:00Z",
    "email_confirmed_at": "2024-01-15T10:05:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "v1.MYhl3bG...",
    "expires_in": 3600,
    "expires_at": 1705325100
  },
  "isNewUser": false
}
```

### Error Responses

| Status Code | Description           | Example                                |
| ----------- | --------------------- | -------------------------------------- |
| 400         | Bad Request           | Invalid request body or missing fields |
| 401         | Unauthorized          | Invalid or expired OTP code            |
| 422         | Unprocessable Entity  | Email format invalid                   |
| 429         | Too Many Requests     | Rate limit exceeded                    |
| 500         | Internal Server Error | Server error                           |

Error Response Format:

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "The OTP code is invalid or has expired",
    "details": {
      "expired": true
    }
  }
}
```

## Examples

### JavaScript/TypeScript

```typescript
const response = await fetch("/api/auth/verify-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    token: "123456",
    type: "email",
  }),
});

if (response.ok) {
  const { user, session, isNewUser } = await response.json();

  if (isNewUser) {
    // Redirect to onboarding
    window.location.href = "/onboarding";
  } else {
    // Redirect to dashboard
    window.location.href = "/toolkit";
  }
}
```

### cURL

```bash
curl -X POST https://api.lattixiq.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "123456",
    "type": "email"
  }'
```

## Implementation Notes

- OTP codes are 6 digits long
- OTP codes expire after 10 minutes
- Each code can only be used once
- Users can request a new code after 30 seconds
- Automatically creates user profile for new users
- Sets secure HTTP-only cookies for session management
- Implements rate limiting to prevent brute force attacks

## Security Considerations

- OTP codes are cryptographically secure random numbers
- Email verification is required before account activation
- Failed attempts are logged for security monitoring
- IP-based rate limiting prevents abuse
- Maximum of 5 failed attempts before temporary lockout

## Related Endpoints

- GET `/api/auth/callback` - OAuth provider callback
- POST `/api/auth/logout` - Sign out user
- POST `/api/auth/send-otp` - Request new OTP code

## Change Log

| Version | Date       | Description                                    |
| ------- | ---------- | ---------------------------------------------- |
| 2.0     | 2024-01-20 | Changed from magic links to 6-digit OTP codes  |
| 1.0     | 2024-01-15 | Initial implementation with magic link support |
