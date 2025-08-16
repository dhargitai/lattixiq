# **7. Database Schema**

This section defines the PostgreSQL schema for the LattixIQ application. The schema includes tables, custom types (ENUMs), foreign key relationships, database functions, and the necessary configuration for `pgvector`. Row-Level Security (RLS) is enabled to ensure data privacy.

## **Custom ENUM Types**

First, we define the custom types that will be used across our tables to ensure data consistency.

```sql
-- ENUM for subscription status (deprecated - now uses text in user_subscriptions)
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

### Core Tables

```sql
-- Enable the pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users table - extends Supabase's auth.users with app-specific fields
CREATE TABLE "public"."users" (
  "id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" text,
  "created_at" timestamptz DEFAULT now(),
  -- Testimonial tracking
  "testimonial_state" testimonial_state DEFAULT 'not_asked'::testimonial_state,
  "testimonial_url" text,
  -- Roadmap tracking for free limit enforcement
  "roadmap_count" INTEGER DEFAULT 0,
  "free_roadmaps_used" BOOLEAN DEFAULT false,
  "testimonial_bonus_used" BOOLEAN DEFAULT false,
  -- Reminder settings
  "reminder_enabled" boolean DEFAULT false,
  "reminder_time" time DEFAULT '09:00'::time,
  "reminder_timezone" text DEFAULT 'UTC',
  "reminder_last_sent" timestamptz
);

-- 2. User Subscriptions table - separate table for security
-- Only service role can write, users can only read their own
CREATE TABLE "public"."user_subscriptions" (
  "user_id" UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  "subscription_status" TEXT DEFAULT 'free',
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "subscription_current_period_end" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- 3. Knowledge Content table - stores mental models, biases, fallacies with comprehensive learning content
CREATE TABLE "public"."knowledge_content" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "category" text,
  "type" knowledge_content_type NOT NULL,
  "summary" text,
  "description" text,
  "application" text,
  "keywords" text[],
  "embedding" vector(1536), -- For OpenAI's text-embedding-ada-002 model

  -- "Crystallize & Apply" model fields
  "hook" text, -- Engaging opener that anchors concepts in familiar experiences
  "definition" text, -- Crystal-clear, 1-2 sentence explanation
  "analogy_or_metaphor" text, -- Powerful conceptual tool for understanding
  "key_takeaway" text, -- Bold, tweet-sized summary
  "classic_example" text, -- Well-known formal example
  "modern_example" text, -- Everyday modern life scenario
  "pitfall" text, -- Negative consequence when concept is ignored
  "payoff" text, -- Benefit when concept is applied correctly
  "visual_metaphor" text, -- Text prompt for generating visual representation
  "visual_metaphor_url" text, -- Optional URL to pre-generated image
  "dive_deeper_mechanism" text, -- How the concept works cognitively
  "dive_deeper_origin_story" text, -- Historical development and key figures
  "dive_deeper_pitfalls_nuances" text, -- Advanced limitations and nuances
  "super_model" boolean DEFAULT false, -- Whether this is a foundational concept
  "extra_content" text -- Additional markdown content for complex explanations
);

-- 4. Goal Examples table - personalized examples for applying knowledge to specific goals
CREATE TABLE "public"."goal_examples" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id) ON DELETE CASCADE,
  "goal" text NOT NULL,
  "if_then_example" text,
  "spotting_mission_example" text
);

-- 5. Roadmaps table - represents user's personalized learning journeys
CREATE TABLE "public"."roadmaps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "goal_description" text,
  "status" roadmap_status DEFAULT 'active'::roadmap_status,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "completed_at" timestamptz
);

-- 6. Roadmap Steps table - individual steps within a roadmap with personalized content
-- Note: plan_situation was removed in migration 20250818
CREATE TABLE "public"."roadmap_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "roadmap_id" uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id),
  "status" roadmap_step_status DEFAULT 'locked'::roadmap_step_status,
  "order" smallint NOT NULL,
  "plan_trigger" text,
  "plan_action" text,
  "plan_created_at" timestamptz,
  "completed_at" timestamptz,
  "updated_at" timestamptz DEFAULT now(),

  -- Personalized learning content (generated per user/goal)
  "personalized_example" text, -- LLM-generated example tailored to user's goal
  "combine_with_models" text[] -- Array of model names that synergize (for steps 3+)
);

