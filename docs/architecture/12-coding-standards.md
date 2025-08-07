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

## **Security Standards**

Security is paramount in our application. The following standards are **mandatory** and will be enforced through automated tooling and code reviews.

### **1. Secrets Management**

**CRITICAL: Never hardcode sensitive information in source code.**

```tsx
// SECURITY VIOLATION - NEVER DO THIS
const API_KEY = "sk-1234567890abcdef"; // NEVER hardcode secrets
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // CRITICAL VIOLATION

// CORRECT: Use environment variables
const API_KEY = process.env.OPENAI_API_KEY;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// CORRECT: Validate environment variables exist
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Required environment variable SUPABASE_SERVICE_ROLE_KEY is not set");
}
```

**Rules:**

- All secrets MUST be stored in environment variables
- Provide `.env.example` files with placeholder values
- Never commit `.env` files (enforced via `.gitignore`)
- Use separate credentials for development, testing, and production
- Rotate credentials regularly and after any potential exposure

### **2. Authentication & Authorization**

**Principle of Least Privilege:** Always use the minimum required permissions.

```tsx
// BAD: Using service role key on client side
const supabase = createClient(url, SERVICE_ROLE_KEY); // NEVER on client

// GOOD: Use anon key for client-side operations
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// GOOD: Service role only in secure server-side context
// app/api/admin/route.ts
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // Service role ONLY in server-side API routes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Only accessible server-side
  );
}
```

**Rules:**

- Client-side code MUST only use public/anon keys
- Service role keys ONLY in server-side API routes or Edge Functions
- Implement Row-Level Security (RLS) on all database tables
- Verify user permissions before every sensitive operation
- Use JWT tokens with appropriate expiration times

### **3. Input Validation & Sanitization**

**Never trust user input.** Always validate and sanitize.

```tsx
// BAD: Direct use of user input
const { data } = await supabase.from("users").select("*").eq("email", request.body.email); // Potential SQL injection

// GOOD: Validate and sanitize input
import { z } from "zod";

const emailSchema = z.string().email().max(255);

export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const result = emailSchema.safeParse(body.email);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Use validated input
  const { data } = await supabase.from("users").select("*").eq("email", result.data);
}
```

### **4. Error Handling & Information Disclosure**

**Never leak sensitive information in error messages.**

```tsx
// BAD: Exposing internal details
catch (error) {
  return NextResponse.json({
    error: error.message, // May contain sensitive info
    stack: error.stack,   // NEVER expose stack traces
    query: sql           // NEVER expose queries
  }, { status: 500 });
}

// GOOD: Generic error messages for users
catch (error) {
  // Log full error server-side for debugging
  console.error("Database error:", error);

  // Return generic message to client
  return NextResponse.json({
    error: "An error occurred processing your request"
  }, { status: 500 });
}
```

### **5. Data Protection**

**Protect sensitive data at rest and in transit.**

```tsx
// GOOD: Never store sensitive data in localStorage
// BAD: localStorage.setItem("authToken", token);

// GOOD: Use secure, httpOnly cookies for sensitive data
import { cookies } from "next/headers";

cookies().set("session", token, {
  httpOnly: true, // Not accessible via JavaScript
  secure: true, // HTTPS only
  sameSite: "lax", // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 1 week
});

// GOOD: Encrypt sensitive data before storing
import crypto from "crypto";

function encryptSensitiveData(text: string): string {
  const algorithm = "aes-256-gcm";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // ... encryption logic
}
```

### **6. API Security**

**Secure all API endpoints appropriately.**

```tsx
// GOOD: Rate limiting example
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max users per interval
});

export async function POST(request: Request) {
  // Check rate limit
  try {
    await limiter.check(request, 10); // 10 requests per minute
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Verify authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process request...
}
```

### **7. Dependency Security**

**Keep dependencies secure and up-to-date.**

```bash
# Regular security audits (add to package.json scripts)
"scripts": {
  "security:audit": "npm audit",
  "security:fix": "npm audit fix",
  "security:check": "npm audit --audit-level=moderate"
}

# Check for known vulnerabilities before deployment
npm audit --audit-level=moderate
```

### **8. Security Testing Requirements**

**All code must include security-focused tests.**

```tsx
// Test for SQL injection prevention
it("should sanitize user input to prevent SQL injection", async () => {
  const maliciousInput = "'; DROP TABLE users; --";
  const response = await POST({
    body: JSON.stringify({ email: maliciousInput }),
  });

  expect(response.status).toBe(400); // Should reject invalid input
  // Verify database is intact
  const users = await supabase.from("users").select("count");
  expect(users.data).toBeDefined();
});

// Test for authorization
it("should prevent unauthorized access to admin endpoints", async () => {
  const response = await fetch("/api/admin/users", {
    method: "GET",
    // No auth headers
  });

  expect(response.status).toBe(401);
});

// Test for rate limiting
it("should enforce rate limits", async () => {
  // Make requests exceeding rate limit
  const promises = Array(15)
    .fill(null)
    .map(() => fetch("/api/roadmaps", { method: "POST" }));

  const responses = await Promise.all(promises);
  const tooManyRequests = responses.filter((r) => r.status === 429);

  expect(tooManyRequests.length).toBeGreaterThan(0);
});
```

### **9. Security Checklist for Code Reviews**

Every pull request MUST be reviewed against this checklist:

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] Environment variables used for all configuration
- [ ] Input validation on all user-provided data
- [ ] Authorization checks on all protected endpoints
- [ ] Error messages don't leak sensitive information
- [ ] No sensitive data in client-side code or localStorage
- [ ] Database queries use parameterized statements
- [ ] Rate limiting on public endpoints
- [ ] Security headers properly configured
- [ ] Dependencies are up-to-date with no critical vulnerabilities

### **10. Incident Response**

**Be prepared for security incidents.**

1. **Immediate Actions:**
   - Rotate compromised credentials immediately
   - Disable affected accounts/services if necessary
   - Preserve logs for investigation

2. **Communication:**
   - Notify security team lead immediately
   - Document incident timeline and impact
   - Prepare user communication if data was affected

3. **Post-Incident:**
   - Conduct thorough root cause analysis
   - Update security measures to prevent recurrence
   - Security training for team if process failure

### **Enforcement Tools**

These security standards will be enforced through:

1. **Pre-commit hooks:** Scan for secrets before code is committed
2. **CI/CD pipeline:** Automated security scanning on every push
3. **Dependency scanning:** Automated vulnerability detection
4. **Code review:** Manual security review using the checklist
5. **Penetration testing:** Regular security assessments
