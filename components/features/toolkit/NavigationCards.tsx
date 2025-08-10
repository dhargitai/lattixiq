"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Brain /* , Trophy, FileText */ } from "lucide-react";

interface NavigationCardsProps {
  learnedModelsCount: number;
  completedRoadmapsCount: number;
  recentLogEntry: {
    text: string;
    date: string;
  } | null;
  onLearnedModelsClick?: () => void;
}

export function NavigationCards({
  learnedModelsCount,
  // completedRoadmapsCount,  // Hidden for MVP - will be re-enabled post-launch
  // recentLogEntry,           // Hidden for MVP - will be re-enabled post-launch
  onLearnedModelsClick,
}: NavigationCardsProps) {
  const router = useRouter();

  // Hidden for MVP - will be re-enabled post-launch
  /*
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };
  */

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
        MY LEARNINGS
      </h3>

      <div className="space-y-3">
        <Card
          className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
          onClick={onLearnedModelsClick || (() => router.push("/models"))}
          data-testid="navigation-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-800">My Learned Models</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-gray-100">
                {learnedModelsCount}
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </Card>

        {/* Hidden for MVP - will be re-enabled post-launch */}
        {/* <Card
          className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
          onClick={() => router.push("/roadmaps/completed")}
          data-testid="navigation-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-800">My Completed Roadmaps</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-gray-100">
                {completedRoadmapsCount}
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </Card> */}

        {/* Hidden for MVP - will be re-enabled post-launch */}
        {/* <Card
          className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
          onClick={() => router.push("/logs")}
          data-testid="navigation-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Application Log</div>
                {recentLogEntry && (
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(recentLogEntry.date)}: {truncateText(recentLogEntry.text)}
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </Card> */}
      </div>
    </div>
  );
}
