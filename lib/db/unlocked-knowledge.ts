import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export interface UnlockedKnowledge {
  id: string;
  name: string;
  type: Database["public"]["Enums"]["knowledge_content_type"];
  category: string | null;
  slug: string;
  completed_at: string;
}

export async function getUnlockedKnowledge(): Promise<UnlockedKnowledge[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // First get roadmaps for this user
  const { data: roadmaps } = await supabase.from("roadmaps").select("id").eq("user_id", user.id);

  if (!roadmaps || roadmaps.length === 0) {
    return [];
  }

  const roadmapIds = roadmaps.map((r) => r.id);

  // Then get completed steps for those roadmaps
  const { data, error } = await supabase
    .from("roadmap_steps")
    .select(
      `
      id,
      plan_created_at,
      knowledge_content!inner(
        id,
        title,
        type,
        category
      )
    `
    )
    .in("roadmap_id", roadmapIds)
    .eq("status", "completed")
    .order("plan_created_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error fetching unlocked knowledge:", error);
    throw error;
  }

  if (!data) {
    return [];
  }

  // Transform and deduplicate the data
  const knowledgeMap = new Map<string, UnlockedKnowledge>();

  data.forEach((step) => {
    const content = step.knowledge_content;
    if (content && !knowledgeMap.has(content.id)) {
      // Create slug from title
      const slug = content.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      knowledgeMap.set(content.id, {
        id: content.id,
        name: content.title,
        type: content.type,
        category: content.category,
        slug,
        completed_at: step.plan_created_at || new Date().toISOString(),
      });
    }
  });

  // Return as array, already sorted by completed_at from query
  return Array.from(knowledgeMap.values());
}
