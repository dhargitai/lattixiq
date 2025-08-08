-- Add roadmap tracking fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS roadmap_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_roadmaps_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS testimonial_bonus_used BOOLEAN DEFAULT false;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_roadmap_count ON users(roadmap_count);
CREATE INDEX IF NOT EXISTS idx_users_free_roadmaps_used ON users(free_roadmaps_used);

-- Add comments for documentation
COMMENT ON COLUMN users.roadmap_count IS 'Total number of roadmaps created by the user';
COMMENT ON COLUMN users.free_roadmaps_used IS 'Whether the user has used their free roadmap';
COMMENT ON COLUMN users.testimonial_bonus_used IS 'Whether the user has used their testimonial bonus roadmap';