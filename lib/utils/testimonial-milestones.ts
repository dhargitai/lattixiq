import type { Database } from "@/lib/supabase/database.types";

type TestimonialState = Database["public"]["Enums"]["testimonial_state"];

export interface TestimonialMilestone {
  type: "first_roadmap" | "sustained_success" | null;
  shouldShow: boolean;
}

/**
 * Check if user has completed their first roadmap
 */
export function hasCompletedFirstRoadmap(completedRoadmapsCount: number): boolean {
  return completedRoadmapsCount === 1;
}

/**
 * Check if user has sustained success
 * Currently checking for 3+ completed roadmaps
 * In the future, this should also check effectiveness ratings
 */
export function hasSustainedSuccess(
  completedRoadmapsCount: number,
  averageEffectiveness?: number
): boolean {
  // Base requirement: 3+ completed roadmaps
  if (completedRoadmapsCount < 3) {
    return false;
  }

  // If we have effectiveness data, check for high ratings (4+)
  if (averageEffectiveness !== undefined) {
    return averageEffectiveness >= 4;
  }

  // Default to true if we have 3+ roadmaps but no effectiveness data
  return true;
}

/**
 * Determine if we should show the testimonial prompt
 */
export function getTestimonialMilestone(
  testimonialState: TestimonialState | null,
  completedRoadmapsCount: number,
  averageEffectiveness?: number
): TestimonialMilestone {
  // Default state
  const currentState = testimonialState || "not_asked";

  // Already submitted - never show again
  if (currentState === "submitted") {
    return { type: null, shouldShow: false };
  }

  // Check for first roadmap milestone
  if (currentState === "not_asked" && hasCompletedFirstRoadmap(completedRoadmapsCount)) {
    return { type: "first_roadmap", shouldShow: true };
  }

  // Check for sustained success milestone
  if (
    currentState === "asked_first" &&
    hasSustainedSuccess(completedRoadmapsCount, averageEffectiveness)
  ) {
    return { type: "sustained_success", shouldShow: true };
  }

  // No milestone met or already dismissed
  return { type: null, shouldShow: false };
}

/**
 * Calculate average effectiveness rating from application logs
 * This would need to be implemented to query actual ratings
 */
export async function calculateAverageEffectiveness(_userId: string): Promise<number | undefined> {
  // TODO: Implement this to query application_logs for effectiveness ratings
  // For now, return undefined to use the default logic
  return undefined;
}
