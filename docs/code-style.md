# Code Style Guide

This document outlines the coding standards and conventions for the LattixIQ project. Following these guidelines ensures consistency, maintainability, and readability across the codebase.

## 🔴 ZERO TOLERANCE POLICY: Type Safety & Professional Standards

### ABSOLUTELY PROHIBITED - NEVER DO THESE

The following practices are **FORBIDDEN** and will result in immediate code rejection:

#### 1. **NEVER** Use `as any`

```typescript
// ❌ FORBIDDEN - This is lazy, unprofessional coding
const result = data as any;
const response = (await fetch("/api/data")) as any;

// ✅ CORRECT - Always define proper types
interface ApiResponse {
  success: boolean;
  data: UserData;
  error?: string;
}
const response: ApiResponse = await fetch("/api/data").then((r) => r.json());
```

#### 2. **NEVER** Disable ESLint Rules

```typescript
// ❌ FORBIDDEN - This hides real problems
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const user = data as any;

// ❌ FORBIDDEN - NEVER disable TypeScript
// @ts-ignore
// @ts-nocheck

// ✅ CORRECT - Fix the underlying type issue instead
interface User {
  id: string;
  name: string;
  email: string;
}
const user: User = data;
```

#### 3. **NEVER** Use `any` in Test Mocks

```typescript
// ❌ FORBIDDEN - Even in tests, proper typing matters
vi.mocked(createClient).mockReturnValue(mockSupabase as any);
(useRouter as any).mockReturnValue(mockRouter);

// ✅ CORRECT - Use proper mocking with types
const mockSupabase = createMockSupabaseClient();
vi.mocked(createClient).mockReturnValue(mockSupabase);
```

### Professional Type Definition Process

When you encounter a type error, follow this **mandatory** process:

1. **STOP** - Do not use `as any` or disable linting
2. **ANALYZE** - Understand what type is actually needed
3. **DEFINE** - Create the proper type in the correct location
4. **USE** - Apply the type properly throughout your code

#### Type Definition Locations

- **Database types**: `/lib/supabase/database.types.ts` (auto-generated from Supabase)
- **Application types**: `/lib/supabase/types.ts` (extends database types)
- **Feature-specific types**: `/lib/types/[feature].ts` (e.g., `ai.ts`, `roadmap.ts`)
- **Shared utilities**: `/lib/utils/[utility].ts`
- **Test helpers**: `/lib/test-utils.ts`

#### Example: Handling RPC Functions

Instead of `as any` for RPC functions:

```typescript
// ❌ FORBIDDEN
const { data } = await (supabase.rpc as any)("complete_step_and_unlock_next", params);

// ✅ CORRECT - Extend Supabase types
// In lib/supabase/database.types.ts or lib/supabase/types.ts
declare module "@supabase/supabase-js" {
  interface SupabaseClient {
    rpc<T = any>(
      fn: "complete_step_and_unlock_next",
      params: { p_step_id: string; p_roadmap_id: string }
    ): Promise<{ data: T; error: PostgrestError | null }>;
  }
}

// Then use with proper typing
const { data, error } = await supabase.rpc<StepUnlockResult>(
  "complete_step_and_unlock_next",
  params
);
```

### Enforcement Mechanisms

These violations will be caught by:

1. **Pre-commit hooks** - Automatic rejection
2. **CI/CD pipeline** - PR will be blocked
3. **Code review** - Mandatory reviewer rejection
4. **ESLint configuration** - Strict rules enabled

### The Professional Standard

As a professional developer, you are expected to:

- **Think through type definitions** before writing code
- **Create proper types** instead of shortcuts
- **Understand the domain** you're working in
- **Ask for help** when types are genuinely complex
- **Never compromise** on type safety for convenience

Remember: Every `as any` or `eslint-disable` is technical debt that will cost more time later than it saves now.

## Table of Contents

