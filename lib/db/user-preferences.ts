import { createClient } from "@/lib/supabase/server";
import { createClient as createClientClient } from "@/lib/supabase/client";

/**
 * Server-side function to check if a user has completed onboarding by verifying if they have created at least one roadmap.
 * @param userId - The ID of the user to check
 * @returns Promise<boolean> - true if the user has completed onboarding, false otherwise
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("roadmap_count")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      // Graceful fallback - assume not completed if we can't verify
      return false;
    }

    // User has completed onboarding if they have created at least one roadmap
    return (data?.roadmap_count ?? 0) > 0;
  } catch (error) {
    console.error("Unexpected error in hasCompletedOnboarding:", error);
    // Graceful fallback for unexpected errors
    return false;
  }
}

/**
 * Client-side function to check if the current user has completed onboarding.
 * @returns Promise<boolean> - true if the user has completed onboarding, false otherwise
 */
export async function hasCompletedOnboardingClient(): Promise<boolean> {
  try {
    const supabase = createClientClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return false;
    }

    const { data, error } = await supabase
      .from("users")
      .select("roadmap_count")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      // Graceful fallback - assume not completed if we can't verify
      return false;
    }

    // User has completed onboarding if they have created at least one roadmap
    return (data?.roadmap_count ?? 0) > 0;
  } catch (error) {
    console.error("Unexpected error in hasCompletedOnboardingClient:", error);
    // Graceful fallback for unexpected errors
    return false;
  }
}
