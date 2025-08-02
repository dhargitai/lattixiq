import type { KnowledgeContent as DbKnowledgeContent } from "@/lib/supabase/types";

export interface UserGoalInput {
  goalDescription: string;
  userId: string;
  timestamp: string;
}

// Simplified goal example for AI usage (without DB fields)
export interface AIGoalExample {
  goal: string;
  if_then_example: string | null;
  spotting_mission_example?: string | null;
}

// Re-export KnowledgeContent from database types with AI-friendly goal examples
export type KnowledgeContent = DbKnowledgeContent & {
  // Add the transformed goal_examples as goalExamples for AI compatibility
  goalExamples?: AIGoalExample[];
};

export interface UserLearningHistory {
  userId: string;
  learnedConcepts: {
    knowledgeContentId: string;
    completedAt: string;
    lastReflectionAt: string;
    effectivenessRating: number;
    applicationCount: number;
  }[];
  currentRoadmapId?: string;
}

export interface RoadmapStep {
  order: number;
  knowledgeContentId: string;
  title: string;
  type: "mental-model" | "cognitive-bias" | "fallacy";
  category: string | null;
  relevanceScore: number;
  learningStatus: "new" | "reinforcement";
  reinforcementContext?: {
    lastAppliedDaysAgo: number;
    effectivenessRating: number;
    spacedInterval: string;
  };
  rationaleForInclusion: string;
  suggestedFocus: string;
}

export interface GeneratedRoadmap {
  goalDescription: string;
  totalSteps: number;
  estimatedDuration: string;
  learningMixSummary: {
    newConcepts: number;
    reinforcementConcepts: number;
    expansionPercentage: number;
  };
  steps: RoadmapStep[];
}

export interface ScoredKnowledgeContent extends KnowledgeContent {
  semanticSimilarity: number;
  categoryAlignment: number;
  typeDiversityBonus: number;
  goalExampleMatch: number;
  noveltyScore: number;
  spacedRepetitionScore: number;
  finalScore: number;
  isLearned: boolean;
  daysSinceLastUse?: number;
}
