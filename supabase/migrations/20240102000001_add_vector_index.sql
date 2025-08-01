-- Create an index on the embedding column for faster similarity searches
CREATE INDEX IF NOT EXISTS idx_knowledge_content_embedding
ON knowledge_content
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add a function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  type knowledge_content_type,
  summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.title,
    kc.category,
    kc.type,
    kc.summary,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_content kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;