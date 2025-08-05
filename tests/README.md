# Testing Guide

This guide explains the different types of tests in the LattixIQ project and how to properly handle authentication in each.

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, components, or modules in isolation

**Location**: Colocated with source files (e.g., `component.test.tsx`)

**Authentication**: Not applicable - unit tests should not depend on authentication

**Example**:

```typescript
// components/Button.test.tsx
it("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
```

### 2. Integration Tests

**Purpose**: Test how different parts of the application work together

**Location**:

- API tests: `app/api/*/__tests__/*.test.ts`
- Component integration: `components/*/__tests__/*.test.tsx`

**Authentication**: Use mocked authentication via `INTEGRATION_TEST` environment variable

**Example**:

```typescript
// app/api/roadmaps/__tests__/roadmaps.integration.test.ts
import { setupIntegrationTestAuth, teardownIntegrationTestAuth } from "@/tests/utils/auth-mocks";

describe("API Integration Test", () => {
  beforeAll(() => {
    setupIntegrationTestAuth();
  });

  afterAll(() => {
    teardownIntegrationTestAuth();
  });

  it("creates roadmap for authenticated user", async () => {
    const response = await fetch("/api/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalDescription: "..." }),
    });
    expect(response.status).toBe(201);
  });
});
```

### 3. E2E Tests

**Purpose**: Test complete user workflows through the entire application

**Location**: `tests/e2e/*.spec.ts`

**Authentication**: Use real authentication flow with test users

**Example**:

```typescript
// tests/e2e/roadmap-creation.spec.ts
test("user can create and complete roadmap", async ({ page }) => {
  // Login with real auth
  await page.goto("/login");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');

  // Test real user flow
  await page.goto("/new-roadmap");
  // ... rest of test
});
```

## Authentication Handling

### Integration Tests

Integration tests use a mock authentication system that:

- Returns a consistent test user when `INTEGRATION_TEST=true`
- Bypasses cookie-based authentication
- Provides predictable responses for testing

**Key Files**:

- `tests/utils/auth-mocks.ts` - Mock user definitions and utilities
- `lib/supabase/server.ts` - Server client with test mode support

### E2E Tests

E2E tests use the real authentication system:

- Create actual test users in Supabase
- Use real login flows
- Test actual session management

## Best Practices

1. **Don't mix authentication concerns**: Integration tests should assume authentication works and focus on business logic

2. **Use appropriate mocks**:
   - Unit tests: Mock at the component/function boundary
   - Integration tests: Mock at the authentication layer
   - E2E tests: Use real authentication

3. **Keep tests focused**: Each test should verify one specific behavior

4. **Clean up after tests**: Always tear down test data and environment variables

## Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## Environment Variables

- `INTEGRATION_TEST=true` - Enables mock authentication for integration tests
- `NEXT_PUBLIC_E2E_TEST=true` - Enables E2E test mode with mock API responses
