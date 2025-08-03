import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import type { KnowledgeContent, AIGoalExample } from "@/lib/types/ai";

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
export function prepareTextForEmbedding(content: KnowledgeContent): string {
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
    content.goalExamples.forEach((example: AIGoalExample) => {
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
