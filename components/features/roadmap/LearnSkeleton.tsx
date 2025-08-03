import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LearnSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation breadcrumb skeleton */}
      <nav className="border-b bg-card/50 p-4" aria-label="breadcrumb">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-9 w-32 mb-2" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground">›</span>
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">›</span>
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </nav>

      {/* Main content skeleton */}
      <main className="mx-auto max-w-3xl p-6">
        {/* Header skeleton */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-80" />
        </header>

        {/* Content sections skeleton */}
        <div className="space-y-8">
          {/* Summary section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Description section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>

          {/* Application section skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer skeleton */}
        <footer className="mt-12 border-t pt-8">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </footer>
      </main>
    </div>
  );
}
