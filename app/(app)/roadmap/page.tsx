import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoadmapView from "@/components/features/roadmap/RoadmapView";
import { getActiveRoadmapWithSteps } from "@/lib/queries/roadmap-queries";
import { transformRoadmapForView } from "@/lib/transformers/roadmap-transformers";
import BottomNav from "@/components/features/shared/BottomNav";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
    return;
  }

  // Use the typed query function
  const { data: roadmap, error } = await getActiveRoadmapWithSteps(user.id);

  if (error || !roadmap || !roadmap.goal_description) {
    redirect("/new-roadmap");
    return;
  }

  // Transform the data to match RoadmapView expectations using the transformer
  const transformedRoadmap = transformRoadmapForView(roadmap);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RoadmapView roadmap={transformedRoadmap} showSuccess={params.success === "true"} />
      <BottomNav />
    </div>
  );
}
