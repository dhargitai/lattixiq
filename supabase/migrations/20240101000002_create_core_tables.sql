-- Create core tables for LattixIQ database schema
-- Tables are created in dependency order: users, knowledge_content, goal_examples, roadmaps, roadmap_steps, application_logs

-- 1. Users table - extends Supabase auth.users with app-specific fields
CREATE TABLE "public"."users" (
  "id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" text,
  "created_at" timestamptz DEFAULT now(),
  "stripe_customer_id" text,
  "subscription_status" subscription_status DEFAULT 'free'::subscription_status,
  "testimonial_state" testimonial_state DEFAULT 'not_asked'::testimonial_state,
  "notification_prefs" jsonb
);

-- 2. Knowledge content table - stores mental models, biases, fallacies with vector embeddings
CREATE TABLE "public"."knowledge_content" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "category" text,
  "type" knowledge_content_type NOT NULL,
  "summary" text,
  "description" text,
  "application" text,
  "keywords" text[],
  "embedding" vector(1536) -- For OpenAI's text-embedding-ada-002 model
);

-- 3. Goal examples table - personalized examples for applying knowledge to specific goals
CREATE TABLE "public"."goal_examples" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id) ON DELETE CASCADE,
  "goal" text NOT NULL,
  "if_then_example" text,
  "spotting_mission_example" text
);

-- 4. Roadmaps table - represents user's personalized learning journeys
CREATE TABLE "public"."roadmaps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "goal_description" text,
  "status" roadmap_status DEFAULT 'active'::roadmap_status,
  "created_at" timestamptz DEFAULT now(),
  "completed_at" timestamptz
);

-- 5. Roadmap steps table - individual steps within a roadmap, including user's implementation plan
CREATE TABLE "public"."roadmap_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "roadmap_id" uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  "knowledge_content_id" uuid NOT NULL REFERENCES public.knowledge_content(id),
  "status" roadmap_step_status DEFAULT 'locked'::roadmap_step_status,
  "order" smallint NOT NULL,
  "plan_situation" text,
  "plan_trigger" text,
  "plan_action" text,
  "plan_created_at" timestamptz
);

-- 6. Application logs table - stores user's journal reflections and AI analysis
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