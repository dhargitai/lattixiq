export interface UserGoalInput {
  goalDescription: string;
  userId: string;
  timestamp: string;
}

export interface KnowledgeContent {
  id: string;
  title: string;
  category: string;
  type: "mental-model" | "cognitive-bias" | "fallacy";
  summary: string;
  description: string;
  application: string;
  keywords: string[];
  embedding: number[];
  goalExamples?: {
    goal: string;
    if_then_example: string;
    spotting_mission_example?: string;
  }[];
}

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
  category: string;
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
