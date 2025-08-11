"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { StandardCTAButton } from "@/components/ui/StandardCTAButton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useDynamicFocusState } from "@/lib/hooks/useDynamicFocusState";
import { ReminderSettings } from "@/components/shared/ReminderSettings";
import { ApplicationGuidanceModal } from "@/components/modals/ApplicationGuidanceModal";
import {
  hasShownModalClient,
  addShownModalClient,
  generateModalId,
  migrateLocalStorageModals,
} from "@/lib/db/user-preferences";
import type {
  RoadmapStep,
  KnowledgeContent,
  GoalExample,
  RoadmapStepUpdate,
} from "@/lib/supabase/types";

export interface PlanScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  step: RoadmapStep;
  knowledgeContent: KnowledgeContent;
  goalExamples: GoalExample[];
}

export const PlanScreen = React.forwardRef<HTMLDivElement, PlanScreenProps>(
  ({ step, knowledgeContent, goalExamples, className, ...props }, ref) => {
    const router = useRouter();
    const { user, updateReminderSettings } = useUserSettings();
    const [showExample, setShowExample] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [checkingModalStatus, setCheckingModalStatus] = useState(false);
    const [formData, setFormData] = useState({
      situation: "",
      action: "",
    });

    // Dynamic focus state hooks for both textareas
    const situationFocusState = useDynamicFocusState({ threshold: 30 });
    const actionFocusState = useDynamicFocusState({ threshold: 30 });

    // Initialize reminder settings from global user settings and migrate localStorage modals
    useEffect(() => {
      if (user) {
        setReminderEnabled(user.reminder_enabled || false);
        setReminderTime(user.reminder_time || "09:00:00");

        // Migrate any existing localStorage modal data (runs once per user session)
        migrateLocalStorageModals().then((migratedCount) => {
          if (migratedCount > 0) {
            console.log(`Migrated ${migratedCount} modal states from localStorage to database`);
          }
        });
      }
    }, [user]);

    const contentType = knowledgeContent.type;
    const isMentalModel = contentType === "mental-model";
    const goalExample = goalExamples.length > 0 ? goalExamples[0] : null;

    // Generate dynamic guidance based on content type
    const getDynamicGuidance = () => {
      if (isMentalModel) {
        return `Your 'IF' should be the moment you usually hesitate. Your 'THEN' should be an action so small it feels easy.`;
      } else {
        return `Your 'IF' should be the situation where this ${contentType} might occur. Your 'THEN' should be how you'll respond when you notice it.`;
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Validate all fields are filled
      if (!formData.situation || !formData.action) {
        setError("All fields are required");
        return;
      }

      setIsLoading(true);
      setCheckingModalStatus(true);

      try {
        const supabase = createClient();
        const updates: RoadmapStepUpdate = {
          plan_trigger: formData.situation,
          plan_action: formData.action,
          plan_created_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("roadmap_steps")
          .update(updates)
          .eq("id", step.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update global reminder settings if changed
        if (
          user &&
          (reminderEnabled !== user.reminder_enabled || reminderTime !== user.reminder_time)
        ) {
          await updateReminderSettings({
            reminder_enabled: reminderEnabled,
            reminder_time: reminderTime,
          });
        }

        // Generate modal ID for this step
        const modalId = generateModalId("plan", step.id);

        // Check if modal has been shown before using database
        const hasShownModal = await hasShownModalClient(modalId);

        if (!hasShownModal) {
          // Add modal to shown list in database (optimistic update)
          try {
            await addShownModalClient(modalId);
          } catch (modalError) {
            // Log error but don't block the flow
            console.error("Failed to update modal shown status:", modalError);
          }

          // Show the application guidance modal
          setShowApplicationModal(true);
        } else {
          // Navigate directly to roadmap
          router.push("/roadmap");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save plan");
      } finally {
        setIsLoading(false);
        setCheckingModalStatus(false);
      }
    };

    const handleBack = () => {
      router.push(`/learn/${step.id}`);
    };

    const handleModalClose = () => {
      setShowApplicationModal(false);
      router.push("/roadmap");
    };

    const getFormLabels = () => {
      if (isMentalModel) {
        return {
          situationLabel: "IF:",
          situationPlaceholder: "It's 9 AM and I need to start my report...",
          actionLabel: "THEN I WILL:",
          actionPlaceholder: "Open the doc and write for just 5 minutes.",
        };
      } else {
        return {
          situationLabel: "IF:",
          situationPlaceholder: "I'm about to make a big decision...",
          actionLabel: "THEN I WILL:",
          actionPlaceholder: "List three ways this could go wrong first.",
        };
      }
    };

    const labels = getFormLabels();

    return (
      <div
        ref={ref}
        className={cn("min-h-screen bg-gray-50/50 flex flex-col", className)}
        {...props}
      >
        <AppHeader
          screenName="Plan"
          helpContentId="plan-screen-help"
          backLink={{
            text: "Back to Learn",
            onClick: handleBack,
          }}
        />

        {/* Main content with prototype styling */}
        <main className="flex-1 px-5 py-8 pb-24 md:px-8 md:py-12">
          <div className="mx-auto max-w-xl">
            {/* Content card with enhanced styling */}
            <Card className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <CardContent className="p-0 space-y-6">
                {/* Title section */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                    Create Your Plan
                  </h1>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6" />
                  <p className="text-lg text-gray-600">
                    Use &quot;{knowledgeContent.title}&quot; to plan your first step.
                  </p>
                </div>

                {/* Dynamic guidance box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 relative animate-in slide-in-from-left-3 duration-500">
                  <Lightbulb className="absolute top-5 right-5 h-6 w-6 text-blue-300/50" />
                  <p className="text-base text-blue-700 font-medium pr-10">
                    {getDynamicGuidance()}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-7" role="form">
                  {/* IF Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="situation"
                      className="text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {labels.situationLabel}
                    </Label>
                    <Textarea
                      id="situation"
                      name="situation"
                      placeholder={labels.situationPlaceholder}
                      value={formData.situation}
                      onChange={(e) => {
                        setFormData({ ...formData, situation: e.target.value });
                        situationFocusState.updateCharacterCount(e.target.value);
                      }}
                      className={cn(
                        "min-h-[100px] bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-base",
                        "transition-all duration-300 ease-in-out focus:bg-white focus:ring-4",
                        situationFocusState.focusColorClasses,
                        "placeholder:italic placeholder:text-gray-400"
                      )}
                      aria-label={labels.situationLabel}
                      required
                      maxLength={250}
                    />
                    <div
                      className={cn(
                        "text-sm text-right transition-colors duration-200",
                        situationFocusState.isAboveThreshold ? "text-green-600" : "text-gray-500"
                      )}
                    >
                      {situationFocusState.displayText}
                    </div>
                  </div>

                  {/* THEN I WILL Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="action"
                      className="text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {labels.actionLabel}
                    </Label>
                    <Textarea
                      id="action"
                      name="action"
                      placeholder={labels.actionPlaceholder}
                      value={formData.action}
                      onChange={(e) => {
                        setFormData({ ...formData, action: e.target.value });
                        actionFocusState.updateCharacterCount(e.target.value);
                      }}
                      className={cn(
                        "min-h-[100px] bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-base",
                        "transition-all duration-300 ease-in-out focus:bg-white focus:ring-4",
                        actionFocusState.focusColorClasses,
                        "placeholder:italic placeholder:text-gray-400"
                      )}
                      aria-label={labels.actionLabel}
                      required
                      maxLength={250}
                    />
                    <div
                      className={cn(
                        "text-sm text-right transition-colors duration-200",
                        actionFocusState.isAboveThreshold ? "text-green-600" : "text-gray-500"
                      )}
                    >
                      {actionFocusState.displayText}
                    </div>
                  </div>

                  {/* Reminder Section */}
                  <ReminderSettings
                    enabled={reminderEnabled}
                    time={reminderTime}
                    onEnabledChange={setReminderEnabled}
                    onTimeChange={setReminderTime}
                  />

                  {/* Error Message */}
                  {error && (
                    <div
                      className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-center pt-2">
                    <StandardCTAButton
                      type="submit"
                      loading={isLoading}
                      variant="primary"
                      size="md"
                      icon={!isLoading ? <ArrowRight className="h-5 w-5" /> : undefined}
                    >
                      {isLoading
                        ? checkingModalStatus
                          ? "Checking..."
                          : "Saving..."
                        : "Save Plan & Take Action"}
                    </StandardCTAButton>
                  </div>
                </form>

                {/* Goal Example - Expandable */}
                {goalExample && (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setShowExample(!showExample)}
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200"
                      aria-expanded={showExample}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          📝 See example for: {goalExample.goal}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-gray-400 transition-transform duration-200",
                            showExample && "rotate-180"
                          )}
                        />
                      </div>
                    </button>
                    {showExample && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 italic">
                          {isMentalModel
                            ? goalExample.if_then_example
                            : goalExample.spotting_mission_example}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Application Guidance Modal */}
        <ApplicationGuidanceModal
          isOpen={showApplicationModal}
          onClose={handleModalClose}
          conceptType={knowledgeContent.type as "mental-model" | "cognitive-bias" | "fallacy"}
          conceptName={knowledgeContent.title}
        />
      </div>
    );
  }
);

PlanScreen.displayName = "PlanScreen";
