import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RoadmapSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto h-8 w-64 mb-2" />
        <Skeleton className="mx-auto h-5 w-96" />
      </div>

      {/* Progress skeleton */}
      <div className="mb-12">
        <div className="mb-2 flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Steps skeleton */}
      <div className="flex gap-4 flex-col md:flex-row md:justify-center md:items-start">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <Card className="w-full md:w-80">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            {i < 3 && (
              <div className="hidden md:flex items-center">
                <Skeleton className="h-0.5 w-16 lg:w-24" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
