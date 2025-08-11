import { createClient } from "@/lib/supabase/server";
import { createClient as createClientClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

// Type for modal IDs stored in the database
export type ModalId = string;

// Cache for shown modals to minimize database calls
const shownModalsCache = new Map<string, { data: ModalId[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

/**
 * Helper function to generate consistent modal IDs
 * @param type - The type of modal (e.g., 'plan', 'reflect')
 * @param stepId - The step ID associated with the modal
 * @returns A formatted modal ID
 */
export function generateModalId(type: string, stepId: string): ModalId {
  return `${type}-${stepId}`;
}

/**
 * Clears the cache for a specific user
 * @param userId - The user ID whose cache should be cleared
 */
export function clearModalCache(userId: string): void {
  shownModalsCache.delete(userId);
}

/**
 * Clears the entire modal cache (useful for testing)
 */
export function clearAllModalCache(): void {
  shownModalsCache.clear();
}

/**
 * Checks if the cache is still valid
 * @param userId - The user ID to check
 * @returns boolean indicating if cache is valid
 */
function isCacheValid(userId: string): boolean {
  const cached = shownModalsCache.get(userId);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_TTL;
}

/**
 * Server-side function to check if a specific modal has been shown to a user
 * @param userId - The ID of the user
 * @param modalId - The ID of the modal to check
 * @returns Promise<boolean> - true if the modal has been shown, false otherwise
 */
export async function hasShownModal(userId: string, modalId: ModalId): Promise<boolean> {
  try {
    // Check cache first
    if (isCacheValid(userId)) {
      const cached = shownModalsCache.get(userId);
      return cached?.data.includes(modalId) ?? false;
    }

    const supabase = await createClient();

    // Use JSONB contains operator for efficient checking
    const { data, error } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking modal status:", error);
      return false;
    }

    const shownModals = (data?.shown_modals as ModalId[]) ?? [];

    // Update cache
    shownModalsCache.set(userId, { data: shownModals, timestamp: Date.now() });

    return shownModals.includes(modalId);
  } catch (error) {
    console.error("Unexpected error in hasShownModal:", error);
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
 * Server-side function to add a modal ID to the list of shown modals for a user
 * @param userId - The ID of the user
 * @param modalId - The ID of the modal to add
 * @returns Promise<void>
 */
export async function addShownModal(userId: string, modalId: ModalId): Promise<void> {
  try {
    const supabase = await createClient();

    // Get current shown_modals
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      throw fetchError;
    }

    const currentModals = (userData?.shown_modals as ModalId[]) ?? [];

    // Only update if modal not already in array
    if (!currentModals.includes(modalId)) {
      const updatedModals = [...currentModals, modalId];

      const { error: updateError } = await supabase
        .from("users")
        .update({ shown_modals: updatedModals as unknown as Json })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating shown modals:", updateError);
        throw updateError;
      }

      // Clear cache after update
      clearModalCache(userId);
    }
  } catch (error) {
    console.error("Unexpected error in addShownModal:", error);
    throw error;
  }
}

/**
 * Client-side function to add a modal ID to the list of shown modals for the current user
 * @param modalId - The ID of the modal to add
 * @returns Promise<void>
 */
export async function addShownModalClient(modalId: ModalId): Promise<void> {
  try {
    const supabase = createClientClient();

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
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      throw fetchError;
    }

    const currentModals = (userData?.shown_modals as ModalId[]) ?? [];

    // Only update if modal not already in array
    if (!currentModals.includes(modalId)) {
      const updatedModals = [...currentModals, modalId];

      const { error: updateError } = await supabase
        .from("users")
        .update({ shown_modals: updatedModals as unknown as Json })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating shown modals:", updateError);
        throw updateError;
      }

      // Clear cache after update
      clearModalCache(user.id);
    }
  } catch (error) {
    console.error("Unexpected error in addShownModalClient:", error);
    throw error;
  }
}

/**
 * Server-side function to get all shown modals for a user
 * @param userId - The ID of the user
 * @returns Promise<ModalId[]> - Array of modal IDs that have been shown
 */
export async function getShownModals(userId: string): Promise<ModalId[]> {
  try {
    // Check cache first
    if (isCacheValid(userId)) {
      const cached = shownModalsCache.get(userId);
      return cached?.data ?? [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching shown modals:", error);
      return [];
    }

    const shownModals = (data?.shown_modals as ModalId[]) ?? [];

    // Update cache
    shownModalsCache.set(userId, { data: shownModals, timestamp: Date.now() });

    return shownModals;
  } catch (error) {
    console.error("Unexpected error in getShownModals:", error);
    return [];
  }
}

/**
 * Client-side function to get all shown modals for the current user
 * @returns Promise<ModalId[]> - Array of modal IDs that have been shown
 */
export async function getShownModalsClient(): Promise<ModalId[]> {
  try {
    const supabase = createClientClient();

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
 * Client-side function to migrate localStorage modal data to database
 * @returns Promise<number> - Number of modals migrated
 */
export async function migrateLocalStorageModals(): Promise<number> {
  try {
    const supabase = createClientClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return 0;
    }

    // Find all localStorage keys matching the pattern
    const modalKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("plan-modal-shown-")) {
        modalKeys.push(key);
      }
    }

    if (modalKeys.length === 0) {
      return 0;
    }

    // Extract step IDs and generate modal IDs
    const modalIds: ModalId[] = modalKeys
      .filter((key) => localStorage.getItem(key) === "true")
      .map((key) => {
        const stepId = key.replace("plan-modal-shown-", "");
        return generateModalId("plan", stepId);
      });

    if (modalIds.length === 0) {
      return 0;
    }

    // Get current shown modals from database
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("shown_modals")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      return 0;
    }

    const currentModals = (userData?.shown_modals as ModalId[]) ?? [];

    // Merge with existing modals (avoiding duplicates)
    const newModals = modalIds.filter((id) => !currentModals.includes(id));

    if (newModals.length > 0) {
      const updatedModals = [...currentModals, ...newModals];

      const { error: updateError } = await supabase
        .from("users")
        .update({ shown_modals: updatedModals as unknown as Json })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating shown modals:", updateError);
        return 0;
      }

      // Clear cache after update
      clearModalCache(user.id);
    }

    // Clear localStorage entries after successful migration
    modalKeys.forEach((key) => localStorage.removeItem(key));

    return newModals.length;
  } catch (error) {
    console.error("Unexpected error in migrateLocalStorageModals:", error);
    return 0;
  }
}
