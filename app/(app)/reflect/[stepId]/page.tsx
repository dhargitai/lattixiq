import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReflectScreen from "@/components/features/roadmap/ReflectScreen";
import type { RoadmapStep, KnowledgeContent, Roadmap } from "@/lib/supabase/types";

interface RoadmapStepWithRelations extends RoadmapStep {
  knowledge_content: KnowledgeContent;
  roadmap: Roadmap;
}

export default async function ReflectPage({ params }: { params: Promise<{ stepId: string }> }) {
  const { stepId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
    return; // This return won't execute, but TypeScript needs it
  }

  const { data: step, error } = await supabase
    .from("roadmap_steps")
    .select(
      `
      *,
      knowledge_content(*),
      roadmap:roadmaps(*)
    `
    )
    .eq("id", stepId)
    .single<RoadmapStepWithRelations>();

  if (error || !step) {
    redirect("/my-toolkit");
    return; // This return won't execute, but TypeScript needs it
  }

  // Verify user owns this roadmap step
  if (step.roadmap.user_id !== user.id) {
    redirect("/my-toolkit");
    return; // This return won't execute, but TypeScript needs it
  }

  // Verify plan exists
  if (!step.plan_situation || !step.plan_trigger || !step.plan_action) {
    redirect(`/plan/${stepId}`);
    return; // This return won't execute, but TypeScript needs it
  }

  return (
    <ReflectScreen step={step} knowledgeContent={step.knowledge_content} roadmap={step.roadmap} />
  );
}
