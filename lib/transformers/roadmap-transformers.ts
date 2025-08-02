import type {
  RoadmapWithStepsRenamed,
  RoadmapStepWithContent,
  RoadmapStep,
  KnowledgeContent,
} from "@/lib/supabase/types";

/**
 * Transform database roadmap to view-friendly format
 * Maps database field names to UI component expectations
 */
export function transformRoadmapForView(roadmap: RoadmapWithStepsRenamed) {
  return {
    id: roadmap.id,
    goal_description: roadmap.goal_description || "",
    steps: roadmap.steps.map(transformStepForView),
  };
}

/**
 * Transform database step to view-friendly format
 * Maps 'order' to 'order_index' for UI components
 */
export function transformStepForView(step: RoadmapStep & { knowledge_content: KnowledgeContent }) {
  return {
    id: step.id,
    order_index: step.order, // Map 'order' to 'order_index' for UI components
    status: step.status || ("locked" as "unlocked" | "locked" | "completed"),
    knowledge_content: {
      id: step.knowledge_content.id,
      title: step.knowledge_content.title,
      category: step.knowledge_content.category || "Uncategorized",
      type: step.knowledge_content.type,
      summary: step.knowledge_content.summary || "",
    },
  };
}

/**
 * Type for the transformed roadmap that matches UI component expectations
 */
export type TransformedRoadmap = ReturnType<typeof transformRoadmapForView>;

/**
 * Type for the transformed step that matches UI component expectations
 */
export type TransformedStep = ReturnType<typeof transformStepForView>;
