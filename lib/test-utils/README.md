# Test Utilities - Type-Safe Testing

This directory contains type-safe testing utilities to replace the use of `as any` and `eslint-disable` comments in test files.

## Usage Examples

Instead of using `as any` in tests:

```typescript
// ❌ FORBIDDEN
(useRouter as any).mockReturnValue(mockRouter);
vi.mocked(createClient).mockReturnValue(mockSupabase as any);

// ✅ CORRECT - Use proper mocking patterns
import { vi } from "vitest";

// Create properly typed mocks
const mockRouter = {
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  pathname: "/test",
  query: {},
  asPath: "/test",
};

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
};

// Use with proper typing
vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));
```

## Common Patterns

### 1. Mocking useRouter

```typescript
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/test",
  query: { stepId: "123" },
};

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));
```

### 2. Mocking Supabase Client

```typescript
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  })),
  rpc: vi.fn(),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));
```

### 3. Mocking React Hooks

```typescript
const mockUseAuth = vi.fn();

vi.mock("@/lib/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));
```

## Testing Best Practices

1. **Always type your mocks** - Define the structure explicitly
2. **Use vi.mock() instead of manual mocking** - Provides better type inference
3. **Create reusable mock factories** - For common patterns
4. **Test the actual behavior** - Don't just test the mock
5. **Avoid `as any` at all costs** - Find proper typing solutions
