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
        className={cn("w-0.5 h-12", "transition-all duration-500", "origin-top")}
        style={{
          backgroundImage: !isCompleted
            ? "repeating-linear-gradient(to bottom, hsl(var(--border)), hsl(var(--border)) 6px, transparent 6px, transparent 12px)"
            : undefined,
          backgroundColor: isCompleted ? "hsl(var(--primary))" : undefined,
          transform: "scaleY(0)",
          animation: "scale-in-y 0.5s ease-out forwards",
          animationDelay: "inherit",
        }}
      />
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2",
          "h-2 w-2 rounded-full",
          isCompleted ? "bg-primary" : "bg-border"
        )}
        style={{
          transform: "scale(0)",
          animation: "scale-in 0.3s ease-out forwards",
          animationDelay: "calc(inherit + 0.3s)",
        }}
      />
    </div>
  );
}
