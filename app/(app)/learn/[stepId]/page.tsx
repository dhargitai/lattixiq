import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getRoadmapStepWithContent } from "@/lib/queries/roadmap-queries";
import LearnScreen from "@/components/features/roadmap/LearnScreen";

interface LearnPageProps {
  params: Promise<{
    stepId: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { stepId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
    return; // This return won't execute, but TypeScript needs it
  }

  // Get roadmap step with content and roadmap info
  const { data: step, error } = await getRoadmapStepWithContent(stepId);

  if (error || !step) {
    notFound();
    return; // This return won't execute, but TypeScript needs it
  }

  // Verify user owns this roadmap step
  if (step.roadmap?.user_id !== user.id) {
    notFound();
    return; // This return won't execute, but TypeScript needs it
  }

  return <LearnScreen step={step} />;
}
