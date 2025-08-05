"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ({ step, knowledgeContent, roadmap: _roadmap }, ref) => {
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
          learning_text: learningText || reflectionText, // Use separate learning text if provided
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
      <div ref={ref} className="container max-w-2xl mx-auto px-4 py-6" data-testid="reflect-screen">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learn
          </Button>

          <div className="text-sm text-muted-foreground mb-2">Step {step.order + 1} • Reflect</div>
          <h1 className="text-2xl font-bold">Log Your Application</h1>
        </div>

        {/* Plan Reminder */}
        {step.plan_situation && step.plan_trigger && step.plan_action && (
          <Card
            className="mb-6 border-l-4 border-l-green-500 bg-green-50"
            data-testid="plan-reminder"
          >
            <CardHeader>
              <CardTitle className="text-base text-green-800">🎯 Your Plan:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 italic">
                IF: {step.plan_situation} {step.plan_trigger} → THEN: {step.plan_action}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reflection Form */}
        <Card>
          <CardHeader>
            <CardTitle>{knowledgeContent.title}</CardTitle>
            <CardDescription>
              How did your plan to &quot;{step.plan_action}&quot; go?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Situation Text Area */}
            <div className="space-y-2">
              <Label htmlFor="reflection">Describe what happened</Label>
              <Textarea
                ref={reflectionTextAreaRef}
                id="reflection"
                data-testid="reflection-text"
                placeholder="What happened when you tried to apply this concept?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-[120px] overflow-hidden transition-all"
                disabled={isLoading}
              />
              <div className="text-sm text-muted-foreground text-right">
                {reflectionText.length}/{minTextLength} characters (minimum)
              </div>
            </div>

            {/* Learning Text Area */}
            <div className="space-y-2">
              <Label htmlFor="learning">What did you learn?</Label>
              <Textarea
                ref={learningTextAreaRef}
                id="learning"
                data-testid="learning-text"
                placeholder="What insights did you gain? How will you apply this differently next time?"
                value={learningText}
                onChange={(e) => setLearningText(e.target.value)}
                className="min-h-[100px] overflow-hidden transition-all"
                disabled={isLoading}
              />
              <div className="text-sm text-muted-foreground text-right">
                <span className="italic">Optional but encouraged</span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <Label>How effective was this model for you?</Label>
              <div
                className="flex items-center justify-center space-x-2 py-2"
                data-testid="star-rating"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-1 hover:bg-transparent transition-all",
                      rating >= star || hoveredStar >= star ? "text-yellow-500" : "text-gray-300"
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
                        "h-8 w-8 transition-all",
                        rating >= star || hoveredStar >= star ? "fill-current" : ""
                      )}
                    />
                  </Button>
                ))}
              </div>
              {(hoveredStar || rating) > 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  {getRatingText(hoveredStar || rating)}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                <div className="font-medium mb-1">⚠️ Error</div>
                <div>{error}</div>
                {error.includes("refresh") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
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
              className="w-full"
              size="lg"
              data-testid="submit-button"
            >
              {isLoading ? "Saving..." : "Complete & Unlock Next Step"}
            </Button>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md text-center" showCloseButton={false}>
            <DialogHeader>
              <div className="mx-auto mb-4 text-6xl animate-bounce">🎉</div>
              <DialogTitle className="text-2xl">Excellent Work!</DialogTitle>
              <DialogDescription className="text-base mt-2">
                You&apos;ve successfully completed this step. The next mental model in your roadmap
                is now unlocked!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                onClick={handleSuccessDialogClose}
                className="w-full sm:w-auto mx-auto"
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
