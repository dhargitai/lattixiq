-- Enable pgvector extension for vector embeddings
-- This extension is required for semantic search functionality
-- using OpenAI embeddings in the knowledge_content table

CREATE EXTENSION IF NOT EXISTS vector;