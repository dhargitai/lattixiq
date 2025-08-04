"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ArrowLeft, Lightbulb, ArrowRight } from "lucide-react";
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
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [formData, setFormData] = useState({
      situation: "",
      action: "",
    });

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

      try {
        const supabase = createClient();
        const updates: RoadmapStepUpdate = {
          plan_situation: formData.situation,
          plan_trigger: formData.situation, // Using situation as trigger for IF-THEN pattern
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
        router.push("/roadmap");
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
        {/* Navigation header matching prototype */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-5 py-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-blue-500 hover:text-blue-600 hover:bg-gray-50 font-medium px-2 py-1.5 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learn
            </Button>
          </div>
        </header>

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
                      onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                      className="min-h-[100px] bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:italic placeholder:text-gray-400"
                      aria-label={labels.situationLabel}
                      required
                    />
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
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      className="min-h-[100px] bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:italic placeholder:text-gray-400"
                      aria-label={labels.actionLabel}
                      required
                    />
                  </div>

                  {/* Reminder Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      REMINDER
                    </h3>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 space-y-4">
                      {/* Reminder Toggle */}
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="reminder-toggle"
                          className="text-base font-medium text-gray-700 cursor-pointer"
                        >
                          Daily Reminder
                        </label>
                        <Switch
                          id="reminder-toggle"
                          checked={reminderEnabled}
                          onCheckedChange={setReminderEnabled}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>

                      {/* Time Selection */}
                      <div
                        className={cn(
                          "flex items-center gap-3 transition-all duration-200",
                          !reminderEnabled && "opacity-50"
                        )}
                      >
                        <label
                          htmlFor="reminder-time"
                          className="text-base font-medium text-gray-700"
                        >
                          Remind me at:
                        </label>
                        <select
                          id="reminder-time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          disabled={!reminderEnabled}
                          className="px-3 py-2 text-base border-2 border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed"
                        >
                          <option value="06:00">6:00 AM</option>
                          <option value="07:00">7:00 AM</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="20:00">8:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

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
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                        "text-white font-semibold text-lg px-10 py-6 rounded-xl",
                        "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
                        "transform transition-all duration-300 hover:-translate-y-0.5",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                        "inline-flex items-center gap-2"
                      )}
                    >
                      {isLoading ? "Saving..." : "Save Plan & Take Action"}
                      {!isLoading && <ArrowRight className="h-5 w-5" />}
                    </Button>
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

        {/* Progress indicator */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg shadow-gray-300/50 text-sm text-gray-500 font-medium z-10 transition-transform duration-300">
          Step <span className="text-blue-500 font-semibold">{step.order}</span> • Plan
        </div>
      </div>
    );
  }
);

PlanScreen.displayName = "PlanScreen";
