"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
    const [showExample, setShowExample] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
      situation: "",
      trigger: "",
      action: "",
    });

    const contentType = knowledgeContent.type;
    const isMentalModel = contentType === "mental-model";
    const goalExample = goalExamples.length > 0 ? goalExamples[0] : null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Validate all fields are filled
      if (!formData.situation || !formData.trigger || !formData.action) {
        setError("All fields are required");
        return;
      }

      setIsLoading(true);

      try {
        const supabase = createClient();
        const updates: RoadmapStepUpdate = {
          plan_situation: formData.situation,
          plan_trigger: formData.trigger,
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

        // Navigate back to roadmap
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save plan");
      } finally {
        setIsLoading(false);
      }
    };

    const handleBack = () => {
      router.push(`/learn/${step.id}`);
    };

    const getFormLabels = () => {
      if (isMentalModel) {
        return {
          situation: "When will you apply this?",
          situationPlaceholder: "Describe a specific situation where you'll apply this model",
          trigger: "What specific cue will remind you?",
          triggerPlaceholder: "What will remind you to use it?",
          action: "What exactly will you do?",
          actionPlaceholder: "What actions will you take?",
        };
      } else {
        return {
          situation: "Where might you encounter this bias?",
          situationPlaceholder: "Describe situations where this bias might appear",
          trigger: "What signs will you look for?",
          triggerPlaceholder: "What specific signs or patterns will you watch for?",
          action: "How will you respond when you spot it?",
          actionPlaceholder: "What will you do when you notice this bias?",
        };
      }
    };

    const labels = getFormLabels();

    return (
      <div ref={ref} className={cn("max-w-2xl mx-auto px-4 py-8", className)} {...props}>
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Create Your Implementation Plan</h1>

        {/* Goal Example Card */}
        {goalExample && (
          <Card className="mb-6">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowExample(!showExample)}
              role="button"
              aria-expanded={showExample}
              aria-controls="example-content"
            >
              <CardTitle className="text-base flex items-center justify-between">
                <span>📝 Example: {goalExample.goal}</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", showExample && "rotate-180")}
                  aria-hidden="true"
                />
              </CardTitle>
            </CardHeader>
            {showExample && (
              <CardContent id="example-content">
                <p className="text-sm text-muted-foreground italic">
                  {isMentalModel
                    ? goalExample.if_then_example
                    : goalExample.spotting_mission_example}
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Plan Form */}
        <form onSubmit={handleSubmit} className="space-y-6" role="form">
          <Card>
            <CardHeader>
              <CardTitle>{knowledgeContent.title}</CardTitle>
              <CardDescription>
                {isMentalModel
                  ? "Create an implementation intention to apply this mental model"
                  : "Create a spotting mission to identify this bias or fallacy"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Situation Field */}
              <div className="space-y-2">
                <Label htmlFor="situation">{labels.situation}</Label>
                <Textarea
                  id="situation"
                  name="situation"
                  placeholder={labels.situationPlaceholder}
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  className="min-h-[100px]"
                  aria-label={labels.situation}
                  required
                />
              </div>

              {/* Trigger Field */}
              <div className="space-y-2">
                <Label htmlFor="trigger">{labels.trigger}</Label>
                <Input
                  id="trigger"
                  name="trigger"
                  placeholder={labels.triggerPlaceholder}
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  aria-label={labels.trigger}
                  required
                />
              </div>

              {/* Action Field */}
              <div className="space-y-2">
                <Label htmlFor="action">{labels.action}</Label>
                <Textarea
                  id="action"
                  name="action"
                  placeholder={labels.actionPlaceholder}
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="min-h-[100px]"
                  aria-label={labels.action}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Plan"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }
);

PlanScreen.displayName = "PlanScreen";
