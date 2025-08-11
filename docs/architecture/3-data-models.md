# **3. Data Models**

This section defines the core data entities for the LattixIQ application. These models are implemented as tables in our PostgreSQL database, managed by Supabase.

## **Type System Overview**

All TypeScript types are auto-generated from the database schema and available in `lib/supabase/database.types.ts`. This ensures type safety across the entire application with a single source of truth.

### **Import Pattern**

```typescript
// Import from the generated types file
import type { Database } from "@/lib/supabase/database.types";

// Table types
type User = Database["public"]["Tables"]["users"]["Row"];
type Roadmap = Database["public"]["Tables"]["roadmaps"]["Row"];
type RoadmapStep = Database["public"]["Tables"]["roadmap_steps"]["Row"];
type KnowledgeContent = Database["public"]["Tables"]["knowledge_content"]["Row"];
type ApplicationLog = Database["public"]["Tables"]["application_logs"]["Row"];
type GoalExample = Database["public"]["Tables"]["goal_examples"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type ContentBlock = Database["public"]["Tables"]["content_blocks"]["Row"];
type NotificationLog = Database["public"]["Tables"]["notification_logs"]["Row"];

// Insert types for creating records
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type RoadmapInsert = Database["public"]["Tables"]["roadmaps"]["Insert"];

// Update types for modifying records
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
type RoadmapUpdate = Database["public"]["Tables"]["roadmaps"]["Update"];

// Enum types
type RoadmapStatus = Database["public"]["Enums"]["roadmap_status"];
type RoadmapStepStatus = Database["public"]["Enums"]["roadmap_step_status"];
type KnowledgeContentType = Database["public"]["Enums"]["knowledge_content_type"];
type TestimonialState = Database["public"]["Enums"]["testimonial_state"];
type AISentiment = Database["public"]["Enums"]["ai_sentiment"];
```

### **Important Notes**

- All database fields use **snake_case** naming (e.g., `user_id`, `created_at`, `knowledge_content_id`)
- Many fields are nullable and typed as `string | null` or `number | null`
- Always use the imported types rather than defining custom interfaces
- Extend database types when additional UI state is needed
- Security-sensitive data is separated into different tables (e.g., `user_subscriptions`)

## **1. User**

- **Purpose:** Stores user account information provided by Supabase Auth, along with application-specific preferences, testimonial tracking, and free roadmap limit enforcement.
- **Database Table:** `users`
- **Key Attributes:**
  - `id` (string): Primary key, foreign key from `auth.users`
  - `email` (string | null): The user's email address
  - `created_at` (string | null): Timestamp managed by Supabase
  - **Testimonial Tracking:**
    - `testimonial_state` (TestimonialState | null): Enum tracking testimonial flow
    - `testimonial_url` (string | null): Link to user's testimonial
  - **Roadmap Tracking (for free limit enforcement):**
    - `roadmap_count` (number | null): Total roadmaps created
    - `free_roadmaps_used` (boolean | null): Whether free roadmap used
    - `testimonial_bonus_used` (boolean | null): Whether testimonial bonus used
  - **Reminder Settings:**
    - `reminder_enabled` (boolean | null): Whether daily reminders are enabled
    - `reminder_time` (string | null): Time of day for reminders (HH:MM format)
    - `reminder_timezone` (string | null): User's timezone for reminders
    - `reminder_last_sent` (string | null): Timestamp of last reminder sent
- **Security Note:** Stripe and subscription data moved to `user_subscriptions` table
- **Actual Database Structure:**
  ```typescript
  type User = {
    id: string;
    email: string | null;
    created_at: string | null;
    testimonial_state: TestimonialState | null;
    testimonial_url: string | null;
    roadmap_count: number | null;
    free_roadmaps_used: boolean | null;
    testimonial_bonus_used: boolean | null;
    reminder_enabled: boolean | null;
    reminder_time: string | null;
    reminder_timezone: string | null;
    reminder_last_sent: string | null;
  };
  ```
- **Relationships:** A User `has many` Roadmaps, `has many` ApplicationLogs, `has one` UserSubscription

