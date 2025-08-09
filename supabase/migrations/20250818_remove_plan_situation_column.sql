-- Remove unused plan_situation column from roadmap_steps table
-- This column is no longer needed as we don't use it in the application

-- Remove the plan_situation column
ALTER TABLE "public"."roadmap_steps" 
DROP COLUMN IF EXISTS "plan_situation";