-- 7. Application Logs table - stores user's journal reflections and AI analysis
CREATE TABLE "public"."application_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "roadmap_step_id" uuid NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  "situation_text" text,
  "learning_text" text,
  "effectiveness_rating" smallint,
  "ai_sentiment" ai_sentiment,
  "ai_topics" text[],
  "created_at" timestamptz DEFAULT now()
);

-- 8. Notification Logs table - tracks push notifications sent to users
CREATE TABLE "public"."notification_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES public.users(id) ON DELETE CASCADE,
  "roadmap_step_id" uuid REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  "notification_type" text NOT NULL DEFAULT 'reminder',
  "title" text NOT NULL,
  "body" text NOT NULL,
  "scheduled_for" timestamptz,
  "delivered_at" timestamptz,
  "delivery_status" text,
  "error_message" text,
  "created_at" timestamptz DEFAULT now()
);

-- 9. Content Blocks table - stores dynamic content for modals, messages, and UI elements
CREATE TABLE "public"."content_blocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_id" TEXT UNIQUE NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "published" BOOLEAN DEFAULT true NOT NULL
);
```

### Indexes for Performance

```sql
-- User subscriptions indexes
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(subscription_status);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Users table indexes
CREATE INDEX idx_users_roadmap_count ON users(roadmap_count);
CREATE INDEX idx_users_free_roadmaps_used ON users(free_roadmaps_used);

-- Content blocks indexes
CREATE INDEX idx_content_blocks_content_id ON content_blocks(content_id);
CREATE INDEX idx_content_blocks_published ON content_blocks(published);

-- Vector search index
CREATE INDEX knowledge_content_embedding_idx ON knowledge_content
  USING hnsw (embedding vector_cosine_ops);

-- Knowledge content indexes for "Crystallize & Apply" model
CREATE INDEX idx_knowledge_content_super_model ON knowledge_content(super_model)
  WHERE super_model = true;

-- Roadmap steps indexes for personalized content
CREATE INDEX idx_roadmap_steps_personalized_example ON roadmap_steps(roadmap_id)
  WHERE personalized_example IS NOT NULL;
