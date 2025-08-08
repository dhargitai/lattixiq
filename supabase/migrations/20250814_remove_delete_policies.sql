-- Remove DELETE policies to prevent users from deleting roadmaps
-- This prevents bypassing the free roadmap limit by deleting and creating new roadmaps

-- Remove DELETE policy from roadmaps table
DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON public.roadmaps;

-- Remove DELETE policy from roadmap_steps table  
DROP POLICY IF EXISTS "Users can delete steps from their own roadmaps" ON public.roadmap_steps;

-- Add comments explaining why deletion is not allowed
COMMENT ON TABLE roadmaps IS 'User roadmaps - deletion not allowed to maintain free limit integrity';
COMMENT ON TABLE roadmap_steps IS 'Roadmap steps - deletion not allowed to maintain data integrity';