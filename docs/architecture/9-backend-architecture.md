# **9. Backend Architecture**

This section details the patterns for all server-side logic, which is implemented as Next.js API Routes and deployed as Vercel Serverless Functions.

## **Service Architecture (Serverless)**

### **Function Organization**

We follow a RESTful, resource-based structure within the `/app/api/` directory. Each resource has its own folder, and different HTTP methods (GET, POST, PATCH, etc.) are handled by exported functions within the `route.ts` file for that resource.

```
/app
└── /api
    ├── /roadmaps
    │   └── route.ts              // POST (create), GET (list)
    ├── /roadmap-steps
    │   └── /[id]
    │       └── /plan
    │           └── route.ts      // PATCH (update plan)
    ├── /logs
    │   └── route.ts              // POST (create), GET (list)
    ├── /user
    │   ├── /preferences
    │   │   └── route.ts          // GET, PATCH
    │   └── /subscription-status
    │       └── route.ts          // GET
    ├── /users
    │   └── /testimonial
    │       └── route.ts          // POST
    ├── /content-blocks
    │   └── /[contentId]
    │       └── route.ts          // GET
    ├── /checkout
    │   ├── route.ts              // POST
    │   └── /callback
    │       └── route.ts          // GET
    ├── /billing-portal
    │   └── route.ts              // POST
    ├── /webhooks
    │   └── /stripe
    │       └── route.ts          // POST
    ├── /notifications
    │   ├── /preferences
    │   │   └── route.ts          // POST
    │   ├── /test
    │   │   └── route.ts          // POST
    │   ├── /schedule
    │   │   └── route.ts          // POST
    │   └── /cron
    │       └── route.ts          // GET
    └── /auth
        └── /logout
            └── route.ts          // POST
```

### **API Route Template**

All API routes must adhere to this template to ensure consistency in authentication, error handling, and response formatting:

```typescript
// /app/api/roadmaps/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod"; // For input validation

// 1. Define input schema for validation
const postSchema = z.object({
  goalDescription: z.string().min(10).max(500),
});

// 2. Handle POST requests
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // 3. Authenticate the user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    // 4. Validate the request body
    const body = await request.json();
    const validatedBody = postSchema.parse(body);

    // 5. Check permissions/limits
    const canCreate = await checkCanCreateRoadmap(user.id);
    if (!canCreate) {
      return NextResponse.json({ error: { message: "Roadmap limit exceeded" } }, { status: 403 });
    }

    // 6. Core business logic
    const newRoadmap = await createRoadmapWithTracking(user.id, validatedBody.goalDescription);

    // 7. Return a typed, consistent response
    return NextResponse.json({ data: newRoadmap }, { status: 201 });
  } catch (error) {
    // 8. Standardized error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Invalid input", details: error.errors } },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}
```

## **Database Architecture**

### **Schema Design**

The PostgreSQL schema is defined in Section 7 of this document. All schema changes are managed via Supabase CLI migrations, stored in the `/supabase/migrations` directory.

### **Data Access Layer**

API Routes **must not** contain raw database queries. All database interactions are abstracted into a dedicated data access layer located in `/lib/db/`. This centralizes data logic, makes it reusable, and simplifies testing.

```typescript
// /lib/db/roadmaps.ts
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Roadmap = Database["public"]["Tables"]["roadmaps"]["Row"];

export async function createRoadmapWithTracking(
  userId: string,
  goal: string,
  steps: Array<{ knowledge_content_id: string; order: number }>
): Promise<string> {
  const supabase = await createClient();

  // Use the secure database function
  const { data, error } = await supabase.rpc("create_roadmap_with_tracking", {
    p_user_id: userId,
    p_goal_description: goal,
    p_steps: steps,
  });

  if (error) {
    throw new Error("Failed to create roadmap");
  }

  return data;
}
```

### **Database Functions**

Critical operations use PostgreSQL functions with SECURITY DEFINER for atomic operations:

- **`create_roadmap_with_tracking`**: Atomically creates roadmap and updates user counters
- **`sync_user_data`**: Synchronizes user roadmap counts (recovery function)
- **`complete_step_and_unlock_next`**: Marks step complete and unlocks next
- **`match_knowledge_content`**: Vector similarity search for AI roadmap generation

## **Authentication and Authorization**

### **Authentication Flow**

Authentication is handled by Supabase Auth and validated server-side in middleware and API routes.

### **Authorization Layers**

1. **API Route Level:** Every API Route checks for a valid session
2. **Business Logic Level:** Subscription and limit checks in service functions
3. **Database Level:** Row-Level Security (RLS) provides the ultimate protection

