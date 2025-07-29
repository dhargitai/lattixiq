# **7. Database Schema**

This section defines the PostgreSQL schema for the LattixIQ application. The schema includes tables, custom types (ENUMs), foreign key relationships, and the necessary configuration for `pgvector`. Row-Level Security (RLS) will be enabled to ensure data privacy.

## **Custom ENUM Types**

First, we define the custom types that will be used across our tables to ensure data consistency.

```sql
-- ENUM for subscription status
CREATE TYPE subscription_status AS ENUM ('free', 'premium');
-- ENUM for testimonial request tracking
CREATE TYPE testimonial_state AS ENUM ('not_asked', 'asked_first', 'dismissed_first', 'submitted', 'asked_second', 'dismissed_second');
-- ENUM for roadmap status
CREATE TYPE roadmap_status AS ENUM ('active', 'completed');
-- ENUM for roadmap step status
CREATE TYPE roadmap_step_status AS ENUM ('locked', 'unlocked', 'completed');
-- ENUM for AI sentiment analysis
CREATE TYPE ai_sentiment AS ENUM ('positive', 'negative', 'neutral');
-- ENUM for Knowledge Content type
CREATE TYPE knowledge_content_type AS ENUM ('mental-model', 'cognitive-bias', 'fallacy');
```

## **Table Definitions**

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
-- Stores public user profile information, extending Supabase's auth.users
CREATE TABLE "public"."users" ( "id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, "email" text, "created_at" timestamptz DEFAULT now(), "stripe_customer_id" text, "subscription_status" subscription_status DEFAULT 'free'::subscription_status, "testimonial_state" testimonial_state DEFAULT 'not_asked'::testimonial_state, "notification_prefs" jsonb
);
-- Stores the structured content for each mental model, bias, etc.
CREATE TABLE "public"."knowledge_content" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" text NOT NULL, "category" text, "type" knowledge_content_type NOT NULL, "summary" text, "description" text, "application" text, "keywords" text[], "embedding" vector(1536) -- For OpenAI's text-embedding-ada-002 model
);
-- Stores personalized examples for applying knowledge to a specific goal
CREATE TABLE "public"."goal_examples" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id) ON DELETE CASCADE, "goal" text NOT NULL, "if_then_example" text, "spotting_mission_example" text
);
-- Represents a user's personalized learning journey
CREATE TABLE "public"."roadmaps" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, "goal_description" text, "status" roadmap_status DEFAULT 'active'::roadmap_status, "created_at" timestamptz DEFAULT now(), "completed_at" timestamptz
);
-- Represents a single step within a roadmap
CREATE TABLE "public"."roadmap_steps" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "roadmap_id" uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE, "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id), "status" roadmap_step_status DEFAULT 'locked'::roadmap_step_status, "order" smallint NOT NULL
);
-- Stores the user's journal reflections
CREATE TABLE "public"."application_logs" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, "roadmap_step_id" uuid NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE, "situation_text" text, "learning_text" text, "effectiveness_rating" smallint, "ai_sentiment" ai_sentiment, "ai_topics" text[], "created_at" timestamptz DEFAULT now()
);
```

## **Data Structure for Vector Database Ingestion**

To provide the Vercel AI SDK with the richest possible context, you will need to summarize each mental model, cognitive bias, and logical fallacy into a structured JSON format. This format is designed for both semantic search and for directly populating content in the app.

Here is the proposed repeatable structure:

```json
{
  "id": "string",
  "title": "string",
  "category": "string (e.g., Psychology, Statistics, Philosophy)",
  "type": "enum('mental-model', 'cognitive-bias', 'fallacy')",
  "summary": "string (A single, concise sentence for quick displays)",
  "description": "string (A detailed paragraph explaining the concept)",
  "application": "string (General guidance on how to apply or spot this concept)",
  "goalExamples": [
    {
      "goal": "string (e.g., 'Procrastination', 'Decision Making')",
      "if_then_example": "string (A concrete 'If-Then' plan using the model)",
      "spotting_mission_example": "string (A mission to spot a bias in the wild)"
    }
  ],
  "keywords": ["string"]
}
```

**Why this structure is effective:**

- **`id`, `title`, `category`, `type`:** Provide essential metadata for filtering and organization.
- **`summary`, `description`, `application`:** These fields contain the core educational content. The AI will vectorize these for semantic search when generating roadmaps.
- **`goalExamples`:** This is the key to personalization. It allows the AI to pull specific, highly relevant examples when constructing the "Plan Screen" for a user with a matching goal.
- **`keywords`:** This allows for a hybrid search approach, combining keyword filtering with semantic search for more precise results.

## **Row-Level Security (RLS) Policies**

The following policies are the complete set required to secure our database. They ensure that users can only ever access and modify their own data, which is a critical security requirement.

### 1. Table: users

This table links directly to auth.users. Users should be able to view and update their own profile information.

```sql
-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view their own profile.
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);
-- Policy: Users can update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);
```

### 2. Table: roadmaps

Users have full control over their own roadmaps.

```sql
-- Enable RLS on the roadmaps table
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view their own roadmaps.
CREATE POLICY "Users can view their own roadmaps"
ON public.roadmaps FOR SELECT
USING (auth.uid() = user_id);
-- Policy: Users can create their own roadmaps.
CREATE POLICY "Users can create their own roadmaps"
ON public.roadmaps FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- Policy: Users can update their own roadmaps.
CREATE POLICY "Users can update their own roadmaps"
ON public.roadmaps FOR UPDATE
USING (auth.uid() = user_id);
-- Policy: Users can delete their own roadmaps.
CREATE POLICY "Users can delete their own roadmaps"
ON public.roadmaps FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Table: roadmap_steps

