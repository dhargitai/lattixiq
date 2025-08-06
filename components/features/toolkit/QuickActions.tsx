"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Shuffle } from "lucide-react";

interface QuickActionsProps {
  hasActiveRoadmap: boolean;
  hasActivePlan: boolean;
}

export function QuickActions({ hasActiveRoadmap, hasActivePlan }: QuickActionsProps) {
  const router = useRouter();

  if (!hasActiveRoadmap) {
    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
          onClick={() => router.push("/onboarding")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Start Your First Roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasActivePlan && (
        <Button
          variant="outline"
          className="w-full justify-start border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={() => router.push("/reflect")}
        >
          <Calendar className="mr-3 h-5 w-5 text-green-600" />
          <span className="text-gray-700">Today&apos;s Reflection</span>
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full justify-start hover:bg-gray-50"
        onClick={() => router.push("/onboarding")}
      >
        <Plus className="mr-3 h-5 w-5 text-blue-600" />
        <span className="text-gray-700">Start New Roadmap</span>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start hover:bg-gray-50"
        onClick={() => router.push("/explore")}
      >
        <Shuffle className="mr-3 h-5 w-5 text-purple-600" />
        <span className="text-gray-700">Explore Random Model</span>
      </Button>
    </div>
  );
}
