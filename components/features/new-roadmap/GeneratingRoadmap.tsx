"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function GeneratingRoadmap() {
  return (
    <div
      data-testid="loading-overlay"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/90 backdrop-blur-sm",
        "animate-in fade-in duration-300"
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-white p-10 shadow-xl",
          "animate-in slide-in-from-bottom-4 duration-500",
          "text-center space-y-6 max-w-sm mx-auto"
        )}
      >
        <div className="text-7xl animate-bounce">🚀</div>
        <h2 className="text-[28px] font-bold text-[#1A202C]">Building Your Roadmap!</h2>
        <p className="text-[#718096] text-lg">Creating your personalized learning journey...</p>
        <div className="flex justify-center space-x-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-[#48BB78]" />
          <div className="h-3 w-3 animate-pulse rounded-full bg-[#48BB78] animation-delay-200" />
          <div className="h-3 w-3 animate-pulse rounded-full bg-[#48BB78] animation-delay-400" />
        </div>
      </div>
    </div>
  );
}