## **2. UserSubscription**

- **Purpose:** Stores subscription data separately from the user table for security. Only service role can write to this table.
- **Database Table:** `user_subscriptions`
- **Key Attributes:**
  - `user_id` (string): Primary key, foreign key to `users` table
  - `subscription_status` (string | null): Status from Stripe ('free', 'active', 'canceled', etc.)
  - `stripe_customer_id` (string | null): Stripe customer identifier
  - `stripe_subscription_id` (string | null): Active subscription ID
  - `subscription_current_period_end` (string | null): Subscription expiry timestamp
  - `created_at` (string | null): Record creation timestamp
  - `updated_at` (string | null): Last update timestamp
- **Security:** RLS policies only allow users to READ their own subscription
- **Actual Database Structure:**
  ```typescript
  type UserSubscription = {
    user_id: string;
    subscription_status: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_current_period_end: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  ```
- **Relationships:** `belongs to` one User

## **3. Roadmap**

- **Purpose:** Represents a single, personalized learning journey for a user, tied to a specific goal.
- **Database Table:** `roadmaps`
- **Key Attributes:**
  - `id` (string): Primary key
  - `user_id` (string): Foreign key linking to the `users` table
  - `goal_description` (string | null): The user's stated goal (e.g., "Stop Procrastinating")
  - `status` (RoadmapStatus | null): Enum: `'active' | 'completed'`
  - `created_at` (string | null): Timestamp when roadmap was generated
  - `updated_at` (string | null): Last modification timestamp
  - `completed_at` (string | null): Timestamp when user finished the last step
- **Security Note:** Users cannot DELETE roadmaps (prevents bypassing free limits)
- **Actual Database Structure:**
  ```typescript
  type Roadmap = {
    id: string;
    user_id: string;
    goal_description: string | null;
    status: "active" | "completed" | null;
    created_at: string | null;
    updated_at: string | null;
    completed_at: string | null;
  };
  ```
- **Common Query Pattern with Nested Data:**
  ```typescript
  type RoadmapWithSteps = Roadmap & {
    roadmap_steps: (RoadmapStep & {
      knowledge_content: KnowledgeContent;
    })[];
  };
  ```
- **Relationships:** A Roadmap `belongs to` a User, `has many` RoadmapSteps

## **4. RoadmapStep**

- **Purpose:** Represents a single, ordered step within a Roadmap, linking to a specific Mental Model or Bias. Stores the user's implementation plan.
- **Database Table:** `roadmap_steps`
- **Key Attributes:**
  - `id` (string): Primary key
  - `roadmap_id` (string): Foreign key linking to the `roadmaps` table
  - `knowledge_content_id` (string): Foreign key linking to the `knowledge_content` table
  - `status` (RoadmapStepStatus | null): Enum: `'locked' | 'unlocked' | 'completed'`
  - `order` (number): The numerical order of the step (1, 2, 3...)
  - **Plan Fields (plan_situation removed in migration 20250818):**
    - `plan_trigger` (string | null): Specific cue that will prompt the action
    - `plan_action` (string | null): The intended response
    - `plan_created_at` (string | null): Timestamp when plan was created
  - `completed_at` (string | null): When step was completed
  - `updated_at` (string | null): Last modification timestamp
- **Security Note:** Users cannot DELETE steps (maintains data integrity)
- **Actual Database Structure:**
  ```typescript
  type RoadmapStep = {
    id: string;
    roadmap_id: string;
    knowledge_content_id: string;
    status: "locked" | "unlocked" | "completed" | null;
    order: number;
    plan_trigger: string | null;
    plan_action: string | null;
    plan_created_at: string | null;
    completed_at: string | null;
    updated_at: string | null;
  };
  ```
- **Relationships:** A RoadmapStep `belongs to` a Roadmap, `has one` KnowledgeContent item, `has many` ApplicationLogs

## **5. ApplicationLog**

