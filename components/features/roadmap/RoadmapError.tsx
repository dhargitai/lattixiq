"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RoadmapErrorProps {
  onRetry?: () => void;
}

export default function RoadmapError({ onRetry }: RoadmapErrorProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading roadmap</AlertTitle>
        <AlertDescription>
          We encountered an error while loading your roadmap. This might be a temporary issue.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex justify-center gap-4">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
        )}
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
}
