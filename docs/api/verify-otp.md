# API Endpoint: Verify OTP

## Overview

Verifies a one-time password (OTP) sent to the user's email for passwordless authentication. This endpoint completes the magic link authentication flow.

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
  token: string;
  type: "magiclink" | "signup" | "recovery";
}
```

Example:

```json
{
  "email": "user@example.com",
  "token": "123456",
  "type": "magiclink"
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
| 401         | Unauthorized          | Invalid or expired OTP token           |
| 422         | Unprocessable Entity  | Email format invalid                   |
| 429         | Too Many Requests     | Rate limit exceeded                    |
| 500         | Internal Server Error | Server error                           |

Error Response Format:

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "The OTP token is invalid or has expired",
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
    type: "magiclink",
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
    "type": "magiclink"
  }'
```

## Implementation Notes

- OTP tokens expire after 10 minutes
- Each token can only be used once
- Automatically creates user profile for new users
- Sets secure HTTP-only cookies for session management
- Implements rate limiting to prevent brute force attacks

## Security Considerations

- Tokens are cryptographically secure random strings
- Email verification is required before account activation
- Failed attempts are logged for security monitoring
- IP-based rate limiting prevents abuse

## Related Endpoints

- GET `/api/auth/callback` - OAuth provider callback
- POST `/api/auth/logout` - Sign out user
- POST `/api/auth/send-otp` - Request new OTP

## Change Log

| Version | Date       | Description                                    |
| ------- | ---------- | ---------------------------------------------- |
| 1.0     | 2024-01-15 | Initial implementation with magic link support |