- **Purpose:** Stores the user's journal reflections from the "Reflect" screen. Core data for personalization and AI analysis.
- **Database Table:** `application_logs`
- **Key Attributes:**
  - `id` (string): Primary key
  - `user_id` (string): Foreign key to the `users` table
  - `roadmap_step_id` (string): Foreign key to the specific `roadmap_steps` entry
  - `situation_text` (string | null): User's description of what happened
  - `learning_text` (string | null): User's reflection on what they learned
  - `effectiveness_rating` (number | null): Self-rated score from 1-5
  - `ai_sentiment` (AISentiment | null): AI-populated enum: `'positive' | 'negative' | 'neutral'`
  - `ai_topics` (string[] | null): AI-populated analysis (e.g., `['career', 'self-doubt']`)
  - `created_at` (string | null): Timestamp
- **Actual Database Structure:**
  ```typescript
  type ApplicationLog = {
    id: string;
    user_id: string;
    roadmap_step_id: string;
    situation_text: string | null;
    learning_text: string | null;
    effectiveness_rating: number | null;
    ai_sentiment: "positive" | "negative" | "neutral" | null;
    ai_topics: string[] | null;
    created_at: string | null;
  };
  ```
- **Relationships:** An ApplicationLog `belongs to` a User and `belongs to` a RoadmapStep

## **6. KnowledgeContent**

- **Purpose:** Single source of truth for all mental models, cognitive biases, and fallacies. Supports semantic search via embeddings.
- **Database Table:** `knowledge_content`
- **Key Attributes:**
  - `id` (string): Primary key
  - `title` (string): The name of the model (e.g., "Inversion")
  - `category` (string | null): The discipline (e.g., "Psychology")
  - `type` (KnowledgeContentType): Enum: `'mental-model' | 'cognitive-bias' | 'fallacy'`
  - `summary` (string | null): Brief, one-sentence explanation
  - `description` (string | null): Detailed explanation of the concept
  - `application` (string | null): Guidance on how to apply or spot the concept
  - `keywords` (string[] | null): For filtering and search
  - `embedding` (string | null): Vector embedding for semantic search (1536 dimensions)
- **Actual Database Structure:**
  ```typescript
  type KnowledgeContent = {
    id: string;
    title: string;
    category: string | null;
    type: "mental-model" | "cognitive-bias" | "fallacy";
    summary: string | null;
    description: string | null;
    application: string | null;
    keywords: string[] | null;
    embedding: string | null; // pgvector stored as string
  };
  ```
- **Note:** The `embedding` field uses pgvector extension for similarity search
- **Relationships:** `has many` GoalExamples, `has many` RoadmapSteps

## **7. GoalExample**

- **Purpose:** Stores personalized examples for applying knowledge to specific goals.
- **Database Table:** `goal_examples`
- **Key Attributes:**
  - `id` (string): Primary key
  - `knowledge_content_id` (string): Foreign key to the `knowledge_content` table
  - `goal` (string): The user goal category this example applies to (e.g., "Procrastination")
  - `if_then_example` (string | null): Example for a mental model
  - `spotting_mission_example` (string | null): Example for a cognitive bias
- **Actual Database Structure:**
  ```typescript
  type GoalExample = {
    id: string;
    knowledge_content_id: string;
    goal: string;
    if_then_example: string | null;
    spotting_mission_example: string | null;
  };
  ```
- **Relationships:** `belongs to` one KnowledgeContent item

## **8. NotificationLog**

- **Purpose:** Tracks push notifications sent to users for reminders and engagement.
- **Database Table:** `notification_logs`
- **Key Attributes:**
  - `id` (string): Primary key
  - `user_id` (string | null): Foreign key to `users` table
  - `roadmap_step_id` (string | null): Optional link to specific step
  - `notification_type` (string): Type of notification (default: 'reminder')
  - `title` (string): Notification title
  - `body` (string): Notification content
  - `scheduled_for` (string | null): When notification was scheduled
  - `delivered_at` (string | null): Actual delivery timestamp
  - `delivery_status` (string | null): Status of delivery attempt
  - `error_message` (string | null): Error details if failed
  - `created_at` (string | null): Record creation timestamp
