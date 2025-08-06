"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ActiveRoadmapCardErrorProps {
  retry?: () => void;
}

export function ActiveRoadmapCardError({ retry }: ActiveRoadmapCardErrorProps) {
  return (
    <Card className="relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Unable to Load Roadmap</h3>
      </div>

      <p className="text-red-700 mb-4">
        We encountered an error while loading your active roadmap. Please try again.
      </p>

      {retry && (
        <Button
          variant="outline"
          className="w-full border-red-300 text-red-700 hover:bg-red-50"
          onClick={retry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </Card>
  );
}
