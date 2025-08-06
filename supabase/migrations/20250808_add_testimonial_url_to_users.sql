-- Add testimonial_url field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS testimonial_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.testimonial_url IS 'Optional URL to the user''s testimonial on Senja.io or other platforms';