A user can access a step if they own the parent roadmap. This requires checking the parent roadmaps table.

```sql
-- Enable RLS on the roadmap_steps table
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view the steps of their own roadmaps.
CREATE POLICY "Users can view steps for their own roadmaps"
ON public.roadmap_steps FOR SELECT
USING ( EXISTS ( SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_steps.roadmap_id AND roadmaps.user_id = auth.uid() )
);
-- Policy: Users can insert steps into their own roadmaps.
CREATE POLICY "Users can insert steps for their own roadmaps"
ON public.roadmap_steps FOR INSERT
WITH CHECK ( EXISTS ( SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_steps.roadmap_id AND roadmaps.user_id = auth.uid() )
);
-- Policy: Users can update steps in their own roadmaps.
CREATE POLICY "Users can update steps for their own roadmaps"
ON public.roadmap_steps FOR UPDATE
USING ( EXISTS ( SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_steps.roadmap_id AND roadmaps.user_id = auth.uid() )
);
-- Policy: Users can delete steps from their own roadmaps.
CREATE POLICY "Users can delete steps from their own roadmaps"
ON public.roadmap_steps FOR DELETE
USING ( EXISTS ( SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_steps.roadmap_id AND roadmaps.user_id = auth.uid() )
);
```

### 4. Table: application_logs

Users have full control over their own application logs.

```sql
-- Enable RLS on the application_logs table
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view their own logs.
CREATE POLICY "Users can view their own logs"
ON public.application_logs FOR SELECT
USING (auth.uid() = user_id);
-- Policy: Users can create their own logs.
CREATE POLICY "Users can create their own logs"
ON public.application_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- Policy: Users can update their own logs.
CREATE POLICY "Users can update their own logs"
ON public.application_logs FOR UPDATE
USING (auth.uid() = user_id);
-- Policy: Users can delete their own logs.
CREATE POLICY "Users can delete their own logs"
ON public.application_logs FOR DELETE
USING (auth.uid() = user_id);
```

### 5. Tables: knowledge_content & goal_examples

This is our public knowledge base. All authenticated users should be able to read this data, but nobody should be able to modify it through the public API. Modifications should only be done by an admin or service role key.

```sql
-- Enable RLS on the knowledge_content table
ALTER TABLE public.knowledge_content ENABLE ROW LEVEL SECURITY;
-- Policy: Authenticated users can read all knowledge content.
CREATE POLICY "Authenticated users can read knowledge content"
ON public.knowledge_content FOR SELECT
USING (auth.role() = 'authenticated');
-- Enable RLS on the goal_examples table
ALTER TABLE public.goal_examples ENABLE ROW LEVEL SECURITY;
-- Policy: Authenticated users can read all goal examples.
CREATE POLICY "Authenticated users can read goal examples"
ON public.goal_examples FOR SELECT
USING (auth.role() = 'authenticated');
```
