"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useRoadmapStore } from "@/lib/stores/roadmap-store";
import { logReminderCleanup } from "@/lib/notifications/reminder-cleanup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  RoadmapStep,
  KnowledgeContent,
  Roadmap,
  ApplicationLogInsert,
} from "@/lib/supabase/types";

interface ReflectScreenProps {
  step: RoadmapStep;
  knowledgeContent: KnowledgeContent;
  roadmap: Roadmap;
}

const ReflectScreen = React.forwardRef<HTMLDivElement, ReflectScreenProps>(
  ({ step, knowledgeContent: _knowledgeContent, roadmap: _roadmap }, ref) => {
    const router = useRouter();
    const { activeRoadmap, fetchActiveRoadmap } = useRoadmapStore();
    const [reflectionText, setReflectionText] = useState("");
    const [learningText, setLearningText] = useState("");
    const [rating, setRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const reflectionTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const learningTextAreaRef = useRef<HTMLTextAreaElement>(null);

    // Ensure roadmap is loaded for store consistency, but handle gracefully if not available
    useEffect(() => {
      const ensureRoadmapLoaded = async () => {
        if (!activeRoadmap) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await fetchActiveRoadmap(user.id);
          }
        }
      };
      ensureRoadmapLoaded();
    }, [activeRoadmap, fetchActiveRoadmap]);

    // Auto-resize textareas
    useEffect(() => {
      const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
        }
      };

      resizeTextarea(reflectionTextAreaRef.current);
      resizeTextarea(learningTextAreaRef.current);
    }, [reflectionText, learningText]);

    const minTextLength = 50;
    const isValid = reflectionText.length >= minTextLength && rating > 0;

    const getRatingText = (score: number) => {
      const texts = {
        1: "Not helpful at all",
        2: "Slightly helpful",
        3: "Moderately helpful",
        4: "Very helpful",
        5: "Extremely helpful",
      };
      return texts[score as keyof typeof texts] || "";
    };

    const handleSubmit = async () => {
      if (!isValid) return;

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        console.log("[ReflectScreen] Starting reflection submission for step:", step.id);

        // Save reflection to application_logs
        const reflection: ApplicationLogInsert = {
          user_id: user.id,
          roadmap_step_id: step.id,
          situation_text: reflectionText,
          learning_text: learningText,
          effectiveness_rating: rating,
          created_at: new Date().toISOString(),
        };

        console.log("[ReflectScreen] Saving reflection to application_logs");
        const { error: insertError } = await supabase.from("application_logs").insert(reflection);

        if (insertError) {
          console.error("[ReflectScreen] Failed to save reflection:", insertError);
          throw new Error(`Failed to save your reflection: ${insertError.message}`);
        }

        console.log("[ReflectScreen] Reflection saved successfully, now marking step as completed");

        // Mark step as completed using RPC function for atomic operation
        console.log("[ReflectScreen] Starting step completion via RPC");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)(
          "complete_step_and_unlock_next",
          {
            p_step_id: step.id,
            p_roadmap_id: step.roadmap_id,
          }
        );

        if (rpcError) {
          console.error("[ReflectScreen] RPC function failed:", rpcError);
          throw new Error(`Failed to complete step: ${rpcError.message}`);
        }

        console.log("[ReflectScreen] RPC function succeeded:", rpcResult);

        // Refresh store state regardless of whether it was initially loaded
        try {
          await fetchActiveRoadmap(user.id, true); // Force refresh
        } catch (refreshError) {
          console.warn("[ReflectScreen] Could not refresh store state:", refreshError);
          // Continue - the user can refresh manually if needed
        }

        // Log reminder cleanup for completed plan
        try {
          await logReminderCleanup(step.id, user.id);
        } catch (cleanupError) {
          // Don't fail the whole flow if cleanup logging fails
          console.error("[ReflectScreen] Failed to log reminder cleanup:", cleanupError);
        }

        // Add a small delay to ensure database operations complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        console.log(
          "[ReflectScreen] All operations completed successfully, showing success dialog"
        );
        // Show success dialog instead of immediate navigation
        setShowSuccessDialog(true);
        setIsLoading(false);
      } catch (err) {
        console.error("[ReflectScreen] Submission failed:", err);
        setError(err instanceof Error ? err.message : "Failed to save reflection");
        setIsLoading(false);
      }
    };

    const handleBack = () => {
      router.push(`/learn/${step.id}?from=reflect`);
    };

    const handleSuccessDialogClose = () => {
      setShowSuccessDialog(false);
      router.push("/roadmap?success=true");
    };

    return (
      <div ref={ref} className="min-h-screen bg-[#FAFBFC]" data-testid="reflect-screen">
        {/* Header */}
        <header className="bg-white py-4 px-5 border-b border-gray-200 shadow-sm">
          <div className="container max-w-2xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-[#4299E1] hover:text-[#3182CE] hover:bg-[#F7FAFC] font-medium text-base flex items-center gap-2 p-2 -ml-2"
              data-testid="back-button"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              Back to Learn
            </Button>
            <span className="text-sm text-gray-500">Step {step.order + 1} • Reflect</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="container max-w-2xl mx-auto px-5 py-8" data-testid="reflect-content">
          {/* Reflection Container */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] animate-fade-in-up">
            <h1 className="text-[28px] font-bold text-[#1A202C] mb-2">Log Your Application</h1>
            <div className="h-[3px] bg-gradient-to-r from-[#48BB78] to-[#38A169] w-[60px] rounded-sm mb-6"></div>

            {/* Plan Reminder */}
            {step.plan_situation && step.plan_trigger && step.plan_action && (
              <div
                className="bg-gradient-to-br from-[#F0FFF4] to-[#E6FFFA] border-l-4 border-l-[#48BB78] p-5 mb-8 rounded-lg relative overflow-hidden animate-slide-in-left"
                data-testid="plan-reminder"
              >
                <div className="absolute top-5 right-5 text-2xl opacity-30">🎯 </div>
                <div className="text-sm font-semibold text-[#22543D] uppercase tracking-wider mb-2">
                  Your Plan:{" "}
                </div>
                <p className="text-base text-[#2F855A] italic leading-relaxed relative z-10">
                  IF: {step.plan_situation} {step.plan_trigger} → THEN: {step.plan_action}
                </p>
              </div>
            )}

            <p className="text-xl text-[#2D3748] font-medium mb-6">
              How did your plan to &quot;{step.plan_action}&quot; go?
            </p>

            {/* Form Content */}
            <div className="space-y-8">
              {/* Situation Text Area */}
              <div className="space-y-2">
                <Label htmlFor="reflection" className="text-base font-semibold text-[#2D3748]">
                  Describe what happened
                </Label>
                <Textarea
                  ref={reflectionTextAreaRef}
                  id="reflection"
                  data-testid="reflection-text"
                  placeholder="Share your experience applying this concept. What worked? What didn't? What did you learn?"
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="min-h-[140px] overflow-hidden transition-all duration-300 border-2 border-gray-200 rounded-[10px] px-4 py-4 text-base leading-relaxed bg-[#FAFBFC] focus:bg-white focus:border-[#48BB78] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(72,187,120,0.1)] placeholder:italic placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <div
                  className={cn(
                    "text-sm text-right transition-colors duration-200",
                    reflectionText.length >= minTextLength ? "text-[#48BB78]" : "text-gray-500"
                  )}
                >
                  {reflectionText.length >= minTextLength
                    ? `${reflectionText.length} characters`
                    : `${reflectionText.length} / ${minTextLength} minimum`}
                </div>
              </div>

              {/* Learning Text Area - Enhanced Section */}
              <div className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 space-y-3 transition-all duration-300 hover:bg-[#F3F7FB]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <Label htmlFor="learning" className="text-base font-semibold text-[#2D3748]">
                    What did you learn?
                  </Label>
                </div>
                <Textarea
                  ref={learningTextAreaRef}
                  id="learning"
                  data-testid="learning-text"
                  placeholder="What insights did you gain? How will you apply this differently next time? (This helps solidify your learning!)"
                  value={learningText}
                  onChange={(e) => setLearningText(e.target.value)}
                  className="min-h-[120px] overflow-hidden transition-all duration-300 border-2 border-gray-200 rounded-[10px] px-4 py-4 text-base leading-relaxed bg-white focus:border-[#48BB78] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(72,187,120,0.1)] placeholder:italic placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <div className="text-sm text-gray-500 italic">
                  Optional but encouraged - deeper reflection leads to better learning
                </div>
              </div>

              {/* Star Rating */}
              <div className="text-center py-4">
                <Label className="text-lg font-semibold text-[#2D3748] block mb-5">
                  How effective was this model for you?
                </Label>
                <div
                  className="flex items-center justify-center gap-3 mb-3"
                  data-testid="star-rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-0 hover:bg-transparent transition-all duration-200",
                        rating >= star || hoveredStar >= star ? "text-[#FFD700]" : "text-gray-300"
                      )}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      disabled={isLoading}
                      data-testid={`star-${star}`}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={cn(
                          "transition-all duration-200",
                          rating >= star || hoveredStar >= star
                            ? "fill-current drop-shadow-[0_2px_4px_rgba(255,215,0,0.4)] scale-110"
                            : "hover:scale-110"
                        )}
                        style={{ width: "36px", height: "36px" }}
                      />
                    </Button>
                  ))}
                </div>
                <div className="h-5">
                  {(hoveredStar || rating) > 0 && (
                    <p className="text-sm text-gray-500 animate-fade-in">
                      {getRatingText(hoveredStar || rating)}
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 text-sm text-red-700 bg-[#FEF2F2] rounded-lg border border-red-200 animate-fade-in">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <span className="text-lg">⚠️</span>
                    <span>Error</span>
                  </div>
                  <div className="ml-7">{error}</div>
                  {error.includes("refresh") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="mt-3 ml-7 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Refresh Page
                    </Button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="w-full bg-gradient-to-r from-[#48BB78] to-[#38A169] hover:from-[#38A169] hover:to-[#2F855A] text-white font-semibold text-lg py-7 rounded-[10px] shadow-[0_4px_12px_rgba(72,187,120,0.25)] hover:shadow-[0_6px_20px_rgba(72,187,120,0.35)] transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
                size="lg"
                data-testid="submit-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </span>
                ) : (
                  "Complete & Unlock Next Step"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent
            className="sm:max-w-md text-center bg-white rounded-2xl p-12"
            showCloseButton={false}
          >
            <DialogHeader>
              <div className="mx-auto mb-6 text-7xl animate-bounce">🎉</div>
              <DialogTitle className="text-2xl font-bold text-[#1A202C] mb-3">
                Excellent Work!
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 leading-relaxed">
                You&apos;ve successfully completed this step. The next mental model in your roadmap
                is now unlocked!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8">
              <Button
                onClick={handleSuccessDialogClose}
                className="w-full sm:w-auto mx-auto bg-[#48BB78] hover:bg-[#38A169] text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200"
                size="lg"
              >
                Continue to Roadmap
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

ReflectScreen.displayName = "ReflectScreen";

export default ReflectScreen;
