import * as React from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderGreeting } from "@/components/features/toolkit/HeaderGreeting";
import { QuickStats } from "@/components/features/toolkit/QuickStats";
import { ActiveRoadmapCard } from "@/components/features/toolkit/ActiveRoadmapCard";
import { QuickActions } from "@/components/features/toolkit/QuickActions";
import { NavigationCards } from "@/components/features/toolkit/NavigationCards";
import { EmptyState } from "@/components/features/toolkit/EmptyState";
import { getToolkitData } from "@/lib/db/toolkit";

export default async function ToolkitPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const toolkitData = await getToolkitData(user.id);

  const hasAnyActivity =
    toolkitData.activeRoadmap ||
    toolkitData.completedRoadmapsCount > 0 ||
    toolkitData.learnedModelsCount > 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Toolkit</h1>
        <button className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-50">
          <span className="text-lg">❓</span>
        </button>
      </header>

      <main className="flex-1 px-5 py-6 max-w-xl mx-auto w-full space-y-8">
        <HeaderGreeting userName="Achiever" />

        {hasAnyActivity ? (
          <>
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <QuickStats stats={toolkitData.stats} />
            </Suspense>

            {toolkitData.activeRoadmap && (
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <ActiveRoadmapCard roadmap={toolkitData.activeRoadmap} />
              </Suspense>
            )}

            <QuickActions
              hasActiveRoadmap={!!toolkitData.activeRoadmap}
              hasActivePlan={toolkitData.hasActivePlan}
              currentStepId={toolkitData.currentStepId}
            />

            <NavigationCards
              learnedModelsCount={toolkitData.learnedModelsCount}
              completedRoadmapsCount={toolkitData.completedRoadmapsCount}
              recentLogEntry={toolkitData.recentLogEntry}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