```

### Constraints

```sql
-- Valid subscription statuses (matching Stripe's statuses)
ALTER TABLE user_subscriptions
ADD CONSTRAINT valid_user_subscription_status
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));
```

## **Database Functions**

### Security-Critical Functions

```sql
-- 1. create_roadmap_with_tracking
-- Atomically creates roadmap and updates user counters to enforce free limits
CREATE OR REPLACE FUNCTION create_roadmap_with_tracking(
  p_user_id UUID,
  p_goal_description TEXT,
  p_steps JSONB -- Array of {knowledge_content_id: UUID, order: number}
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_roadmap_id UUID;
  v_roadmap_count INTEGER;
  v_has_testimonial BOOLEAN;
  v_step JSONB;
BEGIN
  -- Create the roadmap
  INSERT INTO roadmaps (user_id, goal_description, status, created_at)
  VALUES (p_user_id, p_goal_description, 'active', NOW())
  RETURNING id INTO v_roadmap_id;

  -- Create roadmap steps
  FOR v_step IN SELECT * FROM jsonb_array_elements(p_steps)
  LOOP
    INSERT INTO roadmap_steps (
      roadmap_id, knowledge_content_id, "order", status
    ) VALUES (
      v_roadmap_id,
      (v_step->>'knowledge_content_id')::UUID,
      (v_step->>'order')::INTEGER,
      CASE
        WHEN (v_step->>'order')::INTEGER = 1 THEN 'unlocked'::roadmap_step_status
        ELSE 'locked'::roadmap_step_status
      END
    );
  END LOOP;

  -- Update user tracking fields for free limit enforcement
  UPDATE users
  SET
    roadmap_count = roadmap_count + 1,
    free_roadmaps_used = TRUE,
    testimonial_bonus_used = CASE
      WHEN roadmap_count = 1 AND testimonial_url IS NOT NULL THEN TRUE
      ELSE testimonial_bonus_used
    END
  WHERE id = p_user_id;

  RETURN v_roadmap_id;
END;
$$;

-- 2. sync_user_data
-- Synchronizes user roadmap counts and testimonial status (recovery function)
CREATE OR REPLACE FUNCTION sync_user_data(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  roadmap_count INTEGER,
  free_roadmaps_used BOOLEAN,
  testimonial_bonus_used BOOLEAN,
  has_testimonial BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation details omitted for brevity
$$;

-- 3. complete_step_and_unlock_next
-- Marks a step as completed and unlocks the next step
CREATE OR REPLACE FUNCTION complete_step_and_unlock_next(
  p_roadmap_id UUID,
  p_step_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation details omitted for brevity
$$;

-- 4. match_knowledge_content
-- Vector similarity search for knowledge content
CREATE OR REPLACE FUNCTION match_knowledge_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  type knowledge_content_type,
  summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
-- Implementation using pgvector similarity search
$$;
```

### Triggers

```sql
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_steps_updated_at
  BEFORE UPDATE ON roadmap_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## **Row-Level Security (RLS) Policies**

CRITICAL: The following policies enforce data isolation between users. Note that DELETE policies have been intentionally removed from roadmaps and roadmap_steps tables to maintain free limit integrity.

### 1. Table: users

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Table: user_subscriptions

```sql
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription (no write access)
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT, UPDATE, or DELETE policies - only service role can modify
```

### 3. Table: roadmaps

```sql
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Users can view, create, and update their own roadmaps
-- IMPORTANT: No DELETE policy to prevent bypassing free limits
CREATE POLICY "Users can view their own roadmaps"
  ON public.roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps"
  ON public.roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON public.roadmaps FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4. Table: roadmap_steps

```sql
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

-- Users can access steps if they own the parent roadmap
-- IMPORTANT: No DELETE policy to maintain data integrity
CREATE POLICY "Users can view steps for their own roadmaps"
  ON public.roadmap_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM roadmaps
    WHERE roadmaps.id = roadmap_steps.roadmap_id
    AND roadmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert steps for their own roadmaps"
  ON public.roadmap_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps
    WHERE roadmaps.id = roadmap_steps.roadmap_id
    AND roadmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can update steps for their own roadmaps"
  ON public.roadmap_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM roadmaps
    WHERE roadmaps.id = roadmap_steps.roadmap_id
    AND roadmaps.user_id = auth.uid()
  ));
```

### 5. Table: application_logs

```sql
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- Users have full control over their own logs
CREATE POLICY "Users can view their own logs"
  ON public.application_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON public.application_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON public.application_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON public.application_logs FOR DELETE
  USING (auth.uid() = user_id);
```

### 6. Table: notification_logs

```sql
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert notification logs
CREATE POLICY "Users can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 7. Tables: knowledge_content & goal_examples

```sql
-- Read-only access for all authenticated users
ALTER TABLE public.knowledge_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read knowledge content"
  ON public.knowledge_content FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE public.goal_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read goal examples"
  ON public.goal_examples FOR SELECT
  USING (auth.role() = 'authenticated');
```

### 8. Table: content_blocks

```sql
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read published content blocks
CREATE POLICY "Authenticated users can read published content blocks"
  ON content_blocks FOR SELECT
  TO authenticated
  USING (published = true);

-- Only service role can manage content blocks
```

## **Security Considerations**

### Free Limit Enforcement

- Users cannot delete roadmaps or roadmap_steps (no DELETE RLS policies)
- The `create_roadmap_with_tracking` function atomically updates counters
- Free limits are checked via `roadmap_count`, `free_roadmaps_used`, and `testimonial_bonus_used` fields

### Subscription Security

- The `user_subscriptions` table is write-protected at the RLS level
- Only Stripe webhooks (using service role) can update subscription data
- Users can only read their own subscription status

### Data Integrity

- All foreign key relationships use CASCADE on delete
- Trigger functions ensure updated_at timestamps are maintained
- Database functions use SECURITY DEFINER for elevated privileges when needed

## **Comments for Documentation**

```sql
-- Table comments
COMMENT ON TABLE users IS 'User profiles extending auth.users with app-specific fields';
COMMENT ON TABLE user_subscriptions IS 'Subscription data - write-protected, only service role can modify';
COMMENT ON TABLE knowledge_content IS 'Mental models, cognitive biases, and fallacies with comprehensive learning content following the Crystallize & Apply methodology';
COMMENT ON TABLE roadmaps IS 'User roadmaps - deletion not allowed to maintain free limit integrity';
COMMENT ON TABLE roadmap_steps IS 'Roadmap steps with personalized learning examples - deletion not allowed to maintain data integrity';
COMMENT ON TABLE content_blocks IS 'Dynamic content blocks for modals, messages, and UI elements';
COMMENT ON TABLE notification_logs IS 'Push notification history and delivery tracking';

-- Column comments - Users table
COMMENT ON COLUMN users.roadmap_count IS 'Total number of roadmaps created by the user';
COMMENT ON COLUMN users.free_roadmaps_used IS 'Whether the user has used their free roadmap';
COMMENT ON COLUMN users.testimonial_bonus_used IS 'Whether the user has used their testimonial bonus roadmap';
COMMENT ON COLUMN user_subscriptions.subscription_status IS 'Current subscription status from Stripe or "free" for non-subscribers';

-- Column comments - Knowledge Content "Crystallize & Apply" fields
COMMENT ON COLUMN knowledge_content.hook IS 'Engaging opener that anchors abstract concepts in familiar experiences';
COMMENT ON COLUMN knowledge_content.definition IS 'Crystal-clear, 1-2 sentence explanation in simple language';
COMMENT ON COLUMN knowledge_content.analogy_or_metaphor IS 'Powerful conceptual tool for understanding';
COMMENT ON COLUMN knowledge_content.key_takeaway IS 'Bold, tweet-sized summary of the core concept';
COMMENT ON COLUMN knowledge_content.classic_example IS 'Well-known formal example of the concept';
COMMENT ON COLUMN knowledge_content.modern_example IS 'Everyday modern life scenario demonstrating the concept';
COMMENT ON COLUMN knowledge_content.pitfall IS 'Negative consequence when the concept is ignored';
COMMENT ON COLUMN knowledge_content.payoff IS 'Benefit when the concept is applied correctly';
COMMENT ON COLUMN knowledge_content.visual_metaphor IS 'Text prompt for generating visual representation of the concept';
COMMENT ON COLUMN knowledge_content.visual_metaphor_url IS 'Optional URL to pre-generated image for the visual metaphor';
COMMENT ON COLUMN knowledge_content.dive_deeper_mechanism IS 'Detailed explanation of how the concept works cognitively';
COMMENT ON COLUMN knowledge_content.dive_deeper_origin_story IS 'Historical development and key figures behind the concept';
COMMENT ON COLUMN knowledge_content.dive_deeper_pitfalls_nuances IS 'Advanced understanding of limitations and nuances';
COMMENT ON COLUMN knowledge_content.super_model IS 'Whether this is a foundational "super model" concept';
COMMENT ON COLUMN knowledge_content.extra_content IS 'Additional arbitrary long markdown content for complex explanations';

-- Column comments - Roadmap Steps personalized content
COMMENT ON COLUMN roadmap_steps.personalized_example IS 'LLM-generated example tailored to the users specific goal';
COMMENT ON COLUMN roadmap_steps.combine_with_models IS 'Array of other model names that synergize with this concept (for steps 3+)';
```
