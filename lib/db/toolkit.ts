import { createClient } from "@/lib/supabase/server";
import type { RoadmapStep, ApplicationLog } from "@/lib/supabase/types";

export interface ActiveRoadmapData {
  id: string;
  goal_description: string | null;
  currentStep: {
    title: string;
    order: number;
  } | null;
  totalSteps: number;
  completedSteps: number;
  lastActivityDate: string | null;
}

export interface ToolkitStats {
  streak: number;
  totalLearned: number;
  completionRate: number;
}

export interface ToolkitData {
  activeRoadmap: ActiveRoadmapData | null;
  stats: ToolkitStats;
  learnedModelsCount: number;
  completedRoadmapsCount: number;
  hasActivePlan: boolean;
  recentLogEntry: {
    text: string;
    date: string;
  } | null;
}

export async function getToolkitData(userId: string): Promise<ToolkitData> {
  const supabase = await createClient();

  const [activeRoadmapResult, completedRoadmapsResult, applicationLogsResult, learnedStepsResult] =
    await Promise.all([
      supabase
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
        .eq("user_id", userId)
        .eq("status", "active")
        .single(),

      supabase.from("roadmaps").select("id").eq("user_id", userId).eq("status", "completed"),

      supabase
        .from("application_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("roadmap_steps")
        .select(
          `
        id,
        roadmap_id,
        roadmaps!inner(user_id)
      `
        )
        .eq("status", "completed")
        .eq("roadmaps.user_id", userId),
    ]);

  const activeRoadmap = activeRoadmapResult.data;
  const completedRoadmaps = completedRoadmapsResult.data || [];
  const applicationLogs = applicationLogsResult.data || [];
  const learnedSteps = learnedStepsResult.data || [];

  let activeRoadmapData: ActiveRoadmapData | null = null;
  let hasActivePlan = false;

  if (activeRoadmap && "steps" in activeRoadmap) {
    const steps = activeRoadmap.steps || [];
    const completedSteps = steps.filter((s: RoadmapStep) => s.status === "completed").length;
    const currentStep = steps.find((s: RoadmapStep) => s.status === "unlocked");

    if (currentStep) {
      hasActivePlan = !!(
        currentStep.plan_situation ||
        currentStep.plan_trigger ||
        currentStep.plan_action
      );
    }

    const lastActivity = applicationLogs.find((log: ApplicationLog) =>
      steps.some((s: RoadmapStep) => s.id === log.roadmap_step_id)
    );

    activeRoadmapData = {
      id: activeRoadmap.id,
      goal_description: activeRoadmap.goal_description,
      currentStep:
        currentStep && "knowledge_content" in currentStep
          ? {
              title: currentStep.knowledge_content.title,
              order: currentStep.order,
            }
          : null,
      totalSteps: steps.length,
      completedSteps,
      lastActivityDate: lastActivity?.created_at || null,
    };
  }

  const streak = calculateStreak(applicationLogs);
  const totalLearned = learnedSteps.length;
  const totalSteps =
    activeRoadmap && "steps" in activeRoadmap
      ? (activeRoadmap.steps?.length || 0) + learnedSteps.length
      : learnedSteps.length;
  const completionRate = totalSteps > 0 ? (totalLearned / totalSteps) * 100 : 0;

  const [recentLog] = applicationLogs;
  const recentLogEntry = recentLog
    ? {
        text: recentLog.situation_text || recentLog.learning_text || "Reflection logged",
        date: recentLog.created_at || new Date().toISOString(),
      }
    : null;

  return {
    activeRoadmap: activeRoadmapData,
    stats: {
      streak,
      totalLearned,
      completionRate: Math.round(completionRate),
    },
    learnedModelsCount: totalLearned,
    completedRoadmapsCount: completedRoadmaps.length,
    hasActivePlan,
    recentLogEntry,
  };
}

function calculateStreak(logs: ApplicationLog[]): number {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.created_at || "").getTime();
    const dateB = new Date(b.created_at || "").getTime();
    return dateB - dateA;
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogDate = new Date(sortedLogs[0].created_at || "");
  lastLogDate.setHours(0, 0, 0, 0);

  const daysSinceLastLog = Math.floor(
    (today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceLastLog > 1) return 0;

  let currentDate = new Date(lastLogDate);
  streak = 1;

  for (let i = 1; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].created_at || "");
    logDate.setHours(0, 0, 0, 0);

    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    if (logDate.getTime() === prevDate.getTime()) {
      streak++;
      currentDate = logDate;
    } else {
      break;
    }
  }

  return streak;
}
