"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RoadmapConnectorProps {
  isCompleted: boolean;
  className?: string;
}

export default function RoadmapConnector({ isCompleted, className }: RoadmapConnectorProps) {
  return (
    <div className={cn("relative flex justify-center", className)}>
      <div
        className={cn(
          "w-0.5 h-12",
          "transition-all duration-500",
          isCompleted ? "bg-primary" : "bg-border",
          !isCompleted && "border-dashed",
          "origin-top scale-y-0 animate-[scale-in-y_0.5s_ease-out_forwards]"
        )}
        style={{
          backgroundImage: !isCompleted
            ? "repeating-linear-gradient(to bottom, transparent, transparent 6px, var(--border) 6px, var(--border) 12px)"
            : undefined,
          animationDelay: "inherit",
        }}
      />
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2",
          "h-2 w-2 rounded-full",
          isCompleted ? "bg-primary" : "bg-border",
          "scale-0 animate-[scale-in_0.3s_ease-out_forwards]"
        )}
        style={{
          animationDelay: "calc(inherit + 0.3s)",
        }}
      />
    </div>
  );
}
