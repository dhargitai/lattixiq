/**
 * Motivational messages for plan reminder emails
 * Following functional programming patterns - pure functions with immutable data
 */

import type { Database } from "@/lib/supabase/database.types";

type ContentType = Database["public"]["Enums"]["knowledge_content_type"];

/**
 * Message collections for different content types
 * Immutable data structure
 */
const MENTAL_MODEL_MESSAGES = [
  "Remember, every mental model you practice rewires your brain for clearer thinking.",
  "Great thinkers aren't born, they're built one mental model at a time.",
  "This mental model is a tool in your toolkit. The more you use it, the sharper it becomes.",
  "Each time you apply this model, you're training your mind to see patterns others miss.",
  "Mental models compound. Today's practice builds on yesterday's foundation.",
] as const;

const COGNITIVE_BIAS_MESSAGES = [
  "Spotting biases is the first step to clearer judgment. You're doing great!",
  "Every bias you recognize is a blind spot illuminated.",
  "By noticing this bias, you're already thinking more clearly than most.",
  "Awareness is the antidote to bias. Keep practicing!",
  "Each time you catch this bias, you strengthen your rational thinking.",
] as const;

const FALLACY_MESSAGES = [
  "Recognizing fallacies sharpens your critical thinking. Keep it up!",
  "Every fallacy you spot makes you a clearer communicator and thinker.",
  "You're building immunity to flawed reasoning, one practice at a time.",
  "Logical thinking is a superpower. You're developing it right now.",
  "Each fallacy you identify makes you harder to mislead.",
] as const;

/**
 * Map of content types to their message collections
 * Immutable mapping
 */
const MESSAGE_MAP: Record<ContentType, readonly string[]> = {
  "mental-model": MENTAL_MODEL_MESSAGES,
  "cognitive-bias": COGNITIVE_BIAS_MESSAGES,
  fallacy: FALLACY_MESSAGES,
} as const;

/**
 * Get a motivational message based on content type and optional title
 * Pure function - deterministic based on inputs
 * Uses title hash for consistent message selection per content
 */
export function getMotivationalMessage(contentType: ContentType, contentTitle?: string): string {
  const messages = MESSAGE_MAP[contentType] || MENTAL_MODEL_MESSAGES;

  if (contentTitle) {
    // Use title to deterministically select a message
    // This ensures the same content always gets the same message
    const hash = contentTitle
      .split("")
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);

    const index = Math.abs(hash) % messages.length;
    return messages[index];
  }

  // If no title, return the first message as default
  return messages[0];
}

/**
 * Get a random motivational message for testing purposes
 * Pure function that accepts a seed for deterministic randomness
 */
export function getRandomMotivationalMessage(
  contentType: ContentType,
  seed: number = Date.now()
): string {
  const messages = MESSAGE_MAP[contentType] || MENTAL_MODEL_MESSAGES;

  // Simple pseudo-random based on seed
  const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
  const index = Math.floor(pseudoRandom * messages.length);

  return messages[index];
}