- [Core Principles](#core-principles)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Patterns](#react-component-patterns)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Functional Programming Principles](#functional-programming-principles)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Performance Best Practices](#performance-best-practices)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Documentation Standards](#documentation-standards)

## Core Principles

### 1. Immutability First

Always prefer immutable data structures and operations:

```typescript
// ❌ Bad: Mutates the original array
function addItem(items: Item[], newItem: Item) {
  items.push(newItem);
  return items;
}

// ✅ Good: Returns a new array
function addItem(items: Item[], newItem: Item) {
  return [...items, newItem];
}

// ❌ Bad: Mutates the original object
function updateUser(user: User, name: string) {
  user.name = name;
  return user;
}

// ✅ Good: Returns a new object
function updateUser(user: User, name: string) {
  return { ...user, name };
}
```

### 2. Pure Functions

Functions should be deterministic and free of side effects:

```typescript
// ❌ Bad: Side effect (modifies external state)
let total = 0;
function addToTotal(value: number) {
  total += value;
  return total;
}

// ✅ Good: Pure function
function addToTotal(currentTotal: number, value: number) {
  return currentTotal + value;
}

// ❌ Bad: Non-deterministic (depends on current time)
function getGreeting(name: string) {
  const hour = new Date().getHours();
  return hour < 12 ? `Good morning, ${name}` : `Good afternoon, ${name}`;
}

// ✅ Good: Deterministic (time passed as parameter)
function getGreeting(name: string, hour: number) {
  return hour < 12 ? `Good morning, ${name}` : `Good afternoon, ${name}`;
}
```

### 3. Type Safety

Leverage TypeScript's type system fully:

```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ Good: Properly typed
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

## TypeScript Guidelines

### Strict Mode Enforcement

**MANDATORY**: All code must use TypeScript strict mode. Our `tsconfig.json` enforces:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Professional Type Definition Standards

#### Type Definition Process (MANDATORY)

When you need to define types, follow this exact process:

1. **Analyze the data structure** - What fields, types, and relationships exist?
2. **Choose the correct location** - Where should this type live? (see Type Locations above)
3. **Define comprehensive types** - Include all fields, optional/mandatory status
4. **Test the type** - Ensure it compiles without `as any` or `// @ts-ignore`

#### Type Definition Examples

```typescript
// ✅ CORRECT - Properly defined types
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  reminderEnabled?: boolean;
  timezone?: string;
}

// ✅ CORRECT - Test mock types
type MockSupabaseClient = {
  auth: {
    getUser: () => Promise<{ data: { user: User | null }; error: Error | null }>;
  };
  from: (table: string) => {
    select: () => Promise<{ data: any[] | null; error: Error | null }>;
  };
};

// ✅ CORRECT - RPC function types
interface CompleteStepResult {
  success: boolean;
  next_step_id?: string;
  unlocked_steps: string[];
}

// ❌ FORBIDDEN - Never use any
const mockSupabase = {} as any;
const userData = response as any;
```

#### Handling Complex Types

For complex scenarios like Supabase RPC functions or third-party libraries:

```typescript
// ✅ CORRECT - Module augmentation for Supabase RPC
import "@supabase/supabase-js";

declare module "@supabase/supabase-js" {
  interface SupabaseClient {
    rpc<T = any>(
      fn: "complete_step_and_unlock_next",
      params: { p_step_id: string; p_roadmap_id: string }
    ): Promise<{ data: T; error: PostgrestError | null }>;

    rpc<T = any>(
      fn: "get_user_roadmap_progress",
      params: { user_id: string }
    ): Promise<{ data: UserProgress[]; error: PostgrestError | null }>;
  }
}

// ✅ CORRECT - Third-party library types
// Create /lib/types/external-libs.ts
interface CustomRouter {
  push: (url: string) => Promise<boolean>;
  replace: (url: string) => Promise<boolean>;
  pathname: string;
  query: Record<string, string | string[] | undefined>;
}

// Then use properly
declare module "next/router" {
  export function useRouter(): CustomRouter;
}
```

### Test Type Safety

Even test files must maintain type safety:

```typescript
// ✅ CORRECT - Proper test mocking
type MockRouter = {
  push: jest.Mock<Promise<boolean>, [string]>;
  replace: jest.Mock<Promise<boolean>, [string]>;
  pathname: string;
  query: Record<string, string>;
};

const mockRouter: MockRouter = {
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  pathname: "/test",
  query: {},
};

// Use with proper typing
vi.mocked(useRouter).mockReturnValue(mockRouter);

// ❌ FORBIDDEN - Never do this in tests
(useRouter as any).mockReturnValue({ push: jest.fn() });
```

### Generics

Use generics for reusable, type-safe code:

```typescript
// Generic hook example
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}
```

## React Component Patterns

### Functional Components

Always use functional components with TypeScript:

```typescript
// Component with props
interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Card({ title, description, onClick, children }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

// Component with default props
export function Button({
  variant = 'primary',
  size = 'medium',
  ...props
}: ButtonProps) {
  return <button className={cn('button', variant, size)} {...props} />;
}
```

### Custom Hooks

Extract complex logic into custom hooks:

```typescript
// ✅ Good: Reusable hook
function useRoadmap(roadmapId: string) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRoadmap(roadmapId)
      .then(setRoadmap)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [roadmapId]);

  return { roadmap, loading, error };
}
```

### Component Composition

Prefer composition over inheritance:

```typescript
// Layout component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Specialized layouts through composition
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <Sidebar />
      <div className="dashboard-content">{children}</div>
    </Layout>
  );
}
```

## Naming Conventions

| Element Type           | Convention                            | Example                                    |
| ---------------------- | ------------------------------------- | ------------------------------------------ |
| **Components**         | PascalCase                            | `RoadmapCard`, `UserProfile`               |
| **Functions**          | camelCase                             | `getUserProfile`, `calculateProgress`      |
| **Variables**          | camelCase                             | `isLoading`, `userRoadmaps`                |
| **Constants**          | UPPER_SNAKE_CASE                      | `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`       |
| **Types/Interfaces**   | PascalCase                            | `interface UserData`, `type RoadmapStatus` |
| **Enums**              | PascalCase (keys: UPPER_SNAKE_CASE)   | `enum Status { ACTIVE = 'active' }`        |
| **Hooks**              | camelCase with 'use' prefix           | `useAuth`, `useLocalStorage`               |
| **Event Handlers**     | camelCase with 'handle' prefix        | `handleClick`, `handleSubmit`              |
| **Boolean Variables**  | camelCase with 'is/has/should' prefix | `isActive`, `hasPermission`                |
| **Files (Components)** | PascalCase                            | `RoadmapCard.tsx`, `UserProfile.tsx`       |
| **Files (Utilities)**  | kebab-case                            | `date-utils.ts`, `api-client.ts`           |
| **Test Files**         | Same as source + `.test`              | `RoadmapCard.test.tsx`                     |
| **Directories**        | kebab-case                            | `mental-models`, `user-settings`           |
| **CSS Classes**        | kebab-case                            | `roadmap-card`, `button-primary`           |
| **Database Tables**    | snake_case                            | `user_profiles`, `roadmap_steps`           |
| **API Routes**         | kebab-case                            | `/api/user-profile`, `/api/roadmap-steps`  |

## File Organization

### Directory Structure

```
src/
├── components/
│   ├── ui/                 # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Card/
│   ├── shared/            # Shared app components
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api/              # API client functions
│   ├── utils/            # General utilities
│   └── constants/        # App constants
├── services/             # Business logic
├── stores/               # State management
└── types/                # TypeScript type definitions
```

### Import Order

Organize imports consistently:

```typescript
// 1. React imports
import React, { useState, useEffect } from "react";

// 2. Third-party libraries
import { useRouter } from "next/router";
import { format } from "date-fns";

// 3. Internal imports (absolute paths)
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/lib/constants";

// 4. Relative imports
import { formatDate } from "./utils";
import styles from "./Component.module.css";

// 5. Type imports
import type { User, Roadmap } from "@/types";
```

## Functional Programming Principles

### Array Methods Over Loops

```typescript
// ❌ Bad: Imperative loop
const activeRoadmaps = [];
for (let i = 0; i < roadmaps.length; i++) {
  if (roadmaps[i].status === "active") {
    activeRoadmaps.push(roadmaps[i]);
  }
}

// ✅ Good: Declarative filter
const activeRoadmaps = roadmaps.filter((roadmap) => roadmap.status === "active");
```

### Function Composition

```typescript
// Compose small, focused functions
const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const removeSpaces = (str: string) => str.replace(/\s+/g, "");

// Compose them
const normalizeString = (str: string) => removeSpaces(toLowerCase(trim(str)));

// Or use a pipe utility
const normalizeString = pipe(trim, toLowerCase, removeSpaces);
```

### Avoid Mutations in Array Methods

```typescript
// ❌ Bad: Mutating in map
const users = userList.map((user) => {
  user.fullName = `${user.firstName} ${user.lastName}`;
  return user;
});

// ✅ Good: Return new objects
const users = userList.map((user) => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`,
}));
```

## Error Handling

### Try-Catch with Async/Await

```typescript
// API call with proper error handling
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Log error for monitoring
    console.error("Error fetching user profile:", error);

    // Re-throw with context
    throw new Error(`Unable to load user profile: ${error.message}`);
  }
}
```

### Error Boundaries

```typescript
// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Testing Standards

