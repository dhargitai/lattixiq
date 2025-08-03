import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface RoadmapViewState {
  activeRoadmap: Roadmap | null;
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  // Learn screen specific state
  currentStep: RoadmapStep | null;
  knowledgeContent: KnowledgeContent | null;
  fetchActiveRoadmap: (userId: string) => Promise<void>;
  setCurrentStep: (index: number) => void;
  setCurrentStepForLearn: (step: RoadmapStep, content: KnowledgeContent) => void;
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
      // Learn screen specific state
      currentStep: null,
      knowledgeContent: null,

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
            // Sort steps by order
            roadmap.steps.sort((a, b) => a.order - b.order);
            // Find the current step index (first non-completed step)
            const currentIndex = roadmap.steps.findIndex((step) => step.status !== "completed");

            set({
              activeRoadmap: roadmap,
              currentStepIndex: currentIndex === -1 ? roadmap.steps.length - 1 : currentIndex,
              isLoading: false,
            });
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
        } catch {
          set({ error: "Failed to update step", isLoading: false });
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
        });
      },
    }),
    {
      name: "roadmap-storage",
      partialize: (state) => ({
        activeRoadmap: state.activeRoadmap,
        currentStepIndex: state.currentStepIndex,
        currentStep: state.currentStep,
        knowledgeContent: state.knowledgeContent,
      }),
    }
  )
);