- **Actual Database Structure:**
  ```typescript
  type NotificationLog = {
    id: string;
    user_id: string | null;
    roadmap_step_id: string | null;
    notification_type: string;
    title: string;
    body: string;
    scheduled_for: string | null;
    delivered_at: string | null;
    delivery_status: string | null;
    error_message: string | null;
    created_at: string | null;
  };
  ```
- **Relationships:** `belongs to` a User (optional), `belongs to` a RoadmapStep (optional)

## **9. ContentBlock**

- **Purpose:** Stores dynamic content for modals, help text, and UI elements. Allows content updates without code changes.
- **Database Table:** `content_blocks`
- **Key Attributes:**
  - `id` (string): Primary key (UUID)
  - `content_id` (string): Unique slug identifier for lookup
  - `content` (string): Markdown content to display
  - `metadata` (Json | null): Additional configuration data
  - `published` (boolean): Whether content is visible to users
  - `created_at` (string): Creation timestamp
  - `updated_at` (string): Last update timestamp
- **Security:** Only service role can write; authenticated users can read published blocks
- **Actual Database Structure:**
  ```typescript
  type ContentBlock = {
    id: string;
    content_id: string;
    content: string;
    metadata: Json | null;
    published: boolean;
    created_at: string;
    updated_at: string;
  };
  ```
- **Usage Example:**
  ```typescript
  // Fetch help content for testimonial modal
  const { data } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("content_id", "testimonial-help")
    .eq("published", true)
    .single();
  ```

## **Common Usage Patterns**

### **Working with Snake Case Fields**

Since all database fields use snake_case, you'll work directly with these names in your code:

```typescript
// Example: Accessing roadmap step data
const step = data.roadmap_steps[0];
console.log(step.knowledge_content_id); // NOT knowledgeContentId
console.log(step.plan_created_at); // NOT planCreatedAt

// Example: Creating a new roadmap using the tracking function
const { data, error } = await supabase.rpc("create_roadmap_with_tracking", {
  p_user_id: userId,
  p_goal_description: goal,
  p_steps: steps,
});
```

### **Extending Types for UI State**

When you need additional fields for UI state, extend the database types:

```typescript
// Example: Adding UI-specific fields
interface RoadmapViewState {
  activeRoadmap: Roadmap | null;
  currentStepIndex: number; // UI-only field
  isLoading: boolean; // UI-only field
  steps: (RoadmapStep & {
    knowledge_content: KnowledgeContent;
  })[];
}
```

### **Query Patterns with Supabase**

```typescript
// Fetch roadmap with nested steps and content
const { data: roadmap } = await supabase
  .from("roadmaps")
  .select(
    `
    *,
    roadmap_steps(
      *,
      knowledge_content(*)
    )
  `
  )
  .eq("user_id", userId)
  .eq("status", "active")
  .single();

// Check user subscription status
const { data: subscription } = await supabase
  .from("user_subscriptions")
  .select("*")
  .eq("user_id", userId)
  .single();
```

## **Security Patterns**

### **Subscription Data Isolation**

- User subscription data is stored in a separate `user_subscriptions` table
- Only readable by users (no write access via RLS)
- Updates only through Stripe webhooks using service role

### **Free Limit Enforcement**

- Roadmap creation uses `create_roadmap_with_tracking` RPC function
- Automatically updates `roadmap_count`, `free_roadmaps_used`, `testimonial_bonus_used`
- No DELETE policies on roadmaps/steps prevents limit bypassing

### **Content Management**

- `content_blocks` table for dynamic content
- Only published content visible to authenticated users
- Service role required for content updates

## **Vector Database Integration**

We leverage Supabase's built-in `pgvector` extension for semantic search:

- **Workflow:**
  1. Knowledge content includes vector embeddings in the `embedding` column
  2. Uses OpenAI's text-embedding-ada-002 model (1536 dimensions)
  3. Semantic search via the `match_knowledge_content` database function
  4. Returns similarity-ranked results for roadmap generation

```typescript
// Example: Semantic search for relevant content
const { data: matches } = await supabase.rpc("match_knowledge_content", {
  query_embedding: embedding,
  match_threshold: 0.78,
  match_count: 10,
});
```
