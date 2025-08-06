import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ActiveRoadmapCardSkeleton() {
  return (
    <Card className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      <Skeleton className="h-7 w-3/4 mb-3" />

      <Skeleton className="h-0.5 w-20 mb-4" />

      <div className="mb-4">
        <Skeleton className="h-5 w-2/3" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-2.5 w-full rounded-full" />

        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
}
