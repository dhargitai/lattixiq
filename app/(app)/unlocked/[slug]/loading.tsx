import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header skeleton */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 px-5 py-8 pb-24 md:px-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 md:p-14">
            <CardContent className="p-0 space-y-8">
              {/* Title skeleton */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-0.5 w-20" />
              </div>

              {/* Summary skeleton */}
              <Skeleton className="h-20 w-full" />

              {/* Description skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Example section skeleton */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>

              {/* Key takeaway skeleton */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
