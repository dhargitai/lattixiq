# **3. Data Models**

This section defines the core data entities for the LattixIQ application. These models are implemented as tables in our PostgreSQL database, managed by Supabase.

## **Type System Overview**

All TypeScript types are auto-generated from the database schema and available in `lib/supabase/types.ts`. This ensures type safety across the entire application with a single source of truth.

### **Import Pattern**

```typescript
// Base types for reading data
import type {
  User,
  Roadmap,
  RoadmapStep,
  KnowledgeContent,
  ApplicationLog,
  GoalExample,
} from "@/lib/supabase/types";

// Insert types for creating records
import type { UserInsert, RoadmapInsert, RoadmapStepInsert } from "@/lib/supabase/types";

// Update types for modifying records
import type { UserUpdate, RoadmapUpdate, RoadmapStepUpdate } from "@/lib/supabase/types";

// Enum types
import type {
  RoadmapStatus,
  RoadmapStepStatus,
  KnowledgeContentType,
  SubscriptionStatus,
} from "@/lib/supabase/types";
```

### **Important Notes**

- All database fields use **snake_case** naming (e.g., `user_id`, `created_at`, `knowledge_content_id`)
- Many fields are nullable and typed as `string | null` or `number | null`
- Always use the imported types rather than defining custom interfaces
- Extend database types when additional UI state is needed

## **1. User**

- **Purpose:** Stores user account information provided by Supabase Auth, along with application-specific preferences and state, including the testimonial tracking logic.
- **Database Table:** `users`
- **Type Import:** `import type { User, UserInsert, UserUpdate } from '@/lib/supabase/types'`
- **Key Attributes:**
  - `id` (string): Primary key, foreign key from `auth.users`
  - `email` (string | null): The user's email address
  - `created_at` (string | null): Timestamp managed by Supabase
  - `stripe_customer_id` (string | null): Links user with Stripe subscription data
  - `subscription_status` (SubscriptionStatus | null): Enum: `'free' | 'premium'`
  - `testimonial_state` (TestimonialState | null): Enum tracking testimonial flow:
    - `'not_asked' | 'asked_first' | 'dismissed_first' | 'submitted' | 'asked_second' | 'dismissed_second'`
  - `reminder_enabled` (boolean | null): Whether daily reminders are enabled
  - `reminder_time` (string | null): Time of day for reminders (HH:MM format)
  - `reminder_timezone` (string | null): User's timezone for reminders
  - `reminder_last_sent` (string | null): Timestamp of last reminder sent
- **Actual Database Structure:**
  ```typescript
  type User = {
    id: string;
    email: string | null;
    created_at: string | null;
    stripe_customer_id: string | null;
    subscription_status: "free" | "premium" | null;
    testimonial_state:
      | "not_asked"
      | "asked_first"
      | "dismissed_first"
      | "submitted"
      | "asked_second"
      | "dismissed_second"
      | null;
    reminder_enabled: boolean | null;
    reminder_time: string | null;
    reminder_timezone: string | null;
    reminder_last_sent: string | null;
  };
  ```
- **Relationships:** A User `has many` Roadmaps, `has many` ApplicationLogs

## **2. Roadmap**

- **Purpose:** Represents a single, personalized learning journey for a user, tied to a specific goal.
- **Database Table:** `roadmaps`
- **Type Import:** `import type { Roadmap, RoadmapInsert, RoadmapUpdate } from '@/lib/supabase/types'`
- **Key Attributes:**
  - `id` (string): Primary key
  - `user_id` (string): Foreign key linking to the `users` table
  - `goal_description` (string | null): The user's stated goal (e.g., "Stop Procrastinating")
  - `status` (RoadmapStatus | null): Enum: `'active' | 'completed'`
  - `created_at` (string | null): Timestamp when roadmap was generated
  - `completed_at` (string | null): Timestamp when user finished the last step
- **Actual Database Structure:**
  ```typescript
  type Roadmap = {
    id: string;
    user_id: string;
    goal_description: string | null;
    status: "active" | "completed" | null;
    created_at: string | null;
    completed_at: string | null;
  };
  ```
- **Common Query Pattern with Nested Data:**
  ```typescript
  // Using Supabase's renamed query syntax
  type RoadmapWithSteps = Roadmap & {
    steps: (RoadmapStep & {
      knowledge_content: KnowledgeContent;
    })[];
  };
  ```
- **Relationships:** A Roadmap `belongs to` a User, `has many` RoadmapSteps

## **3. RoadmapStep**

