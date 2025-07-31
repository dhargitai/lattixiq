# API Documentation

This directory contains comprehensive documentation for all API endpoints in the LattixIQ application.

## Overview

LattixIQ's API is built using Next.js API Routes, which deploy as serverless functions. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.lattixiq.com/api`

## Authentication

Most endpoints require authentication using a Bearer token in the Authorization header:

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Tokens are obtained through:

1. OAuth authentication (Google/Apple)
2. Magic link (OTP) authentication

## Common Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## API Endpoints

### Authentication

| Endpoint                                 | Method | Description             |
| ---------------------------------------- | ------ | ----------------------- |
| [/api/auth/callback](./auth-callback.md) | GET    | OAuth provider callback |
| [/api/auth/verify-otp](./verify-otp.md)  | POST   | Verify magic link OTP   |

### Roadmaps

| Endpoint           | Method | Description          |
| ------------------ | ------ | -------------------- |
| /api/roadmaps      | GET    | List user's roadmaps |
| /api/roadmaps      | POST   | Create new roadmap   |
| /api/roadmaps/[id] | GET    | Get specific roadmap |
| /api/roadmaps/[id] | PATCH  | Update roadmap       |
| /api/roadmaps/[id] | DELETE | Delete roadmap       |

### Reflection Logs

| Endpoint       | Method | Description                 |
| -------------- | ------ | --------------------------- |
| /api/logs      | GET    | List user's reflection logs |
| /api/logs      | POST   | Create new reflection log   |
| /api/logs/[id] | GET    | Get specific log            |
| /api/logs/[id] | PATCH  | Update log                  |

### User Profile

| Endpoint     | Method | Description              |
| ------------ | ------ | ------------------------ |
| /api/user/me | GET    | Get current user profile |
| /api/user/me | PATCH  | Update user profile      |

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

## Status Codes

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 200  | OK - Request succeeded                               |
| 201  | Created - Resource created successfully              |
| 204  | No Content - Request succeeded with no response body |
| 400  | Bad Request - Invalid request format                 |
| 401  | Unauthorized - Authentication required               |
| 403  | Forbidden - Insufficient permissions                 |
| 404  | Not Found - Resource not found                       |
| 422  | Unprocessable Entity - Validation failed             |
| 429  | Too Many Requests - Rate limit exceeded              |
| 500  | Internal Server Error - Server error                 |

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **Authentication endpoints**: 10-20 requests per minute
- **Data endpoints**: 60 requests per minute
- **AI endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705325100
```

## Pagination

List endpoints support pagination using query parameters:

```
GET /api/roadmaps?page=2&limit=20
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Versioning

The API currently uses URL path versioning. Future versions will be available at:

- `/api/v1/...` (current)
- `/api/v2/...` (future)

## Creating New Endpoints

To document a new endpoint:

1. Copy the template: `cp api-endpoint-template.md your-endpoint.md`
2. Fill in all sections with accurate information
3. Include TypeScript interfaces for type safety
4. Provide examples in multiple languages
5. Document all possible error responses
6. Add the endpoint to this README

## Security Best Practices

1. Always validate input data
2. Use parameterized queries to prevent SQL injection
3. Implement proper authentication and authorization
4. Rate limit sensitive endpoints
5. Log security-relevant events
6. Use HTTPS in production
7. Sanitize error messages to avoid information leakage

## Support

For API support or questions:

- Check the [troubleshooting guide](../../README.md#troubleshooting)
- Review [architecture documentation](../architecture/)
- Create an issue on [GitHub](https://github.com/yourusername/lattixiq-app/issues)
