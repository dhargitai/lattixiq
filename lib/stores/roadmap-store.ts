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

          // Start transaction-like behavior by updating step status first
          console.log("[markStepCompleted] Updating step status to 'completed'");
          const { error: updateError } = await supabase
            .from("roadmap_steps")
            .update({ status: "completed" })
            .eq("id", stepId);

          if (updateError) {
            const errorMessage = `Failed to mark step as completed: ${updateError.message}`;
            console.error("[markStepCompleted] Step update failed:", updateError);
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }

          console.log("[markStepCompleted] Step marked as completed successfully");

          // Get current step index
          const completedStepIndex = activeRoadmap.steps.findIndex((s) => s.id === stepId);
          console.log("[markStepCompleted] Completed step index:", completedStepIndex);

          // Build updated steps array
          let updatedSteps = [...activeRoadmap.steps];
          updatedSteps[completedStepIndex] = {
            ...updatedSteps[completedStepIndex],
            status: "completed" as const,
          };

          // Unlock next step if exists
          if (completedStepIndex !== -1 && completedStepIndex < updatedSteps.length - 1) {
            const nextStep = updatedSteps[completedStepIndex + 1];
            console.log("[markStepCompleted] Next step status:", nextStep.status);

            if (nextStep.status === "locked") {
              console.log("[markStepCompleted] Unlocking next step:", nextStep.id);

              // Update next step to unlocked in database
              const { error: unlockError } = await supabase
                .from("roadmap_steps")
                .update({ status: "unlocked" })
                .eq("id", nextStep.id);

              if (unlockError) {
                console.error("[markStepCompleted] Failed to unlock next step:", unlockError);
                set({
                  error: `Step completed but failed to unlock next step: ${unlockError.message}`,
                  isLoading: false,
                });
                throw new Error(`Failed to unlock next step: ${unlockError.message}`);
              }

              console.log("[markStepCompleted] Next step unlocked successfully");

              // Update local state only after successful database update
              updatedSteps[completedStepIndex + 1] = {
                ...nextStep,
                status: "unlocked" as const,
              };
            } else {
              console.log("[markStepCompleted] Next step is already unlocked or completed");
            }
          } else {
            console.log("[markStepCompleted] No next step to unlock (this was the last step)");
          }

          // Check if all steps are completed
          const allCompleted = updatedSteps.every((step) => step.status === "completed");
          const roadmapStatus = allCompleted ? "completed" : "active";
          console.log(
            "[markStepCompleted] All steps completed:",
            allCompleted,
            "Roadmap status:",
            roadmapStatus
          );

          // Update roadmap status if needed
          if (allCompleted) {
            console.log("[markStepCompleted] Updating roadmap status to completed");
            const { error: roadmapError } = await supabase
              .from("roadmaps")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", activeRoadmap.id);

            if (roadmapError) {
              console.error("[markStepCompleted] Failed to update roadmap status:", roadmapError);
              set({
                error: `Failed to update roadmap status: ${roadmapError.message}`,
                isLoading: false,
              });
              throw new Error(`Failed to update roadmap status: ${roadmapError.message}`);
            }
          }

          // Only update local state after all database operations succeed
          set({
            activeRoadmap: {
              ...activeRoadmap,
              steps: updatedSteps,
              status: roadmapStatus as "active" | "completed",
              ...(allCompleted && { completed_at: new Date().toISOString() }),
            },
            currentStepIndex: completedStepIndex + 1,
            isLoading: false,
          });

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
