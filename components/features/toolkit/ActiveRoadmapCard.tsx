"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, CheckCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import type { ActiveRoadmapData } from "@/lib/db/toolkit";

interface ActiveRoadmapCardProps {
  roadmap: ActiveRoadmapData;
}

export function ActiveRoadmapCard({ roadmap }: ActiveRoadmapCardProps) {
  const router = useRouter();
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = React.useState(false);

  React.useEffect(() => {
    if (
      roadmap.completedSteps === roadmap.totalSteps &&
      roadmap.totalSteps > 0 &&
      !hasTriggeredCelebration
    ) {
      // Trigger confetti celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      setHasTriggeredCelebration(true);
    }
  }, [roadmap.completedSteps, roadmap.totalSteps, hasTriggeredCelebration]);

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "No activity yet";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) return "Just now";
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""} ago`;
  };

  const progressPercentage =
    roadmap.totalSteps > 0 ? (roadmap.completedSteps / roadmap.totalSteps) * 100 : 0;

  const getStepStatusBadge = () => {
    if (!roadmap.currentStep) return null;

    if (roadmap.currentStep.planCreatedAt && !roadmap.currentStep.hasReflection) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
          IN PROGRESS
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
        READY TO START
      </Badge>
    );
  };

  const getActionButtonText = () => {
    if (progressPercentage === 100) return "View Completed Roadmap";
    if (roadmap.isPaused) return "Resume Learning";
    return "Continue Learning";
  };

  return (
    <Card
      className={cn(
        "relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 p-6 transition-all duration-300",
        progressPercentage === 100
          ? "border-green-300 hover:border-green-400"
          : roadmap.isPaused
            ? "border-amber-300 hover:border-amber-400"
            : roadmap.isNearCompletion
              ? "border-blue-300 hover:border-blue-400"
              : "border-gray-200 hover:border-gray-300",
        "hover:shadow-lg"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {progressPercentage === 100 ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-semibold tracking-wide">
              COMPLETED
            </Badge>
          ) : roadmap.isPaused ? (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs font-semibold tracking-wide">
              PAUSED
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold tracking-wide">
              ACTIVE ROADMAP
            </Badge>
          )}
          {roadmap.isNearCompletion && progressPercentage < 100 && (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
              FINAL STEP
            </Badge>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push("/roadmap")}
          aria-label={getActionButtonText()}
          title={getActionButtonText()}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
        {roadmap.goal_description || "Your Learning Journey"}
      </h3>

      <div className="w-20 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 mb-4 rounded-full" />

      {roadmap.currentStep && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">
              Current Step:{" "}
              <span className="font-semibold text-gray-800">{roadmap.currentStep.title}</span>
            </p>
            {getStepStatusBadge()}
          </div>
        </div>
      )}

      {progressPercentage === 100 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Congratulations! Roadmap completed!</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">
            Step {roadmap.completedSteps + (roadmap.currentStep ? 1 : 0)} of {roadmap.totalSteps}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressPercentage === 100
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : roadmap.isNearCompletion
                  ? "bg-gradient-to-r from-purple-500 to-purple-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Last activity: {formatTimeAgo(roadmap.lastActivityDate)}
          </p>
          {roadmap.isPaused && <PauseCircle className="h-4 w-4 text-amber-600" />}
        </div>
      </div>
    </Card>
  );
}
