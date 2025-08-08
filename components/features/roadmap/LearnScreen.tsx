"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, KeyRound, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapStepWithContent, Roadmap } from "@/lib/supabase/types";

interface LearnScreenProps {
  step: RoadmapStepWithContent & { roadmap: Roadmap };
  onNavigateToPlan?: () => void;
  onNavigateBack?: () => void;
}

const LearnScreen = React.forwardRef<HTMLDivElement, LearnScreenProps>(
  ({ step, onNavigateToPlan }, ref) => {
    const router = useRouter();

    // Check if user came from reflect screen via URL params
    const [cameFromReflect, setCameFromReflect] = React.useState(false);
    React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      setCameFromReflect(params.get("from") === "reflect");
    }, []);

    // Check if plan exists
    const hasPlan = step.plan_situation && step.plan_trigger && step.plan_action;

    const handleNavigateToPlan = () => {
      if (onNavigateToPlan) {
        onNavigateToPlan();
      } else {
        // If came from reflect and plan exists, go back to reflect, otherwise go to plan
        if (cameFromReflect && hasPlan) {
          router.push(`/reflect/${step.id}`);
        } else {
          router.push(`/plan/${step.id}`);
        }
      }
    };

    const getTypeLabel = () => {
      switch (step.knowledge_content.type) {
        case "mental-model":
          return "Mental Model";
        case "cognitive-bias":
          return "Cognitive Bias";
        case "fallacy":
          return "Fallacy";
        default:
          return step.knowledge_content.type;
      }
    };

    return (
      <div
        ref={ref}
        className="min-h-screen bg-gray-50/50 flex flex-col"
        data-testid="learn-screen"
      >
        <AppHeader screenName="Learn" helpContentId="learn-screen-help" />

        {/* Main content with prototype styling */}
        <main className="flex-1 px-5 py-8 pb-24 md:px-8 md:py-12">
          <div className="mx-auto max-w-2xl">
            {/* Content card with enhanced styling */}
            <Card className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 md:p-14 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <CardContent className="p-0 space-y-8">
                {/* Type label and title section */}
                <div>
                  <div
                    className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3"
                    data-testid="type-indicator"
                  >
                    {getTypeLabel()}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                    {step.knowledge_content.title}
                  </h1>
                  <div className="h-0.5 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                </div>

                {/* Summary section with improved typography */}
                {step.knowledge_content.summary && (
                  <p
                    className="text-xl md:text-2xl leading-relaxed text-gray-700 font-medium"
                    data-testid="summary-section"
                  >
                    {step.knowledge_content.summary}
                  </p>
                )}

                {/* Description section */}
                {step.knowledge_content.description && (
                  <div
                    className="text-base md:text-lg leading-relaxed text-gray-600 space-y-4"
                    data-testid="description-section"
                  >
                    {step.knowledge_content.description.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {/* Example/Application section styled as in prototype */}
                {step.knowledge_content.application && (
                  <div
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6 relative overflow-hidden"
                    data-testid="application-section"
                  >
                    <Lightbulb className="absolute top-5 right-5 h-6 w-6 text-blue-300/30" />
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                      Example in Practice
                    </h3>
                    <p className="text-base text-blue-600 italic leading-relaxed relative z-10">
                      {step.knowledge_content.application}
                    </p>
                  </div>
                )}

                {/* Key takeaway section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">Key Takeaway</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    This {getTypeLabel().toLowerCase()} helps you{" "}
                    {step.knowledge_content.category?.toLowerCase() || "improve"} by providing a
                    structured approach to understanding and addressing your challenges.
                  </p>
                </div>

                {/* Continue button with prototype styling */}
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={handleNavigateToPlan}
                    data-testid="continue-to-plan-button"
                    disabled={false} // Remove disabled state - always allow action
                    className={cn(
                      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                      "text-white font-semibold text-lg px-10 py-6 rounded-xl",
                      "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
                      "transform transition-all duration-300 hover:-translate-y-0.5",
                      "inline-flex items-center gap-2"
                    )}
                  >
                    {cameFromReflect && hasPlan
                      ? "Back to Reflection"
                      : hasPlan
                        ? "Review Plan"
                        : "Continue to Plan"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Progress indicator */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg shadow-gray-300/50 text-sm text-gray-500 font-medium z-10 transition-transform duration-300">
          Step <span className="text-blue-500 font-semibold">{step.order}</span> • Learn
        </div>
      </div>
    );
  }
);

LearnScreen.displayName = "LearnScreen";

export default LearnScreen;
