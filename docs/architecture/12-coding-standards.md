# **12. Coding Standards**

This section outlines the mandatory coding standards for the LattixIQ project. These rules are designed to produce a clean, predictable, and scalable codebase, making it easier for both human developers and AI agents to contribute effectively.

## **Core Principles (Functional Style)**

As you requested, we will adhere to a functional programming style to minimize bugs and improve code clarity.

- **Immutability:** Data structures must not be mutated directly. Always create new objects or arrays instead of changing existing ones.
  ```tsx
  // BAD: Mutates the original object (side effect)
  function addUserRole(user, role) {
    user.role = role;
    return user;
  }

  // GOOD: Returns a new object, leaving the original unchanged (pure)
  function addUserRole(user, role) {
    return { ...user, role: role };
  }
  ```
- **Pure Functions / No Side Effects:** Functions should be deterministic. Given the same input, a function must always return the same output and have no observable effects on the outside world (like modifying a global variable or writing to a database). Database and API calls will be isolated in our Data Access Layer and API Routes, respectively.

## **Naming Conventions**

| Element Type            | Convention     | Example                         |
| ----------------------- | -------------- | ------------------------------- |
| Components              | `PascalCase`   | `RoadmapCard.tsx`               |
| Hooks                   | `useCamelCase` | `useActiveRoadmap.ts`           |
| Functions / Variables   | `camelCase`    | `const userRoadmaps = ...`      |
| Types / Interfaces      | `PascalCase`   | `interface RoadmapStep { ... }` |
| Database Tables/Columns | `snake_case`   | `application_logs`, `user_id`   |
| API Route Folders       | `kebab-case`   | `/app/api/roadmap-steps/`       |
| Test Files              | `*.test.ts`    | `roadmaps.test.ts`              |

## **Tooling for Enforcement**

These standards will be enforced automatically.

- **Linting (ESLint):** We will use a strict ESLint configuration with plugins for TypeScript, React, React Hooks, and Next.js to catch potential errors and style issues.
- **Formatting (Prettier):** A Prettier configuration will be committed to the repository to ensure all code has a consistent format. It will be configured to run automatically on save in VSCode and as a pre-commit hook.
- **CI Pipeline Check:** Our GitHub Actions workflow will include a mandatory "Lint & Format" step. **Pull requests will be blocked from merging if this check fails.** This makes adherence to our standards non-negotiable.

## **Database Type Usage Guide**

All TypeScript types for database entities are auto-generated from our Supabase schema and available in `lib/supabase/types.ts`. This ensures type safety and consistency across the application.

### **Key Rules**

1. **Always import database types** - Never create custom interfaces that duplicate database schemas:

   ```tsx
   // BAD: Creating duplicate interface
   interface User {
     id: string;
     email: string;
     createdAt: string;
   }

   // GOOD: Import from auto-generated types
   import type { User } from "@/lib/supabase/types";
   ```

2. **Use snake_case field names** - Database fields use snake_case, not camelCase:

   ```tsx
   // Database fields are snake_case
   const userId = user.user_id; // NOT user.userId
   const createdAt = user.created_at; // NOT user.createdAt
   const contentId = step.knowledge_content_id; // NOT step.knowledgeContentId
   ```

3. **Handle nullable fields** - Many database fields are nullable (`string | null`):

   ```tsx
   // Use nullish coalescing or optional chaining
   const description = content.description ?? "No description";
   const planDate = step.plan_created_at?.slice(0, 10);
   ```

4. **Extend types for UI state** - When additional fields are needed for UI:

   ```tsx
   // Extend database types for UI-specific fields
   interface RoadmapViewState extends Roadmap {
     isExpanded: boolean; // UI-only field
     currentStepIndex: number; // UI-only field
   }

   // Or compose types
   interface RoadmapStepWithContent extends RoadmapStep {
     knowledge_content: KnowledgeContent;
   }
   ```

5. **Use Insert/Update types** - For mutations, use the appropriate variant:

   ```tsx
   import type { RoadmapInsert, RoadmapUpdate } from "@/lib/supabase/types";

   // Creating new records
   const newRoadmap: RoadmapInsert = {
     user_id: userId,
     goal_description: goal,
     status: "active",
   };

   // Updating existing records
   const updates: RoadmapUpdate = {
     status: "completed",
     completed_at: new Date().toISOString(),
   };
   ```

### **Common Patterns**

```tsx
// Import all needed types at once
import type {
  User,
  Roadmap,
  RoadmapStep,
  KnowledgeContent,
  RoadmapStatus,
  RoadmapStepStatus,
} from "@/lib/supabase/types";

// Query with nested data (using Supabase renamed syntax)
const { data: roadmap } = await supabase
  .from("roadmaps")
  .select(
    `
    *,
    steps:roadmap_steps(
      *,
      knowledge_content(*)
    )
  `
  )
  .eq("user_id", userId)
  .single();

// The result type is automatically inferred correctly
```

By following these patterns, you ensure type safety while working with the actual database schema, preventing runtime errors from field name mismatches.
