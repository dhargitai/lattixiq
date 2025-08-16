-- Migration: Knowledge Content Revamp for "Crystallize & Apply" Model
-- Date: 2025-01-16
-- Description: Extends knowledge_content and roadmap_steps tables to support
--              the new comprehensive learning experience with personalized content

-- Add new fields to knowledge_content table for the "Crystallize & Apply" model
ALTER TABLE knowledge_content 
ADD COLUMN hook TEXT,
ADD COLUMN definition TEXT,
ADD COLUMN analogy_or_metaphor TEXT,
ADD COLUMN key_takeaway TEXT,
ADD COLUMN classic_example TEXT,
ADD COLUMN modern_example TEXT,
ADD COLUMN pitfall TEXT,
ADD COLUMN payoff TEXT,
ADD COLUMN visual_metaphor TEXT, -- Text prompt for image generation
ADD COLUMN visual_metaphor_url TEXT, -- URL to pre-generated image (nullable)
ADD COLUMN dive_deeper_mechanism TEXT,
ADD COLUMN dive_deeper_origin_story TEXT,
ADD COLUMN dive_deeper_pitfalls_nuances TEXT,
ADD COLUMN super_model BOOLEAN DEFAULT false,
ADD COLUMN extra_content TEXT; -- Long markdown content (nullable)

-- Add personalized content fields to roadmap_steps table
ALTER TABLE roadmap_steps
ADD COLUMN personalized_example TEXT, -- LLM-generated example based on user's goal
ADD COLUMN combine_with_models TEXT[]; -- Array of model names to combine (for steps 3+)

-- Add comments for documentation
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

COMMENT ON COLUMN roadmap_steps.personalized_example IS 'LLM-generated example tailored to the users specific goal';
COMMENT ON COLUMN roadmap_steps.combine_with_models IS 'Array of other model names that synergize with this concept (for steps 3+)';

-- Create indexes for performance
CREATE INDEX idx_knowledge_content_super_model ON knowledge_content(super_model) WHERE super_model = true;
CREATE INDEX idx_roadmap_steps_personalized_example ON roadmap_steps(roadmap_id) WHERE personalized_example IS NOT NULL;

-- Update table comments
COMMENT ON TABLE knowledge_content IS 'Mental models, cognitive biases, and fallacies with comprehensive learning content following the Crystallize & Apply methodology';
COMMENT ON TABLE roadmap_steps IS 'Individual steps within a roadmap with personalized learning examples and model combinations';