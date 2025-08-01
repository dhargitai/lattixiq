import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

interface Roadmap {
  id: string;
  user_id: string;
  goal_description: string;
  status: "active" | "completed" | "inactive";
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

interface RoadmapStep {
  id: string;
  roadmap_id: string;
  knowledge_content_id: string;
  order_index: number;
  status: "unlocked" | "locked" | "completed";
  created_at: string;
  knowledge_content: {
    id: string;
    title: string;
    category: string;
    summary: string;
    details?: string;
    how_to_use?: string;
    examples?: string[];
    relationships?: string[];
  };
}

interface RoadmapViewState {
  activeRoadmap: Roadmap | null;
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  fetchActiveRoadmap: (userId: string) => Promise<void>;
  setCurrentStep: (index: number) => void;
  markStepCompleted: (stepId: string) => Promise<void>;
  resetState: () => void;
}

export const useRoadmapStore = create<RoadmapViewState>()(
  persist(
    (set, get) => ({
      activeRoadmap: null,
      currentStepIndex: 0,
      isLoading: false,
      error: null,

      fetchActiveRoadmap: async (userId: string) => {
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
            // Sort steps by order_index
            roadmap.steps.sort((a: any, b: any) => a.order_index - b.order_index);

            // Find the current step index (first non-completed step)
            const currentIndex = roadmap.steps.findIndex(
              (step: any) => step.status !== "completed"
            );

            set({
              activeRoadmap: roadmap,
              currentStepIndex: currentIndex === -1 ? roadmap.steps.length - 1 : currentIndex,
              isLoading: false,
            });
          } else {
            set({ activeRoadmap: null, isLoading: false });
          }
        } catch (error) {
          set({ error: "Failed to fetch roadmap", isLoading: false });
        }
      },

      setCurrentStep: (index: number) => {
        const { activeRoadmap } = get();
        if (activeRoadmap && index >= 0 && index < activeRoadmap.steps.length) {
          set({ currentStepIndex: index });
        }
      },

      markStepCompleted: async (stepId: string) => {
        const { activeRoadmap } = get();
        if (!activeRoadmap) return;

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // Update step status in database
          const { error: updateError } = await supabase
            .from("roadmap_steps")
            .update({ status: "completed" })
            .eq("id", stepId);

          if (updateError) {
            set({ error: updateError.message, isLoading: false });
            return;
          }

          // Update local state
          const updatedSteps = activeRoadmap.steps.map((step) => {
            if (step.id === stepId) {
              return { ...step, status: "completed" as const };
            }
            return step;
          });

          // Unlock next step if exists
          const completedStepIndex = updatedSteps.findIndex((s) => s.id === stepId);
          if (completedStepIndex < updatedSteps.length - 1) {
            const nextStep = updatedSteps[completedStepIndex + 1];
            if (nextStep.status === "locked") {
              // Update next step to available in database
              await supabase
                .from("roadmap_steps")
                .update({ status: "unlocked" })
                .eq("id", nextStep.id);

              // Update local state
              updatedSteps[completedStepIndex + 1] = {
                ...nextStep,
                status: "unlocked" as const,
              };
            }
          }

          // Check if all steps are completed
          const allCompleted = updatedSteps.every((step) => step.status === "completed");
          const roadmapStatus = allCompleted ? "completed" : "active";

          // Update roadmap status if needed
          if (allCompleted) {
            await supabase
              .from("roadmaps")
              .update({ status: "completed" })
              .eq("id", activeRoadmap.id);
          }

          set({
            activeRoadmap: {
              ...activeRoadmap,
              steps: updatedSteps,
              status: roadmapStatus as "active" | "completed",
            },
            currentStepIndex: completedStepIndex + 1,
            isLoading: false,
          });
        } catch (error) {
          set({ error: "Failed to update step", isLoading: false });
        }
      },

      resetState: () => {
        set({
          activeRoadmap: null,
          currentStepIndex: 0,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "roadmap-storage",
      partialize: (state) => ({
        activeRoadmap: state.activeRoadmap,
        currentStepIndex: state.currentStepIndex,
      }),
    }
  )
);
