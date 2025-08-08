"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransformedStep } from "@/lib/transformers/roadmap-transformers";

interface RoadmapStepProps {
  step: TransformedStep;
  index: number;
  isAvailable: boolean;
  isCompleted: boolean;
}

export default function RoadmapStep({ step, index, isAvailable, isCompleted }: RoadmapStepProps) {
  const router = useRouter();

  // Detect applying state (has plan but no reflection)
  const hasPlan = step.plan_situation && step.plan_trigger && step.plan_action;
  const hasReflection = step.has_reflection;
  const isApplying = isAvailable && hasPlan && !hasReflection && !isCompleted;

  const handleClick = () => {
    if (isAvailable) {
      // Navigate based on step state
      if (!hasPlan) {
        router.push(`/learn/${step.id}`);
      } else if (!hasReflection) {
        router.push(`/reflect/${step.id}`);
      } else {
        router.push(`/learn/${step.id}`);
      }
    }
  };

  const getCtaText = () => {
    if (!isAvailable || isCompleted) return null;
    if (!hasPlan) return "Start Learning";
    if (!hasReflection) return "Reflect On What You Learned";
    return "View Step";
  };

  const getStepIndicator = () => {
    if (isCompleted) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      );
    }
    if (isAvailable) {
      return (
        <button
          onClick={handleClick}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            "bg-blue-500 text-white font-semibold text-lg",
            "cursor-pointer transition-all duration-200",
            "hover:scale-105 hover:shadow-lg hover:shadow-blue-200/50",
            "active:scale-95",
            "ring-4 ring-blue-100 animate-pulse-ring"
          )}
          aria-label={`Current step ${index + 1}`}
        >
          {index + 1}
        </button>
      );
    }
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 border-2 border-gray-200">
        <Lock className="h-4 w-4 text-gray-400" />
      </div>
    );
  };

  const stepLabel = isAvailable
    ? isApplying
      ? `Step ${index + 1} • Applying`
      : `Step ${index + 1} • Current`
    : `Step ${index + 1}`;

  return (
    <div
      data-testid={`roadmap-step-${index}`}
      className={cn(
        "relative flex items-start pb-8",
        "animate-fade-in",
        !isAvailable && isCompleted === false && "opacity-50"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      aria-disabled={!isAvailable && !isCompleted}
    >
      {/* Step Indicator */}
      <div className="mr-5 flex-shrink-0 relative z-10">{getStepIndicator()}</div>

      {/* Step Content */}
      <div className="flex-1 pt-2.5">
        <div
          className={cn(
            "text-sm font-medium uppercase tracking-wider mb-1",
            isAvailable && "text-blue-500",
            isCompleted && "text-gray-600",
            !isAvailable && !isCompleted && "text-gray-400"
          )}
        >
          {stepLabel}
        </div>
        <h2
          className={cn(
            "text-lg font-medium leading-snug",
            isCompleted && "text-gray-700",
            isAvailable && "text-gray-900",
            !isAvailable && !isCompleted && "text-gray-400 blur-[3px]"
          )}
        >
          {step.knowledge_content.title}
        </h2>

        {/* Applying State Indicator */}
        {isApplying && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <p className="text-sm text-gray-600">
              You&apos;re on a mission to apply what you learned
            </p>
          </div>
        )}

        {/* CTA Button */}
        {isAvailable && !isCompleted && (
          <button
            onClick={handleClick}
            className="mt-3 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {getCtaText()} →
          </button>
        )}
      </div>
    </div>
  );
}
