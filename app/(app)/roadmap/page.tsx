import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoadmapView from "@/components/features/roadmap/RoadmapView";

export default async function RoadmapPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
    return;
  }

  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select(
      `
      *,
      steps:roadmap_steps(
        *,
        knowledge_content(*)
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !roadmap) {
    redirect("/new-roadmap");
    return;
  }

  return (
    <div className="min-h-screen bg-background">
      <RoadmapView roadmap={roadmap} />
    </div>
  );
}
