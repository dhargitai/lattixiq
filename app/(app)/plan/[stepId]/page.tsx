import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PlanScreen } from "@/components/features/roadmap/PlanScreen";
import { PlanSkeleton } from "@/components/features/roadmap/PlanSkeleton";
import type { RoadmapStep, KnowledgeContent, Roadmap, GoalExample } from "@/lib/supabase/types";

interface KnowledgeContentWithExamples extends KnowledgeContent {
  goal_examples: GoalExample[];
}

interface RoadmapStepWithRelations extends RoadmapStep {
  knowledge_content: KnowledgeContentWithExamples;
  roadmap: Roadmap;
}

async function PlanContent({ stepId }: { stepId: string }) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch roadmap step with related data
  const { data: step, error } = await supabase
    .from("roadmap_steps")
    .select(
      `
      *,
      knowledge_content(
        *,
        goal_examples(*)
      ),
      roadmap:roadmaps(*)
    `
    )
    .eq("id", stepId)
    .single<RoadmapStepWithRelations>();

  if (error || !step) {
    redirect("/");
  }

  // Verify user owns this roadmap step
  if (step.roadmap.user_id !== user.id) {
    redirect("/");
  }

  return (
    <PlanScreen
      step={step}
      knowledgeContent={step.knowledge_content}
      goalExamples={step.knowledge_content.goal_examples}
    />
  );
}

export default async function PlanPage({ params }: { params: Promise<{ stepId: string }> }) {
  const { stepId } = await params;
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <PlanContent stepId={stepId} />
    </Suspense>
  );
}
