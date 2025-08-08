-- Create content_blocks table for dynamic content management
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_content_blocks_content_id ON content_blocks(content_id);
CREATE INDEX idx_content_blocks_published ON content_blocks(published);

-- Add RLS policies for content_blocks
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read published content blocks
CREATE POLICY "Authenticated users can read published content blocks"
  ON content_blocks
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Only service role can manage content blocks (for admin purposes)
-- No public write access

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE
  ON content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE content_blocks IS 'Stores dynamic content blocks for modals, messages, and other UI elements';
COMMENT ON COLUMN content_blocks.content_id IS 'Unique slug identifier for the content block';
COMMENT ON COLUMN content_blocks.content IS 'Markdown content to be displayed';
COMMENT ON COLUMN content_blocks.metadata IS 'Optional structured data for additional configuration';
COMMENT ON COLUMN content_blocks.published IS 'Whether the content is published and visible to users';