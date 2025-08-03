"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Circle } from "lucide-react";
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

  const handleClick = () => {
    if (isAvailable) {
      router.push(`/learn/${step.id}`);
    }
  };

  const getIcon = () => {
    if (isCompleted) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    }
    if (isAvailable) {
      return <Circle className="h-6 w-6 text-primary" />;
    }
    return <Lock className="h-6 w-6 text-muted-foreground" />;
  };

  const getCategoryBadge = () => {
    const variant = step.knowledge_content.type === "mental-model" ? "default" : "secondary";
    const label =
      step.knowledge_content.type === "mental-model"
        ? "Mental Model"
        : step.knowledge_content.type === "cognitive-bias"
          ? "Cognitive Bias"
          : "Fallacy";
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card
      data-testid={`roadmap-step-${index}`}
      className={cn(
        "relative transition-all duration-200",
        "w-full",
        isAvailable && "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        !isAvailable && "opacity-60",
        "transform-gpu" // Enable GPU acceleration for smooth animations
      )}
      onClick={handleClick}
      aria-disabled={!isAvailable}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{step.knowledge_content.title}</CardTitle>
              {getCategoryBadge()}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">Step {index + 1}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{step.knowledge_content.summary}</CardDescription>
        {isAvailable && index === 0 && (
          <Button className="mt-4 w-full" size="sm">
            Start Learning
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
