"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapStepWithContent, Roadmap } from "@/lib/supabase/types";

interface LearnScreenProps {
  step: RoadmapStepWithContent & { roadmap: Roadmap };
  onNavigateToPlan?: () => void;
  onNavigateBack?: () => void;
}

const LearnScreen = React.forwardRef<HTMLDivElement, LearnScreenProps>(
  ({ step, onNavigateToPlan, onNavigateBack }, ref) => {
    const router = useRouter();

    const handleNavigateToPlan = () => {
      if (onNavigateToPlan) {
        onNavigateToPlan();
      } else {
        router.push(`/plan/${step.id}`);
      }
    };

    const handleNavigateBack = () => {
      if (onNavigateBack) {
        onNavigateBack();
      } else {
        router.push("/roadmap");
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

    const getBadgeVariant = () =>
      step.knowledge_content.type === "mental-model" ? "default" : "secondary";

    return (
      <div ref={ref} className="min-h-screen bg-background" data-testid="learn-screen">
        {/* Navigation breadcrumb */}
        <nav className="border-b bg-card/50 p-4" aria-label="breadcrumb">
          <div className="mx-auto max-w-3xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateBack}
              data-testid="back-button"
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roadmap
            </Button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Toolkit</span>
              <span>›</span>
              <span>Roadmap</span>
              <span>›</span>
              <span className="text-foreground">Learn</span>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="mx-auto max-w-3xl p-6">
          {/* Header with title and metadata */}
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant={getBadgeVariant()} data-testid="category-badge">
                {step.knowledge_content.category}
              </Badge>
              <span data-testid="type-indicator" className="text-sm text-muted-foreground">
                {getTypeLabel()}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{step.knowledge_content.title}</h1>
          </header>

          {/* Content sections */}
          <div className="space-y-8">
            {/* Summary section */}
            {step.knowledge_content.summary && (
              <Card data-testid="summary-section">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.knowledge_content.summary}
                  </CardDescription>
                </CardContent>
              </Card>
            )}

            {/* Description section */}
            {step.knowledge_content.description && (
              <Card data-testid="description-section">
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral max-w-none dark:prose-invert">
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {step.knowledge_content.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application section */}
            {step.knowledge_content.application && (
              <Card data-testid="application-section">
                <CardHeader>
                  <CardTitle className="text-lg">How to Apply This</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral max-w-none dark:prose-invert">
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {step.knowledge_content.application}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer with Continue button */}
          <footer className="mt-12 border-t pt-8">
            <div className="flex justify-end">
              <Button
                onClick={handleNavigateToPlan}
                data-testid="continue-to-plan-button"
                disabled={!!step.plan_created_at}
                className={cn(
                  "btn-primary",
                  step.plan_created_at && "opacity-50 cursor-not-allowed"
                )}
                size="lg"
              >
                {step.plan_created_at ? "Plan Created" : "Continue to Plan"}
                {!step.plan_created_at && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    );
  }
);

LearnScreen.displayName = "LearnScreen";

export default LearnScreen;
