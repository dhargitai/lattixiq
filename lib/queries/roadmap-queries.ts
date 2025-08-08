import { createClient } from "@/lib/supabase/server";
import type {
  RoadmapWithStepsRenamed,
  Roadmap,
  RoadmapWithSteps,
  RoadmapStepWithContent,
} from "@/lib/supabase/types";

/**
 * Get the active roadmap for a user with all steps and knowledge content
 * Uses renamed field 'steps' instead of 'roadmap_steps'
 */
export async function getActiveRoadmapWithSteps(userId: string) {
  const supabase = await createClient();

  // First get the roadmap with steps
  const roadmapResult = await supabase
    .from("roadmaps")
    .select(
      `
      *,
      steps:roadmap_steps(
        *,
        knowledge_content(*)
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (roadmapResult.error || !roadmapResult.data) {
    return {
      data: null,
      error: roadmapResult.error,
    };
  }

  // Then get application logs to check for reflections
  const stepIds = roadmapResult.data.steps.map((step) => step.id);
  const logsResult = await supabase
    .from("application_logs")
    .select("roadmap_step_id")
    .in("roadmap_step_id", stepIds);

  // Create a set of step IDs that have reflections
  const stepsWithReflections = new Set(logsResult.data?.map((log) => log.roadmap_step_id) || []);

  // Add has_reflection field to each step
  const roadmapWithReflectionData = {
    ...roadmapResult.data,
    steps: roadmapResult.data.steps.map((step) => ({
      ...step,
      has_reflection: stepsWithReflections.has(step.id),
    })),
  };

  return {
    data: roadmapWithReflectionData as RoadmapWithStepsRenamed | null,
    error: null,
  };
}

/**
 * Get all roadmaps for a user (without steps)
 */
export async function getUserRoadmaps(userId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: result.data as Roadmap[] | null,
    error: result.error,
  };
}

/**
 * Get a specific roadmap by ID with all related data
 * Uses the standard field name 'roadmap_steps'
 */
export async function getRoadmapById(roadmapId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("roadmaps")
    .select(
      `
      *,
      roadmap_steps(
        *,
        knowledge_content(*)
      )
    `
    )
    .eq("id", roadmapId)
    .single();

  return {
    data: result.data as RoadmapWithSteps | null,
    error: result.error,
  };
}

/**
 * Check if user has an active roadmap
 */
export async function hasActiveRoadmap(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("roadmaps")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  return {
    hasActive: count ? count > 0 : false,
    error,
  };
}

/**
 * Get a specific roadmap step with knowledge content and roadmap info
 */
export async function getRoadmapStepWithContent(stepId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("roadmap_steps")
    .select(
      `
      *,
      knowledge_content(*),
      roadmap:roadmaps(*)
    `
    )
    .eq("id", stepId)
    .single();

  return {
    data: result.data as (RoadmapStepWithContent & { roadmap: Roadmap }) | null,
    error: result.error,
  };
}
