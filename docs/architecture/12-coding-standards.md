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

| Element Type | Convention | Example |
| --- | --- | --- |
| Components | `PascalCase` | `RoadmapCard.tsx` |
| Hooks | `useCamelCase` | `useActiveRoadmap.ts` |
| Functions / Variables | `camelCase` | `const userRoadmaps = ...` |
| Types / Interfaces | `PascalCase` | `interface RoadmapStep { ... }` |
| Database Tables/Columns | `snake_case` | `application_logs`, `user_id` |
| API Route Folders | `kebab-case` | `/app/api/roadmap-steps/` |
| Test Files | `*.test.ts` | `roadmaps.test.ts` |

## **Tooling for Enforcement**

These standards will be enforced automatically.

- **Linting (ESLint):** We will use a strict ESLint configuration with plugins for TypeScript, React, React Hooks, and Next.js to catch potential errors and style issues.
- **Formatting (Prettier):** A Prettier configuration will be committed to the repository to ensure all code has a consistent format. It will be configured to run automatically on save in VSCode and as a pre-commit hook.
- **CI Pipeline Check:** Our GitHub Actions workflow will include a mandatory "Lint & Format" step. **Pull requests will be blocked from merging if this check fails.** This makes adherence to our standards non-negotiable.
