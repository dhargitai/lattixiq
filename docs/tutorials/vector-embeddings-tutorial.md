# Vector Embeddings Tutorial for LattixIQ Knowledge Content

This tutorial provides a complete, production-ready implementation for generating vector embeddings from your knowledge content dataset and storing them in Supabase with pgvector.

## Prerequisites

- Node.js 18+ installed
- Supabase project with pgvector extension enabled (already done in your migrations)
- OpenAI API key for embeddings generation
- Access to your Supabase database credentials

## Table of Contents

1. [Installing Dependencies](#1-installing-dependencies)
2. [Setting Up Environment Variables](#2-setting-up-environment-variables)
3. [Creating the Embedding Generation Service](#3-creating-the-embedding-generation-service)
4. [Building the Batch Processing Script](#4-building-the-batch-processing-script)
5. [Database Migration for Vector Storage](#5-database-migration-for-vector-storage)
6. [Running the Embedding Generation](#6-running-the-embedding-generation)
7. [Production Considerations](#7-production-considerations)
8. [Verification and Testing](#8-verification-and-testing)

## 1. Installing Dependencies

First, install the required packages:

```bash
npm install @ai-sdk/openai ai openai
npm install --save-dev @types/node dotenv
```

## 2. Setting Up Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Supabase Direct Connection (for scripts)
DIRECT_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## 3. Creating the Embedding Generation Service

Create `/lib/ai/embeddings-service.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

export interface EmbeddingInput {
  id: string;
  text: string;
}

export interface EmbeddingResult {
  id: string;
  embedding: number[];
}

/**
 * Generates embeddings for a single text input using OpenAI's text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  return embedding;
}

/**
 * Generates embeddings for multiple texts in a batch (more efficient)
 */
export async function generateEmbeddings(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
  const texts = inputs.map((input) => input.text);

  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });

  return inputs.map((input, index) => ({
    id: input.id,
    embedding: embeddings[index],
  }));
}

/**
 * Prepares knowledge content text for embedding by combining relevant fields
 */
export function prepareTextForEmbedding(content: any): string {
  // Combine all relevant text fields with appropriate weighting
  const parts = [
    content.title ? `Title: ${content.title}` : "",
    content.category ? `Category: ${content.category}` : "",
    content.type ? `Type: ${content.type}` : "",
    content.summary ? `Summary: ${content.summary}` : "",
    content.description ? `Description: ${content.description}` : "",
    content.application ? `Application: ${content.application}` : "",
    content.keywords?.length ? `Keywords: ${content.keywords.join(", ")}` : "",
  ];

  // Add goal examples if present
  if (content.goalExamples?.length) {
    content.goalExamples.forEach((example: any) => {
      if (example.goal) {
        parts.push(`Goal Example: ${example.goal}`);
      }
      if (example.if_then_example) {
        parts.push(`If-Then: ${example.if_then_example}`);
      }
    });
  }

  return parts.filter(Boolean).join("\n\n");
}
```

## 4. Building the Batch Processing Script

Create `/scripts/generate-embeddings.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import {
  generateEmbeddings,
  prepareTextForEmbedding,
  EmbeddingInput,
} from "../lib/ai/embeddings-service";

// Load environment variables
config({ path: ".env.local" });

// Constants
const BATCH_SIZE = 20; // Process 20 items at a time to avoid rate limits
const DELAY_MS = 5000; // 1 second delay between batches

// Initialize Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // You'll need to add this to .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Delays execution for the specified milliseconds
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main function to generate and store embeddings
 */
async function generateAndStoreEmbeddings() {
  console.log("🚀 Starting embedding generation process...");

  try {
    // 1. Load knowledge content from JSON file
    const filePath = join(process.cwd(), "lib", "knowledge_content.json");
    const rawContent = readFileSync(filePath, "utf-8");
    const knowledgeContent = JSON.parse(rawContent);

    console.log(`📚 Loaded ${knowledgeContent.length} knowledge items`);

    // 2. Check existing embeddings to avoid duplicates
    const { data: existingRecords } = await supabase
      .from("knowledge_content")
      .select("id, title")
      .not("embedding", "is", null);

    const existingIds = new Set(existingRecords?.map((r) => r.id) || []);
    console.log(`✅ Found ${existingIds.size} items with existing embeddings`);

    // 3. Prepare items for embedding
    const itemsToProcess = knowledgeContent.filter((item: any) => !existingIds.has(item.id));

    if (itemsToProcess.length === 0) {
      console.log("✨ All items already have embeddings!");
      return;
    }

    console.log(`🔄 Processing ${itemsToProcess.length} items without embeddings`);

    // 4. Process in batches
    const batches = [];
    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      batches.push(itemsToProcess.slice(i, i + BATCH_SIZE));
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length}`);

      try {
        // Prepare texts for embedding
        const embeddingInputs: EmbeddingInput[] = batch.map((item: any) => ({
          id: item.id,
          text: prepareTextForEmbedding(item),
        }));

        // Generate embeddings
        const embeddings = await generateEmbeddings(embeddingInputs);

        // Store in database
        for (const { id, embedding } of embeddings) {
          const item = batch.find((b: any) => b.id === id);

          // First, insert/update the knowledge content record
          const { error: upsertError } = await supabase.from("knowledge_content").upsert({
            id: item.id,
            title: item.title,
            category: item.category,
            type: item.type,
            summary: item.summary,
            description: item.description,
            application: item.application,
            keywords: item.keywords,
            embedding: embedding,
          });

          if (upsertError) {
            console.error(`❌ Error storing ${item.title}:`, upsertError);
            errorCount++;
            continue;
          }

          // Then, insert goal examples if they exist
          if (item.goalExamples?.length) {
            for (const example of item.goalExamples) {
              await supabase.from("goal_examples").upsert({
                knowledge_content_id: item.id,
                goal: example.goal,
                if_then_example: example.if_then_example,
                spotting_mission_example: example.spotting_mission_example,
              });
            }
          }

          processedCount++;
          console.log(`✅ Stored embedding for: ${item.title}`);
        }

        // Rate limiting delay between batches
        if (batchIndex < batches.length - 1) {
          console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`);
          await delay(DELAY_MS);
        }
      } catch (error) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, error);
        errorCount += batch.length;
      }
    }

    // 5. Final report
    console.log("\n📊 Embedding Generation Complete!");
    console.log(`✅ Successfully processed: ${processedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📈 Total embeddings in database: ${existingIds.size + processedCount}`);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
generateAndStoreEmbeddings()
  .then(() => {
    console.log("✨ Process completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Process failed:", error);
    process.exit(1);
  });
```

## 5. Database Migration for Vector Storage

Your database already has the vector column, but let's add an index for better performance. Create `/supabase/migrations/20240102000001_add_vector_index.sql`:

```sql
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
```

## 6. Running the Embedding Generation

### Step 1: Add Service Role Key

Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 2: Create NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "embeddings:generate": "tsx scripts/generate-embeddings.ts"
  }
}
```

### Step 3: Run the Script

```bash
npm install tsx --save-dev  # If not already installed
npm run embeddings:generate
```

## 7. Production Considerations

### A. Error Handling and Retry Logic

Update the script with retry logic:

```typescript
async function generateEmbeddingsWithRetry(
  inputs: EmbeddingInput[],
  maxRetries = 3
): Promise<EmbeddingResult[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateEmbeddings(inputs);
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) throw error;

      // Exponential backoff
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }

  throw new Error("Max retries exceeded");
}
```

### B. Rate Limiting

OpenAI has rate limits. Current settings:

- Batch size: 20 items
- Delay: 1 second between batches
- Adjust based on your API tier

### C. Monitoring and Logging

Add structured logging:

```typescript
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: "embeddings-generation.log" }),
    new transports.Console(),
  ],
});
```

### D. Cost Optimization

Using `text-embedding-3-small`:

- Dimensions: 1536
- Cost: $0.02 per 1M tokens
- Estimated for 100 items: ~$0.01

### E. Incremental Updates

The script already checks for existing embeddings. For production:

1. Run initially to populate all embeddings
2. Run periodically to process new content
3. Consider a webhook/trigger when new content is added

## 8. Verification and Testing

### Test the Semantic Search Function

Create `/scripts/test-semantic-search.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { generateEmbedding } from "../lib/ai/embeddings-service";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSemanticSearch() {
  // Test queries
  const testQueries = [
    "I want to make better decisions",
    "How to overcome procrastination",
    "Understanding my own biases",
    "Building better habits",
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search using the database function
    const { data, error } = await supabase.rpc("match_knowledge_content", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error) {
      console.error("Search error:", error);
      continue;
    }

    console.log("Results:");
    data?.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.title} (${item.type}) - Similarity: ${item.similarity.toFixed(3)}`
      );
    });
  }
}

testSemanticSearch().catch(console.error);
```

## Next Steps

1. **Integration with Roadmap Generation**: Use the `match_knowledge_content` function in your roadmap generation API
2. **Caching**: Consider caching frequently used embeddings
3. **Updates**: Set up a GitHub Action to regenerate embeddings when `knowledge_content.json` changes
4. **Monitoring**: Track embedding generation metrics in your monitoring system

## Troubleshooting

### Common Issues:

1. **Rate Limit Errors**: Reduce batch size or increase delay
2. **Memory Issues**: Process smaller batches or use streaming
3. **Connection Timeouts**: Check Supabase connection pooling settings
4. **Dimension Mismatch**: Ensure all embeddings are 1536 dimensions

This completes the tutorial for generating and storing vector embeddings in your production database!
