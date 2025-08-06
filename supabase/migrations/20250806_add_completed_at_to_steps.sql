-- Add completed_at column to roadmap_steps table
ALTER TABLE public.roadmap_steps 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update existing completed steps to have a completed_at timestamp
UPDATE public.roadmap_steps 
SET completed_at = updated_at 
WHERE status = 'completed' AND completed_at IS NULL;