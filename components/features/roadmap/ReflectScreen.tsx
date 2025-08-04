"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useRoadmapStore } from "@/lib/stores/roadmap-store";
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
    const { markStepCompleted, activeRoadmap, fetchActiveRoadmap } = useRoadmapStore();
    const [reflectionText, setReflectionText] = useState("");
    const [rating, setRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredStar, setHoveredStar] = useState(0);

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
          learning_text: reflectionText, // Combined for V1
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

        // Mark step as completed - handle case when activeRoadmap is not loaded
        try {
          await markStepCompleted(step.id);
          console.log("[ReflectScreen] Step marked as completed successfully");
        } catch (stepError) {
          // If the error is "No active roadmap found", we can handle it gracefully
          if (stepError instanceof Error && stepError.message === "No active roadmap found") {
            console.warn(
              "[ReflectScreen] Attempting alternative approach since roadmap store is empty"
            );
            // Since we have the step data and roadmap from props, we can update directly
            const supabase = createClient();

            // Update step status directly
            const { error: stepUpdateError } = await supabase
              .from("roadmap_steps")
              .update({ status: "completed" })
              .eq("id", step.id);

            if (stepUpdateError) {
              console.error("[ReflectScreen] Direct step update failed:", stepUpdateError);
              throw new Error(
                `Your reflection was saved, but there was an issue updating your progress: ${stepUpdateError.message}`
              );
            }

            // Check if we need to unlock next step
            const { data: nextStep } = await supabase
              .from("roadmap_steps")
              .select("id, status, order")
              .eq("roadmap_id", step.roadmap_id)
              .gt("order", step.order)
              .order("order", { ascending: true })
              .limit(1)
              .single();

            if (nextStep && nextStep.status === "locked") {
              await supabase
                .from("roadmap_steps")
                .update({ status: "unlocked" })
                .eq("id", nextStep.id);
            }

            console.log("[ReflectScreen] Successfully updated step using direct approach");
          } else {
            console.error("[ReflectScreen] Failed to mark step as completed:", stepError);
            throw new Error(
              stepError instanceof Error
                ? `Your reflection was saved, but there was an issue updating your progress: ${stepError.message}`
                : "Your reflection was saved, but there was an issue updating your progress. Please try refreshing the page."
            );
          }
        }

        // Add a small delay to ensure database operations complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[ReflectScreen] All operations completed successfully, navigating to roadmap");
        // Navigate back to roadmap with success indicator
        router.push("/roadmap?success=true");
      } catch (err) {
        console.error("[ReflectScreen] Submission failed:", err);
        setError(err instanceof Error ? err.message : "Failed to save reflection");
        setIsLoading(false);
      }
    };

    const handleBack = () => {
      router.push(`/learn/${step.id}?from=reflect`);
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
            {/* Text Area */}
            <div className="space-y-2">
              <Label htmlFor="reflection">Describe what happened</Label>
              <Textarea
                id="reflection"
                data-testid="reflection-text"
                placeholder="What happened when you tried to apply this concept? What did you learn?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
              <div className="text-sm text-muted-foreground text-right">
                {reflectionText.length}/{minTextLength} characters (minimum)
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
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

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
      </div>
    );
  }
);

ReflectScreen.displayName = "ReflectScreen";

export default ReflectScreen;