### **Security Patterns**

#### **Subscription Data Isolation**

```typescript
// Only readable by users, writable by service role
const { data: subscription } = await supabase
  .from("user_subscriptions")
  .select("*")
  .eq("user_id", userId)
  .single();
// Users cannot UPDATE/INSERT/DELETE
```

#### **Free Limit Enforcement**

```typescript
// All roadmap creation goes through this check
export async function checkCanCreateRoadmap(userId: string): Promise<boolean> {
  // 1. Check for active subscription
  const subscription = await getSubscription(userId);
  if (subscription?.status === "active") return true;

  // 2. Check free roadmap usage
  const user = await getUser(userId);
  if (!user.free_roadmaps_used) return true;

  // 3. Check testimonial bonus
  if (user.testimonial_url && !user.testimonial_bonus_used) return true;

  return false;
}
```

## **Webhook Processing**

### **Stripe Webhook Handler**

Handles subscription lifecycle events with signature verification:

```typescript
// /app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

  // Process with service role (elevated privileges)
  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed":
      await handleNewSubscription(supabase, event.data.object);
      break;
    case "customer.subscription.updated":
      await updateSubscriptionStatus(supabase, event.data.object);
      break;
    // ... other events
  }

  return NextResponse.json({ received: true });
}
```

## **Service Integrations**

### **AI Service Integration**

Roadmap generation using Vercel AI SDK:

```typescript
// /lib/ai/roadmap-generator.ts
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export async function generateRoadmap(goal: string) {
  // 1. Semantic search for relevant content
  const embedding = await generateEmbedding(goal);
  const relevantContent = await searchKnowledgeContent(embedding);

  // 2. AI curation and personalization
  const result = await generateObject({
    model: openai("gpt-4-turbo"),
    prompt: buildPrompt(goal, relevantContent),
    schema: roadmapSchema,
  });

  // 3. Validation and enrichment
  return validateAndEnrichRoadmap(result.object);
}
```

### **Notification Service**

Push notifications via Web Push API:

```typescript
// /lib/notifications/push-service.ts
import webpush from "web-push";

export async function sendNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));

    // Log successful delivery
    await logNotificationDelivery(subscription, "delivered");
  } catch (error) {
    // Log failure
    await logNotificationDelivery(subscription, "failed", error);
  }
}
```

## **Error Handling**

### **Standardized Error Responses**

All errors follow a consistent format:

```typescript
interface APIError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Usage
return NextResponse.json(
  {
    error: {
      message: "Subscription required",
      code: "SUBSCRIPTION_REQUIRED",
    },
  },
  { status: 403 }
);
```

### **Error Recovery Patterns**

- Database sync functions for data consistency
- Webhook retry logic with exponential backoff
- Transaction rollback for failed operations

## **Performance Optimization**

### **Caching Strategies**

```typescript
// Content blocks cached client-side
const CONTENT_CACHE = new Map();

export async function getContentBlock(contentId: string) {
  if (CONTENT_CACHE.has(contentId)) {
    return CONTENT_CACHE.get(contentId);
  }

  const content = await fetchContentBlock(contentId);
  CONTENT_CACHE.set(contentId, content);
  return content;
}
```

### **Database Query Optimization**

- Use indexes on frequently queried columns
- Batch operations where possible
- Limit nested queries with proper joins

## **Security Considerations**

### **Input Validation**

All user inputs validated with Zod schemas before processing

### **Rate Limiting**

- Roadmap creation: Limited by subscription status
- AI operations: 10 requests per minute per user
- Notification sending: 100 per day per user

### **Service Role Protection**

Service role credentials only used for:

- Webhook processing
- Admin operations
- System maintenance tasks

### **CORS Configuration**

Properly configured for production domain only

## **Monitoring and Logging**

### **Structured Logging**

```typescript
import { logger } from "@/lib/logger";

logger.info("Roadmap created", {
  userId: user.id,
  roadmapId: roadmap.id,
  stepCount: steps.length,
});
```

### **Error Tracking**

Integration with error tracking service (e.g., Sentry) for production monitoring

### **Performance Monitoring**

- API response times tracked
- Database query performance monitored
- AI service latency measured

## **Testing Strategy**

### **Unit Tests**

- Service functions tested in isolation
- Database queries mocked
- AI responses stubbed

### **Integration Tests**

- API routes tested with real database
- Webhook processing verified
- Authentication flows validated

### **E2E Tests**

- Complete user journeys tested
- Subscription flows verified
- Error scenarios validated
