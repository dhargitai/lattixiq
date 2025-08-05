-- Add updated_at column to roadmap_steps table
ALTER TABLE public.roadmap_steps 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add updated_at column to roadmaps table  
ALTER TABLE public.roadmaps 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing rows in roadmaps to have updated_at = created_at
UPDATE public.roadmaps 
SET updated_at = created_at 
WHERE updated_at IS NULL AND created_at IS NOT NULL;

-- Update existing rows in roadmap_steps to have updated_at = plan_created_at or now()
UPDATE public.roadmap_steps 
SET updated_at = COALESCE(plan_created_at, now()) 
WHERE updated_at IS NULL;

-- Add comments to document the columns
COMMENT ON COLUMN public.roadmap_steps.updated_at IS 'Timestamp of the last update to this step';
COMMENT ON COLUMN public.roadmaps.updated_at IS 'Timestamp of the last update to this roadmap';