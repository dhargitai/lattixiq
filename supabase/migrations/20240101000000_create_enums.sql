-- Create custom ENUM types for LattixIQ database schema
-- These enums are used across multiple tables for consistent data types

-- Subscription status for users table
CREATE TYPE subscription_status AS ENUM ('free', 'premium');

-- Testimonial state for tracking user feedback flow
CREATE TYPE testimonial_state AS ENUM (
  'not_asked',
  'asked_first',
  'dismissed_first',
  'submitted',
  'asked_second',
  'dismissed_second'
);

-- Roadmap status for roadmaps table
CREATE TYPE roadmap_status AS ENUM ('active', 'completed');

-- Roadmap step status for roadmap_steps table
CREATE TYPE roadmap_step_status AS ENUM ('locked', 'unlocked', 'completed');

-- AI sentiment analysis for application_logs table
CREATE TYPE ai_sentiment AS ENUM ('positive', 'negative', 'neutral');

-- Knowledge content type for knowledge_content table
CREATE TYPE knowledge_content_type AS ENUM ('mental-model', 'cognitive-bias', 'fallacy');