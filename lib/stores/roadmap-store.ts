import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type {
  Roadmap as DBRoadmap,
  RoadmapStep as DBRoadmapStep,
  KnowledgeContent,
} from "@/lib/supabase/types";

interface Roadmap extends DBRoadmap {
  steps: RoadmapStep[];
}

interface RoadmapStep extends DBRoadmapStep {
  knowledge_content: KnowledgeContent;
}

interface CacheMetadata {
  lastFetched: number | null;
  ttl: number; // Time to live in milliseconds
  userId: string | null;
}

interface RoadmapViewState {
  activeRoadmap: Roadmap | null;
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  // Learn screen specific state
  currentStep: RoadmapStep | null;
  knowledgeContent: KnowledgeContent | null;
  // Cache metadata
  cacheMetadata: CacheMetadata;
  fetchActiveRoadmap: (userId: string, forceRefresh?: boolean) => Promise<void>;
  setCurrentStep: (index: number) => void;
  setCurrentStepForLearn: (step: RoadmapStep, content: KnowledgeContent) => void;
  markStepCompleted: (stepId: string) => Promise<void>;
  resetState: () => void;
  invalidateCache: () => void;
  isCacheValid: (userId: string) => boolean;
}

// Default cache TTL: 5 minutes
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export const useRoadmapStore = create<RoadmapViewState>((set, get) => ({
  activeRoadmap: null,
  currentStepIndex: 0,
  isLoading: false,
  error: null,
  // Learn screen specific state
  currentStep: null,
  knowledgeContent: null,
  // Cache metadata
  cacheMetadata: {
    lastFetched: null,
    ttl: DEFAULT_CACHE_TTL,
    userId: null,
  },

  isCacheValid: (userId: string) => {
    const { cacheMetadata, activeRoadmap } = get();

    // No cache or different user
    if (!cacheMetadata.lastFetched || cacheMetadata.userId !== userId || !activeRoadmap) {
      return false;
    }

    // Check if cache has expired
    const now = Date.now();
    return now - cacheMetadata.lastFetched < cacheMetadata.ttl;
  },

  invalidateCache: () => {
    set((state) => ({
      cacheMetadata: {
        ...state.cacheMetadata,
        lastFetched: null,
        userId: null,
      },
    }));
  },

  fetchActiveRoadmap: async (userId: string, forceRefresh = false) => {
    const { isCacheValid, activeRoadmap } = get();

    // Clear completed roadmap from persisted state if it exists
    if (activeRoadmap && activeRoadmap.status === "completed") {
      console.log("[fetchActiveRoadmap] Clearing completed roadmap from persisted state");
      set({
        activeRoadmap: null,
        currentStepIndex: 0,
        currentStep: null,
        knowledgeContent: null,
        cacheMetadata: {
          lastFetched: null,
          ttl: DEFAULT_CACHE_TTL,
          userId: null,
        },
      });
    }

    // Use cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid(userId)) {
      console.log("[fetchActiveRoadmap] Using cached data");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const { data: roadmap, error } = await supabase
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

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      if (roadmap) {
        // Sort steps by order
        roadmap.steps.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        // Find the current step index (first non-completed step)
        const currentIndex = roadmap.steps.findIndex(
          (step: { status: string }) => step.status !== "completed"
        );

        set((state) => ({
          activeRoadmap: roadmap,
          currentStepIndex: currentIndex === -1 ? roadmap.steps.length - 1 : currentIndex,
          isLoading: false,
          cacheMetadata: {
            lastFetched: Date.now(),
            ttl: state.cacheMetadata.ttl, // Preserve existing TTL
            userId,
          },
        }));
      } else {
        set({ activeRoadmap: null, isLoading: false });
      }
    } catch {
      set({ error: "Failed to fetch roadmap", isLoading: false });
    }
  },

  setCurrentStep: (index: number) => {
    const { activeRoadmap } = get();
    if (activeRoadmap && index >= 0 && index < activeRoadmap.steps.length) {
      set({ currentStepIndex: index });
    }
  },

  setCurrentStepForLearn: (step: RoadmapStep, content: KnowledgeContent) => {
    set({
      currentStep: step,
      knowledgeContent: content,
    });
  },

  markStepCompleted: async (stepId: string) => {
    const { activeRoadmap } = get();
    if (!activeRoadmap) {
      const error = "No active roadmap found";
      console.error("[markStepCompleted]", error);
      set({ error, isLoading: false });
      throw new Error(error);
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      console.log("[markStepCompleted] Starting update for stepId:", stepId);

      // Use the atomic RPC function to complete step and unlock next
      console.log("[markStepCompleted] Calling RPC function complete_step_and_unlock_next");

      // Define the expected response type
      interface StepCompletionResult {
        completed_step_id: string;
        unlocked_step_id: string | null;
        all_steps_completed: boolean;
        roadmap_completed: boolean;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = (await (supabase.rpc as any)("complete_step_and_unlock_next", {
        p_step_id: stepId,
        p_roadmap_id: activeRoadmap.id,
      })) as { data: StepCompletionResult | null; error: Error | null };

      if (error || !data) {
        const errorMessage = `Failed to update step: ${error?.message || "Unknown error"}`;
        console.error("[markStepCompleted] RPC function failed:", error);
        set({ error: errorMessage, isLoading: false });
        throw new Error(errorMessage);
      }

      console.log("[markStepCompleted] RPC function returned:", data);

      // Get current step index
      const completedStepIndex = activeRoadmap.steps.findIndex((s) => s.id === stepId);
      console.log("[markStepCompleted] Completed step index:", completedStepIndex);

      // Build updated steps array
      const updatedSteps = [...activeRoadmap.steps];
      updatedSteps[completedStepIndex] = {
        ...updatedSteps[completedStepIndex],
        status: "completed" as const,
      };

      // If a next step was unlocked, update it in local state
      if (data.unlocked_step_id && completedStepIndex < updatedSteps.length - 1) {
        const nextStepIndex = updatedSteps.findIndex((step) => step.id === data.unlocked_step_id);
        if (nextStepIndex !== -1) {
          console.log("[markStepCompleted] Next step unlocked:", data.unlocked_step_id);
          updatedSteps[nextStepIndex] = {
            ...updatedSteps[nextStepIndex],
            status: "unlocked" as const,
          };
        }
      } else {
        console.log("[markStepCompleted] No next step to unlock (this was the last step)");
      }

      // Update roadmap status based on RPC result
      const roadmapStatus = data.roadmap_completed ? "completed" : "active";
      console.log(
        "[markStepCompleted] All steps completed:",
        data.all_steps_completed,
        "Roadmap status:",
        roadmapStatus
      );

      // If roadmap is completed, clear the persisted state
      if (data.roadmap_completed) {
        console.log("[markStepCompleted] Roadmap completed - clearing persisted state");
        set({
          activeRoadmap: null,
          currentStepIndex: 0,
          isLoading: false,
          error: null,
          currentStep: null,
          knowledgeContent: null,
          cacheMetadata: {
            lastFetched: null,
            ttl: DEFAULT_CACHE_TTL,
            userId: null,
          },
        });
      } else {
        // Only update local state after all database operations succeed
        set((state) => ({
          activeRoadmap: {
            ...activeRoadmap,
            steps: updatedSteps,
            status: roadmapStatus as "active" | "completed",
          },
          currentStepIndex: completedStepIndex + 1,
          isLoading: false,
          // Update cache timestamp since we modified data
          cacheMetadata: {
            ...state.cacheMetadata,
            lastFetched: Date.now(),
          },
        }));
      }

      console.log("[markStepCompleted] Operation completed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update step";
      console.error("[markStepCompleted] Fatal error:", error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetState: () => {
    set({
      activeRoadmap: null,
      currentStepIndex: 0,
      isLoading: false,
      error: null,
      currentStep: null,
      knowledgeContent: null,
      cacheMetadata: {
        lastFetched: null,
        ttl: DEFAULT_CACHE_TTL,
        userId: null,
      },
    });
  },
}));