- **Purpose:** Represents a single, ordered step within a Roadmap, linking to a specific Mental Model or Bias. Also stores the user's implementation plan for this step.
- **Database Table:** `roadmap_steps`
- **Type Import:** `import type { RoadmapStep, RoadmapStepInsert, RoadmapStepUpdate } from '@/lib/supabase/types'`
- **Key Attributes:**
  - `id` (string): Primary key
  - `roadmap_id` (string): Foreign key linking to the `roadmaps` table
  - `knowledge_content_id` (string): Foreign key linking to the `knowledge_content` table
  - `status` (RoadmapStepStatus | null): Enum: `'locked' | 'unlocked' | 'completed'`
  - `order` (number): The numerical order of the step (1, 2, 3...)
  - `plan_situation` (string | null): Context where user plans to apply the concept
  - `plan_trigger` (string | null): Specific cue that will prompt the action
  - `plan_action` (string | null): The intended response
  - `plan_created_at` (string | null): Timestamp when plan was created
- **Actual Database Structure:**
  ```typescript
  type RoadmapStep = {
    id: string;
    roadmap_id: string;
    knowledge_content_id: string;
    status: "locked" | "unlocked" | "completed" | null;
    order: number;
    plan_situation: string | null;
    plan_trigger: string | null;
    plan_action: string | null;
    plan_created_at: string | null;
  };
  ```
- **Common Extended Type for UI:**
  ```typescript
  type RoadmapStepWithContent = RoadmapStep & {
    knowledge_content: KnowledgeContent;
  };
  ```
- **Relationships:** A RoadmapStep `belongs to` a Roadmap, `has one` KnowledgeContent item, `has many` ApplicationLogs

## **4. ApplicationLog**

- **Purpose:** Stores the user's journal reflections from the "Reflect" screen. This is the core data for personalization.
- **Database Table:** `application_logs`
- **Type Import:** `import type { ApplicationLog, ApplicationLogInsert, ApplicationLogUpdate } from '@/lib/supabase/types'`
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

## **5. KnowledgeContent**

- **Purpose:** To be the single source of truth for all mental models, cognitive biases, and fallacies. This allows for dynamic content management.
- **Database Table:** `knowledge_content`
- **Type Import:** `import type { KnowledgeContent, KnowledgeContentInsert, KnowledgeContentUpdate } from '@/lib/supabase/types'`
- **Key Attributes:**
  - `id` (string): Primary key
  - `title` (string): The name of the model (e.g., "Inversion")
  - `category` (string | null): The discipline (e.g., "Psychology")
  - `type` (KnowledgeContentType): Enum: `'mental-model' | 'cognitive-bias' | 'fallacy'`
  - `summary` (string | null): Brief, one-sentence explanation
  - `description` (string | null): Detailed explanation of the concept
  - `application` (string | null): Guidance on how to apply or spot the concept
  - `keywords` (string[] | null): For filtering and search
  - `embedding` (string | null): Vector embedding for semantic search (stored as string representation)
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
- **Note:** The `embedding` field contains vector data stored as a string and is used for semantic search via pgvector extension
- **Relationships:** `has many` GoalExamples, `has many` RoadmapSteps

## **6. GoalExample**

- **Purpose:** To store personalized examples for applying knowledge to a specific goal. Normalizing this into a separate table is efficient.
- **Database Table:** `goal_examples`
- **Type Import:** `import type { GoalExample, GoalExampleInsert, GoalExampleUpdate } from '@/lib/supabase/types'`
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

## **Common Usage Patterns**

### **Working with Snake Case Fields**

Since all database fields use snake_case, you'll work directly with these names in your code:

```typescript
// Example: Accessing roadmap step data
const step = data.roadmap_steps[0];
console.log(step.knowledge_content_id); // NOT knowledgeContentId
console.log(step.plan_created_at); // NOT planCreatedAt

// Example: Creating a new roadmap
const newRoadmap: RoadmapInsert = {
  user_id: userId, // NOT userId
  goal_description: goal, // NOT goalDescription
  status: "active",
};
```

### **Extending Types for UI State**

When you need additional fields for UI state, extend the database types:

```typescript
// Example from roadmap-store.ts
interface RoadmapStep extends DBRoadmapStep {
  knowledge_content: KnowledgeContent;
}

interface RoadmapViewState {
  activeRoadmap: Roadmap | null;
  currentStepIndex: number; // UI-only field
  isLoading: boolean; // UI-only field
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
    steps:roadmap_steps(
      *,
      knowledge_content(*)
    )
  `
  )
  .eq("user_id", userId)
  .eq("status", "active")
  .single();

// The result type matches RoadmapWithStepsRenamed
```

## **Vector Database Integration**

We will leverage Supabase's built-in `pgvector` extension to handle semantic search, which keeps our architecture lean.

- **Workflow:**
  1. When a `KnowledgeContent` item is created or updated in our Postgres database, a Supabase Edge Function will automatically be triggered.
  2. This function will take the text fields (`title`, `description`, `application`), use the Vercel AI SDK to generate a vector embedding from them, and save the resulting embedding into the `embedding` column of that item.
  3. When a user sets a goal, the app's backend will perform a semantic search by comparing the user's vectorized goal against the `embedding` column directly in the database to find the most relevant content for their roadmap.
