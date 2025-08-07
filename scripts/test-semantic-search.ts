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
    data?.forEach((item: { title: string; type: string; similarity: number }, index: number) => {
      console.log(
        `${index + 1}. ${item.title} (${item.type}) - Similarity: ${item.similarity.toFixed(3)}`
      );
    });
  }
}

testSemanticSearch().catch(console.error);
