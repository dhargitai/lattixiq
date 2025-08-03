import type { Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";

// Table Row Types
export type User = Tables<"users">;
export type Roadmap = Tables<"roadmaps">;
export type RoadmapStep = Tables<"roadmap_steps">;
export type KnowledgeContent = Tables<"knowledge_content">;
export type ApplicationLog = Tables<"application_logs">;
export type GoalExample = Tables<"goal_examples">;

// Insert Types
export type UserInsert = TablesInsert<"users">;
export type RoadmapInsert = TablesInsert<"roadmaps">;
export type RoadmapStepInsert = TablesInsert<"roadmap_steps">;
export type KnowledgeContentInsert = TablesInsert<"knowledge_content">;
export type ApplicationLogInsert = TablesInsert<"application_logs">;
export type GoalExampleInsert = TablesInsert<"goal_examples">;

// Update Types
export type UserUpdate = TablesUpdate<"users">;
export type RoadmapUpdate = TablesUpdate<"roadmaps">;
export type RoadmapStepUpdate = TablesUpdate<"roadmap_steps">;
export type KnowledgeContentUpdate = TablesUpdate<"knowledge_content">;
export type ApplicationLogUpdate = TablesUpdate<"application_logs">;
export type GoalExampleUpdate = TablesUpdate<"goal_examples">;

// Enum Types
export type AISentiment = Enums<"ai_sentiment">;
export type KnowledgeContentType = Enums<"knowledge_content_type">;
export type RoadmapStatus = Enums<"roadmap_status">;
export type RoadmapStepStatus = Enums<"roadmap_step_status">;
export type SubscriptionStatus = Enums<"subscription_status">;
export type TestimonialState = Enums<"testimonial_state">;

// Joined Types for common queries
export type RoadmapWithSteps = Roadmap & {
  roadmap_steps: (RoadmapStep & {
    knowledge_content: KnowledgeContent;
  })[];
};

// Type for the renamed field query (steps:roadmap_steps)
export type RoadmapWithStepsRenamed = Roadmap & {
  steps: (RoadmapStep & {
    knowledge_content: KnowledgeContent;
  })[];
};

export type RoadmapStepWithContent = RoadmapStep & {
  knowledge_content: KnowledgeContent;
};

export type ApplicationLogWithStep = ApplicationLog & {
  roadmap_steps: RoadmapStep & {
    knowledge_content: KnowledgeContent;
  };
};

// Type guards
export function isValidRoadmapStatus(status: string): status is RoadmapStatus {
  return status === "active" || status === "completed";
}

export function isValidRoadmapStepStatus(status: string): status is RoadmapStepStatus {
  return status === "locked" || status === "unlocked" || status === "completed";
}

export function isValidKnowledgeContentType(type: string): type is KnowledgeContentType {
  return type === "mental-model" || type === "cognitive-bias" || type === "fallacy";
}

// Helper to handle nullable fields
export function ensureString(value: string | null, defaultValue: string = ""): string {
  return value ?? defaultValue;
}

export function ensureArray<T>(value: T[] | null, defaultValue: T[] = []): T[] {
  return value ?? defaultValue;
}
