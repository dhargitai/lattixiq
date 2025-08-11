-- Add shown_modals column to users table for tracking which guidance modals users have seen
-- This column stores an array of modal identifiers (e.g., step IDs) that have been shown to the user
-- Used to prevent showing the same modal multiple times and provide better UX
--
-- Rollback:
-- ALTER TABLE public.users DROP COLUMN IF EXISTS shown_modals;

-- Add shown_modals column with default empty JSONB array
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS shown_modals JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN public.users.shown_modals IS 'Tracks which guidance modals have been shown to the user. Stores an array of modal identifiers (typically step IDs). Used to prevent redundant modal displays.';

-- Ensure the column has the correct default for existing rows
-- This will set NULL values to empty array if any exist
UPDATE public.users 
SET shown_modals = '[]'::jsonb 
WHERE shown_modals IS NULL;

-- Add a check constraint to ensure the column always contains an array
ALTER TABLE public.users 
ADD CONSTRAINT shown_modals_is_array 
CHECK (jsonb_typeof(shown_modals) = 'array');