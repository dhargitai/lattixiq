"use client";

import React from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import RoadmapStep from "./RoadmapStep";
import RoadmapConnector from "./RoadmapConnector";
import { cn } from "@/lib/utils";

interface RoadmapViewProps {
  roadmap: {
    id: string;
    goal_description: string;
    steps: Array<{
      id: string;
      order_index: number;
      status: "unlocked" | "locked" | "completed";
      knowledge_content: {
        id: string;
        title: string;
        category: string;
        type: string;
        summary: string;
      };
    }>;
  };
}

export default function RoadmapView({ roadmap }: RoadmapViewProps) {
  const completedSteps = roadmap.steps.filter((step) => step.status === "completed").length;
  const totalSteps = roadmap.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div
      data-testid="roadmap-container"
      className={cn(
        "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        "animate-in fade-in duration-500"
      )}
    >
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/toolkit" className="transition-colors hover:text-foreground">
              My Toolkit
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Learning Journey</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Your Learning Journey</h1>
        <p className="mt-2 text-lg text-muted-foreground">{roadmap.goal_description}</p>
      </div>

      {/* Progress */}
      <div className="mb-12">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>
            {completedSteps} of {totalSteps} steps completed
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" aria-label="Roadmap progress" />
      </div>

      {/* Steps */}
      <div className={cn("flex flex-col gap-6", "max-w-3xl mx-auto w-full")}>
        {roadmap.steps
          .sort((a, b) => a.order_index - b.order_index)
          .map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <RoadmapStep
                  step={step}
                  index={index}
                  isAvailable={step.status === "unlocked"}
                  isCompleted={step.status === "completed"}
                />
              </div>
              {index < roadmap.steps.length - 1 && (
                <div
                  className="animate-in fade-in duration-700 flex justify-center py-2"
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                >
                  <RoadmapConnector isCompleted={step.status === "completed"} />
                </div>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
