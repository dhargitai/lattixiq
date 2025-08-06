import * as React from "react";
import { Card } from "@/components/ui/card";
import type { ToolkitStats } from "@/lib/db/toolkit";

interface QuickStatsProps {
  stats: ToolkitStats;
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4 text-center">
        <div className="text-2xl font-semibold text-blue-600">{stats.streak}</div>
        <div className="text-sm text-gray-600 mt-1">Day Streak</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-semibold text-green-600">{stats.totalLearned}</div>
        <div className="text-sm text-gray-600 mt-1">Models Learned</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-semibold text-purple-600">{stats.completionRate}%</div>
        <div className="text-sm text-gray-600 mt-1">Completion</div>
      </Card>
    </div>
  );
}
