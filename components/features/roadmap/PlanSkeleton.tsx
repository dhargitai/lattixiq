import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const PlanSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-2xl mx-auto px-4 py-8", className)} {...props}>
      {/* Navigation skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-8 w-64 mb-6" />

      {/* Goal example card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
      </Card>

      {/* Form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Situation field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Trigger field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Action field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Submit button skeleton */}
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  )
);

PlanSkeleton.displayName = "PlanSkeleton";
