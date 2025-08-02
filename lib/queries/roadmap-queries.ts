import { createClient } from "@/lib/supabase/server";
import type { RoadmapWithStepsRenamed, Roadmap, RoadmapWithSteps } from "@/lib/supabase/types";

/**
 * Get the active roadmap for a user with all steps and knowledge content
 * Uses renamed field 'steps' instead of 'roadmap_steps'
 */
export async function getActiveRoadmapWithSteps(userId: string) {
  const supabase = await createClient();

  const result = await supabase
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

  return {
    data: result.data as RoadmapWithStepsRenamed | null,
    error: result.error,
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