### Test File Structure

```typescript
// RoadmapCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RoadmapCard } from './RoadmapCard';

describe('RoadmapCard', () => {
  const mockRoadmap = {
    id: '1',
    title: 'Decision Making',
    progress: 75,
  };

  it('should render roadmap title', () => {
    render(<RoadmapCard roadmap={mockRoadmap} />);
    expect(screen.getByText('Decision Making')).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(<RoadmapCard roadmap={mockRoadmap} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<RoadmapCard roadmap={mockRoadmap} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith(mockRoadmap.id);
  });
});
```

### Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ✅ Good test names
it("should return user initials from full name");
it("should throw error when API key is missing");
it("should disable submit button while form is submitting");

// ❌ Bad test names
it("test initials");
it("error case");
it("button test");
```

## Performance Best Practices

### Memoization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks to prevent re-renders
const handleClick = useCallback(
  (id: string) => {
    router.push(`/roadmap/${id}`);
  },
  [router]
);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Lazy Loading

```typescript
// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));

// Lazy load with error boundary
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Accessibility Guidelines

### Semantic HTML

```typescript
// ✅ Good: Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Bad: Non-semantic HTML
<div onclick="navigate('/home')">Home</div>
```

### ARIA Labels

```typescript
// Add descriptive labels
<button
  aria-label="Delete roadmap"
  onClick={() => deleteRoadmap(id)}
>
  <TrashIcon />
</button>

// Announce dynamic changes
<div role="status" aria-live="polite">
  {message && <p>{message}</p>}
</div>
```

