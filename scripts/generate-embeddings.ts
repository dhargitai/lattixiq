import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";
import {
  generateEmbeddings,
  prepareTextForEmbedding,
  EmbeddingInput,
  EmbeddingResult,
} from "../lib/ai/embeddings-service";
import type { Database } from "../lib/supabase/database.types";

// Load environment variables
config({ path: ".env.local" });

// Constants
const BATCH_SIZE = 20; // Process 20 items at a time to avoid rate limits
const DELAY_MS = 5000; // 5 seconds delay between batches
const MAX_RETRIES = 3;
const PROGRESS_FILE = "embeddings-progress.json";
const EXPECTED_DIMENSIONS = 1536; // text-embedding-3-small dimensions

// Configure logger
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.File({ filename: "embeddings-generation.log" }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Initialize Supabase client with service role for admin access
const supabase = createClient<Database>(
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
 * Progress tracking interface
 */
interface Progress {
  processedTitles: string[]; // Track by title instead of ID
  lastProcessedBatch: number;
  totalProcessed: number;
  totalErrors: number;
  startTime: string;
  lastUpdateTime: string;
}

/**
 * Load progress from file
 */
function loadProgress(): Progress | null {
  try {
    if (existsSync(PROGRESS_FILE)) {
      const data = readFileSync(PROGRESS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    logger.warn("Failed to load progress file", { error });
  }
  return null;
}

/**
 * Save progress to file
 */
function saveProgress(progress: Progress): void {
  try {
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    logger.error("Failed to save progress", { error });
  }
}

/**
 * Generate embeddings with retry logic and exponential backoff
 */
async function generateEmbeddingsWithRetry(
  inputs: EmbeddingInput[],
  maxRetries = MAX_RETRIES
): Promise<EmbeddingResult[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generating embeddings for batch`, {
        attempt,
        batchSize: inputs.length,
      });

      const results = await generateEmbeddings(inputs);

      // Validate embedding dimensions
      for (const result of results) {
        if (result.embedding.length !== EXPECTED_DIMENSIONS) {
          throw new Error(
            `Invalid embedding dimensions: expected ${EXPECTED_DIMENSIONS}, got ${result.embedding.length}`
          );
        }
      }

      return results;
    } catch (error: any) {
      logger.error(`Embedding generation attempt ${attempt} failed`, {
        error: error.message,
        attempt,
        maxRetries,
      });

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = Math.pow(2, attempt) * 1000;
      logger.info(`Retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Calculate estimated cost for embeddings
 */
function calculateCost(tokenCount: number): number {
  const COST_PER_MILLION_TOKENS = 0.02; // text-embedding-3-small
  return (tokenCount / 1_000_000) * COST_PER_MILLION_TOKENS;
}

/**
 * Estimate tokens for a text (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: ~1 token per 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Main function to generate and store embeddings
 */
async function generateAndStoreEmbeddings() {
  logger.info("Starting embedding generation process");

  const startTime = new Date();
  let totalTokensUsed = 0;
  let progress = loadProgress();

  // Initialize progress if not resuming
  if (!progress) {
    progress = {
      processedTitles: [],
      lastProcessedBatch: -1,
      totalProcessed: 0,
      totalErrors: 0,
      startTime: startTime.toISOString(),
      lastUpdateTime: startTime.toISOString(),
    };
  } else {
    logger.info("Resuming from previous progress", {
      processedCount: progress.processedTitles.length,
      lastBatch: progress.lastProcessedBatch,
    });
  }

  try {
    // 1. Load knowledge content from JSON file
    const filePath = join(process.cwd(), "lib", "knowledge_content.json");
    const rawContent = readFileSync(filePath, "utf-8");
    const knowledgeContent = JSON.parse(rawContent);

    logger.info(`Loaded knowledge items`, { count: knowledgeContent.length });

    // 2. Check existing embeddings to avoid duplicates
    const { data: existingRecords } = await supabase
      .from("knowledge_content")
      .select("id, title")
      .not("embedding", "is", null);

    const existingTitles = new Set(existingRecords?.map((r) => r.title) || []);

    // Combine with already processed titles from progress
    const allProcessedTitles = new Set([
      ...Array.from(existingTitles),
      ...progress.processedTitles,
    ]);

    logger.info(`Found existing embeddings`, {
      existingCount: existingTitles.size,
      previouslyProcessed: progress.processedTitles.length,
    });

    // 3. Prepare items for embedding
    const itemsToProcess = knowledgeContent.filter(
      (item: any) => !allProcessedTitles.has(item.title)
    );

    if (itemsToProcess.length === 0) {
      logger.info("All items already have embeddings!");
      return;
    }

    logger.info(`Processing items without embeddings`, { count: itemsToProcess.length });

    // 4. Process in batches
    const batches = [];
    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      batches.push(itemsToProcess.slice(i, i + BATCH_SIZE));
    }

    let processedCount = progress.totalProcessed;
    let errorCount = progress.totalErrors;

    // Start from the last processed batch + 1
    const startBatchIndex = progress.lastProcessedBatch + 1;

    for (let batchIndex = startBatchIndex; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      logger.info(`Processing batch`, {
        batchNumber: batchIndex + 1,
        totalBatches: batches.length,
        batchSize: batch.length,
      });

      try {
        // Prepare texts for embedding
        const embeddingInputs: EmbeddingInput[] = batch.map((item: any) => ({
          id: item.id,
          text: prepareTextForEmbedding(item),
        }));

        // Estimate tokens for cost tracking
        const batchTokens = embeddingInputs.reduce(
          (sum, input) => sum + estimateTokens(input.text),
          0
        );
        totalTokensUsed += batchTokens;

        // Generate embeddings with retry logic
        const embeddings = await generateEmbeddingsWithRetry(embeddingInputs);

        // Store in database
        for (const { id, embedding } of embeddings) {
          const item = batch.find((b: any) => b.id === id);

          try {
            // First, check if this knowledge content already exists by title
            const { data: existingItem } = await supabase
              .from("knowledge_content")
              .select("id")
              .eq("title", item.title)
              .single();

            const knowledgeId = existingItem?.id;

            if (knowledgeId) {
              // Update existing record with embedding
              const { error: updateError } = await supabase
                .from("knowledge_content")
                .update({ embedding: JSON.stringify(embedding) })
                .eq("id", knowledgeId);

              if (updateError) {
                throw updateError;
              }
            } else {
              // Insert new record (let database generate UUID)
              const { data: insertedItem, error: insertError } = await supabase
                .from("knowledge_content")
                .insert({
                  title: item.title,
                  category: item.category,
                  type: item.type,
                  summary: item.summary,
                  description: item.description,
                  application: item.application,
                  keywords: item.keywords,
                  embedding: JSON.stringify(embedding),
                })
                .select("id")
                .single();

              if (insertError) {
                throw insertError;
              }

              // Insert goal examples if they exist
              if (item.goalExamples?.length && insertedItem) {
                for (const example of item.goalExamples) {
                  await supabase.from("goal_examples").insert({
                    knowledge_content_id: insertedItem.id,
                    goal: example.goal,
                    if_then_example: example.if_then_example,
                    spotting_mission_example: example.spotting_mission_example,
                  });
                }
              }
            }

            processedCount++;
            progress.processedTitles.push(item.title);
            logger.info(`Stored embedding`, { title: item.title });
          } catch (error) {
            logger.error(`Error storing embedding`, {
              title: item.title,
              id: item.id,
              error,
            });
            errorCount++;
          }
        }

        // Update progress after successful batch
        progress.lastProcessedBatch = batchIndex;
        progress.totalProcessed = processedCount;
        progress.totalErrors = errorCount;
        progress.lastUpdateTime = new Date().toISOString();
        saveProgress(progress);

        // Rate limiting delay between batches
        if (batchIndex < batches.length - 1) {
          logger.info(`Rate limiting delay`, { delayMs: DELAY_MS });
          await delay(DELAY_MS);
        }
      } catch (error) {
        logger.error(`Batch failed`, {
          batchNumber: batchIndex + 1,
          error,
        });
        errorCount += batch.length;

        // Update error count in progress
        progress.totalErrors = errorCount;
        saveProgress(progress);
      }
    }

    // 5. Final report
    const endTime = new Date();
    const durationMs = endTime.getTime() - new Date(progress.startTime).getTime();
    const estimatedCost = calculateCost(totalTokensUsed);

    logger.info("Embedding generation complete", {
      successfullyProcessed: processedCount,
      errors: errorCount,
      totalEmbeddingsInDb: existingTitles.size + processedCount,
      durationSeconds: Math.round(durationMs / 1000),
      estimatedTokensUsed: totalTokensUsed,
      estimatedCostUSD: estimatedCost.toFixed(4),
    });

    // Clean up progress file on successful completion
    if (errorCount === 0) {
      try {
        if (existsSync(PROGRESS_FILE)) {
          unlinkSync(PROGRESS_FILE);
          logger.info("Progress file cleaned up");
        }
      } catch (error) {
        logger.warn("Failed to clean up progress file", { error });
      }
    }
  } catch (error) {
    logger.error("Fatal error", { error });
    process.exit(1);
  }
}

// Run the script
generateAndStoreEmbeddings()
  .then(() => {
    logger.info("Process completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Process failed", { error });
    process.exit(1);
  });
