"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RoadmapConnectorProps {
  isCompleted: boolean;
  className?: string;
}

export default function RoadmapConnector({ isCompleted, className }: RoadmapConnectorProps) {
  return (
    <div
      className={cn(
        "absolute left-[22px] -top-2 w-0.5 h-[calc(100%+16px)] z-0",
        isCompleted ? "bg-green-500" : "bg-gray-200",
        className
      )}
    />
  );
}
