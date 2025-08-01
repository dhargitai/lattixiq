# Code Style Guide

This document outlines the coding standards and conventions for the LattixIQ project. Following these guidelines ensures consistency, maintainability, and readability across the codebase.

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

### Strict Mode

Always use TypeScript strict mode. Our `tsconfig.json` enforces:

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

### Type Definitions

```typescript
// Prefer interfaces for object shapes
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// Use type aliases for unions, intersections, and utility types
type Status = "idle" | "loading" | "success" | "error";
type Nullable<T> = T | null;
type PartialUser = Partial<UserProfile>;

// Use enums sparingly, prefer const assertions
const RoadmapStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

type RoadmapStatus = (typeof RoadmapStatus)[keyof typeof RoadmapStatus];
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