## Documentation Standards

### Component Documentation

````typescript
/**
 * Displays a roadmap card with progress indicator.
 *
 * @component
 * @example
 * ```tsx
 * <RoadmapCard
 *   roadmap={roadmap}
 *   onClick={(id) => navigateToRoadmap(id)}
 *   showProgress
 * />
 * ```
 */
interface RoadmapCardProps {
  /** The roadmap data to display */
  roadmap: Roadmap;
  /** Callback when card is clicked */
  onClick?: (id: string) => void;
  /** Whether to show progress bar */
  showProgress?: boolean;
}
````

### Function Documentation

````typescript
/**
 * Calculates the completion percentage of a roadmap.
 *
 * @param completedSteps - Number of completed steps
 * @param totalSteps - Total number of steps
 * @returns Percentage as a number between 0 and 100
 * @throws {Error} If totalSteps is 0 or negative
 *
 * @example
 * ```ts
 * const progress = calculateProgress(3, 10); // Returns 30
 * ```
 */
function calculateProgress(completedSteps: number, totalSteps: number): number {
  if (totalSteps <= 0) {
    throw new Error("Total steps must be greater than 0");
  }
  return Math.round((completedSteps / totalSteps) * 100);
}
````

## Enforcement

These standards are enforced through:

1. **ESLint**: Catches style violations and potential bugs
2. **Prettier**: Ensures consistent formatting
3. **TypeScript**: Enforces type safety
4. **Pre-commit Hooks**: Runs linting and formatting before commits
5. **CI/CD Pipeline**: Blocks PRs that don't meet standards

Remember: These guidelines exist to help us write better code together. When in doubt, prioritize readability and maintainability over clever solutions.
