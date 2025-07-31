# API Endpoint: Auth Callback

## Overview

Handles OAuth callbacks from Supabase authentication providers (Google, Apple). This endpoint processes the authentication response and establishes a user session.

## Endpoint Details

- **URL**: `/api/auth/callback`
- **Method**: `GET`
- **Authentication**: None (receives auth code from provider)
- **Rate Limit**: 20 requests per minute per IP

## Request

### Headers

No specific headers required.

### URL Parameters

None.

### Query Parameters

| Parameter         | Type   | Required | Default | Description                            |
| ----------------- | ------ | -------- | ------- | -------------------------------------- |
| code              | string | Yes      | -       | Authorization code from OAuth provider |
| state             | string | No       | -       | CSRF protection state parameter        |
| error             | string | No       | -       | Error code if authentication failed    |
| error_description | string | No       | -       | Detailed error message                 |

### Request Body

None (GET request).

## Response

### Success Response

**Status Code**: `302 Found` (Redirect)

Redirects to:

- `/` - For new users (to start onboarding)
- `/toolkit` - For existing users with completed profiles

Sets HTTP-only cookies:

- `sb-access-token` - JWT access token
- `sb-refresh-token` - JWT refresh token

### Error Responses

| Status Code | Description           | Example                                 |
| ----------- | --------------------- | --------------------------------------- |
| 302         | Redirect with error   | Redirects to `/login?error=auth_failed` |
| 400         | Bad Request           | Missing required parameters             |
| 500         | Internal Server Error | Server error during auth processing     |

## Examples

### OAuth Flow

1. User clicks "Sign in with Google" button
2. Redirected to Google OAuth consent screen
3. After approval, Google redirects to:
   ```
   /api/auth/callback?code=4/0AX4XfWi...&state=xyz123
   ```
4. Endpoint exchanges code for tokens
5. Creates/updates user session
6. Redirects to appropriate page

### Error Handling

If authentication fails:

```
/api/auth/callback?error=access_denied&error_description=User+denied+access
```

Redirects to:

```
/login?error=access_denied
```

## Implementation Notes

- Uses Supabase Auth library for OAuth flow
- Automatically creates user profile on first login
- Handles both social providers (Google, Apple)
- PKCE flow for enhanced security
- Session cookies are HTTP-only and Secure in production

## Related Endpoints

- POST `/api/auth/verify-otp` - For passwordless OTP authentication
- POST `/api/auth/logout` - To sign out user

## Change Log

| Version | Date       | Description                                    |
| ------- | ---------- | ---------------------------------------------- |
| 1.0     | 2024-01-15 | Initial implementation with Google/Apple OAuth |
