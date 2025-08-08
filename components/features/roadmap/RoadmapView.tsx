"use client";

import React from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import RoadmapStep from "./RoadmapStep";
import RoadmapConnector from "./RoadmapConnector";
import { cn } from "@/lib/utils";
import type { TransformedRoadmap } from "@/lib/transformers/roadmap-transformers";

interface RoadmapViewProps {
  roadmap: TransformedRoadmap;
  showSuccess?: boolean;
}

export default function RoadmapView({ roadmap, showSuccess = false }: RoadmapViewProps) {
  const completedSteps = roadmap.steps.filter((step) => step.status === "completed").length;
  const totalSteps = roadmap.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <>
      <AppHeader screenName="Your Roadmap" helpContentId="roadmap-screen-help" />

      <div
        data-testid="roadmap-container"
        className={cn(
          "mx-auto w-full max-w-[480px] px-5 py-6 md:py-12 pb-20",
          "animate-in fade-in duration-500 flex-col"
        )}
      >
        {/* Success Message */}
        {showSuccess && (
          <div
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
            data-testid="success-message"
          >
            <div className="text-green-800 font-medium">
              Great job! Your reflection has been saved and the next step is now unlocked.
            </div>
          </div>
        )}

        {/* Roadmap Title */}
        <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight mb-8">
          Your Roadmap: {roadmap.goal_description}
        </h1>

        {/* Progress Bar (hidden but present for tests) */}
        <div
          className="sr-only"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemax={100}
        >
          {completedSteps} of {totalSteps} steps completed
        </div>

        {/* Roadmap Steps */}
        <div className="relative pl-3">
          {roadmap.steps
            .sort((a, b) => a.order_index - b.order_index)
            .map((step, index) => (
              <div key={step.id} className="relative">
                <RoadmapStep
                  step={step}
                  index={index}
                  isAvailable={step.status === "unlocked"}
                  isCompleted={step.status === "completed"}
                />
                {index < roadmap.steps.length - 1 && (
                  <RoadmapConnector
                    isCompleted={step.status === "completed"}
                    className="top-[44px] h-[calc(100%-44px)]"
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
