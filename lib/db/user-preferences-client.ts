import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

// Type for modal IDs stored in the database
export type ModalId = string;

// Cache for shown modals to minimize database calls
const shownModalsCache = new Map<string, { data: ModalId[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a unique modal ID for a given type and step
 * @param type - The type of modal (e.g. 'plan', 'reflect')
 * @param stepId - The ID of the step this modal is associated with
 * @returns A unique modal ID
 */
export function generateModalId(type: string, stepId: string): ModalId {
  return `${type}-${stepId}`;
}

/**
 * Checks if the cache is valid for a given user
 * @param userId - The ID of the user to check cache for
 * @returns true if cache is valid and not expired
 */
function isCacheValid(userId: string): boolean {
  const cached = shownModalsCache.get(userId);
  if (!cached) return false;

  const now = Date.now();
  return now - cached.timestamp < CACHE_TTL;
}

/**
 * Client-side function to check if a user has completed onboarding by verifying if they have created at least one roadmap.
 * @returns Promise<boolean> - true if the user has completed onboarding, false otherwise
 */
export async function hasCompletedOnboardingClient(): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return false;
    }

    // Check if user has any roadmaps
    const { data, error } = await supabase
      .from("users")
      .select("roadmap_count")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking roadmap count:", error);
      return false;
    }

    // User has completed onboarding if they have at least one roadmap
    return (data?.roadmap_count ?? 0) > 0;
  } catch (error) {
    console.error("Unexpected error in hasCompletedOnboardingClient:", error);
    return false;
  }
}

/**
 * Client-side function to check if a specific modal has been shown to the current user
 * @param modalId - The ID of the modal to check
 * @returns Promise<boolean> - true if the modal has been shown, false otherwise
 */
export async function hasShownModalClient(modalId: ModalId): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return false;
    }

    // Check cache first
    if (isCacheValid(user.id)) {
      const cached = shownModalsCache.get(user.id);
      return cached?.data.includes(modalId) ?? false;
    }

    const { data, error } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking modal status:", error);
      return false;
    }

    const shownModals = (data?.shown_modals as ModalId[]) ?? [];

    // Update cache
    shownModalsCache.set(user.id, { data: shownModals, timestamp: Date.now() });

    return shownModals.includes(modalId);
  } catch (error) {
    console.error("Unexpected error in hasShownModalClient:", error);
    return false;
  }
}

/**
 * Client-side function to add a modal ID to the list of shown modals for the current user
 * @param modalId - The ID of the modal to mark as shown
 */
export async function addShownModalClient(modalId: ModalId): Promise<void> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      throw authError || new Error("User not authenticated");
    }

    // Get current shown_modals
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching user shown_modals:", fetchError);
      throw fetchError;
    }

    const currentModals = (data?.shown_modals as ModalId[]) ?? [];

    // Add the new modal if not already present
    if (!currentModals.includes(modalId)) {
      const updatedModals = [...currentModals, modalId];

      const { error: updateError } = await supabase
        .from("users")
        .update({ shown_modals: updatedModals as Json })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating shown_modals:", updateError);
        throw updateError;
      }

      // Update cache
      shownModalsCache.set(user.id, { data: updatedModals, timestamp: Date.now() });
    }
  } catch (error) {
    console.error("Unexpected error in addShownModalClient:", error);
    throw error;
  }
}

/**
 * Client-side function to get all modal IDs that have been shown to the current user
 * @returns Promise<ModalId[]> - Array of modal IDs that have been shown
 */
export async function getShownModalsClient(): Promise<ModalId[]> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return [];
    }

    // Check cache first
    if (isCacheValid(user.id)) {
      const cached = shownModalsCache.get(user.id);
      return cached?.data ?? [];
    }

    const { data, error } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching shown modals:", error);
      return [];
    }

    const shownModals = (data?.shown_modals as ModalId[]) ?? [];

    // Update cache
    shownModalsCache.set(user.id, { data: shownModals, timestamp: Date.now() });

    return shownModals;
  } catch (error) {
    console.error("Unexpected error in getShownModalsClient:", error);
    return [];
  }
}

/**
 * Client-side function to migrate localStorage modal data to the database
 * This helps transition users from localStorage-based modal tracking to database-based tracking
 * @returns Promise<number> - Number of modals migrated
 */
export async function migrateLocalStorageModals(): Promise<number> {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return 0;
    }

    let migratedCount = 0;

    // Get all localStorage keys that start with modal prefixes
    const modalPrefixes = ["hasShown_plan_", "hasShown_reflect_", "hasShown_guidance_"];
    const keysToMigrate: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && modalPrefixes.some((prefix) => key.startsWith(prefix))) {
        keysToMigrate.push(key);
      }
    }

    // If no keys to migrate, return early
    if (keysToMigrate.length === 0) {
      return 0;
    }

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user for migration:", authError);
      return 0;
    }

    // Get current shown_modals from database
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching user data for migration:", fetchError);
      return 0;
    }

    const currentModals = (data?.shown_modals as ModalId[]) ?? [];
    const modalsToAdd: ModalId[] = [];

    // Convert localStorage keys to modal IDs
    for (const key of keysToMigrate) {
      const value = localStorage.getItem(key);
      if (value === "true") {
        // Extract modal ID from localStorage key
        let modalId = "";
        if (key.startsWith("hasShown_plan_")) {
          modalId = generateModalId("plan", key.replace("hasShown_plan_", ""));
        } else if (key.startsWith("hasShown_reflect_")) {
          modalId = generateModalId("reflect", key.replace("hasShown_reflect_", ""));
        } else if (key.startsWith("hasShown_guidance_")) {
          modalId = generateModalId("guidance", key.replace("hasShown_guidance_", ""));
        }

        if (modalId && !currentModals.includes(modalId)) {
          modalsToAdd.push(modalId);
        }
      }
    }

    // Update database if we have modals to add
    if (modalsToAdd.length > 0) {
      const updatedModals = [...currentModals, ...modalsToAdd];

      const { error: updateError } = await supabase
        .from("users")
        .update({ shown_modals: updatedModals as Json })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error migrating modals to database:", updateError);
        return 0;
      }

      migratedCount = modalsToAdd.length;

      // Update cache
      shownModalsCache.set(user.id, { data: updatedModals, timestamp: Date.now() });
    }

    // Clean up localStorage
    for (const key of keysToMigrate) {
      localStorage.removeItem(key);
    }

    if (migratedCount > 0) {
      console.log(
        `Successfully migrated ${migratedCount} modal states from localStorage to database`
      );
    }

    return migratedCount;
  } catch (error) {
    console.error("Unexpected error in migrateLocalStorageModals:", error);
    return 0;
  }
}
