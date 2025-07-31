# API Endpoint: [Endpoint Name]

## Overview

Brief description of what this endpoint does and its purpose in the application.

## Endpoint Details

- **URL**: `/api/[resource]/[action]`
- **Method**: `GET` | `POST` | `PUT` | `PATCH` | `DELETE`
- **Authentication**: Required | Optional | None
- **Rate Limit**: [requests per minute/hour]

## Request

### Headers

| Header        | Type   | Required | Description                     |
| ------------- | ------ | -------- | ------------------------------- |
| Authorization | string | Yes/No   | Bearer token for authentication |
| Content-Type  | string | Yes      | Must be `application/json`      |

### URL Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| id        | string | Yes/No   | Resource identifier |

### Query Parameters

| Parameter | Type   | Required | Default | Description                |
| --------- | ------ | -------- | ------- | -------------------------- |
| page      | number | No       | 1       | Page number for pagination |
| limit     | number | No       | 10      | Number of items per page   |

### Request Body

```typescript
interface RequestBody {
  // TypeScript interface definition
}
```

Example:

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## Response

### Success Response

**Status Code**: `200 OK` | `201 Created` | `204 No Content`

```typescript
interface SuccessResponse {
  // TypeScript interface definition
}
```

Example:

```json
{
  "data": {
    "id": "123",
    "field1": "value1",
    "field2": "value2"
  },
  "message": "Success message"
}
```

### Error Responses

| Status Code | Description           | Example                           |
| ----------- | --------------------- | --------------------------------- |
| 400         | Bad Request           | Invalid request body              |
| 401         | Unauthorized          | Missing or invalid authentication |
| 403         | Forbidden             | Insufficient permissions          |
| 404         | Not Found             | Resource not found                |
| 422         | Unprocessable Entity  | Validation errors                 |
| 429         | Too Many Requests     | Rate limit exceeded               |
| 500         | Internal Server Error | Server error                      |

Error Response Format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Examples

### cURL

```bash
curl -X GET https://api.lattixiq.com/api/resource \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/TypeScript

```typescript
const response = await fetch("/api/resource", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
```

### Python

```python
import requests

response = requests.get(
    'https://api.lattixiq.com/api/resource',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
)

data = response.json()
```

## Implementation Notes

- Additional technical details
- Performance considerations
- Security notes
- Related endpoints

## Change Log

| Version | Date       | Description            |
| ------- | ---------- | ---------------------- |
| 1.0     | YYYY-MM-DD | Initial implementation |
