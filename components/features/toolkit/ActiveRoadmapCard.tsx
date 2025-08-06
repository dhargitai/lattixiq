"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { ActiveRoadmapData } from "@/lib/db/toolkit";

interface ActiveRoadmapCardProps {
  roadmap: ActiveRoadmapData;
}

export function ActiveRoadmapCard({ roadmap }: ActiveRoadmapCardProps) {
  const router = useRouter();

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

  return (
    <Card className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold tracking-wide">
          ACTIVE ROADMAP
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
          onClick={() => router.push("/roadmap")}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
        {roadmap.goal_description || "Your Learning Journey"}
      </h3>

      <div className="w-20 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 mb-4 rounded-full" />

      {roadmap.currentStep && (
        <p className="text-gray-600 mb-4">
          Current Step:{" "}
          <span className="font-semibold text-gray-800">{roadmap.currentStep.title}</span>
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">
            {roadmap.completedSteps}/{roadmap.totalSteps} steps
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-500">
          Last activity: {formatTimeAgo(roadmap.lastActivityDate)}
        </p>
      </div>
    </Card>
  );
}
