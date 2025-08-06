import { createClient } from "@/lib/supabase/server";

export async function isKnowledgeUnlocked(knowledgeId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: roadmaps, error: roadmapError } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", userId);

  if (roadmapError) {
    console.error("Error fetching roadmaps:", roadmapError);
    return false;
  }

  if (!roadmaps || roadmaps.length === 0) {
    return false;
  }

  const roadmapIds = roadmaps.map((r) => r.id);

  const { data, error } = await supabase
    .from("roadmap_steps")
    .select(
      `
      id,
      knowledge_content_id,
      status
    `
    )
    .in("roadmap_id", roadmapIds)
    .eq("status", "completed")
    .eq("knowledge_content_id", knowledgeId);

  if (error) {
    console.error("Error checking knowledge access:", error);
    return false;
  }

  return data !== null && data.length > 0;
}
