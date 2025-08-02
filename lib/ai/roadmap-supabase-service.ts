import { createClient } from "@/lib/supabase/server";
import type { UserLearningHistory, AIGoalExample, KnowledgeContent } from "@/lib/types/ai";
import type { RoadmapStepInsert } from "@/lib/supabase/types";
import { testSemanticSearch } from "@/lib/mocks/test-knowledge-content";

export interface KnowledgeSearchResult extends KnowledgeContent {
  similarity: number;
  goalExamples?: AIGoalExample[];
}

export class RoadmapSupabaseService {
  async getUserLearningHistory(userId: string): Promise<UserLearningHistory> {
    const supabase = await createClient();

    // Get user's completed roadmap steps
    const { data: completedSteps, error } = await supabase
      .from("roadmap_steps")
      .select(
        `
        knowledge_content_id,
        roadmap:roadmaps!inner(
          user_id,
          status
        )
      `
      )
      .eq("roadmap.user_id", userId)
      .eq("status", "completed");

    if (error) {
      console.error("Error fetching learning history:", error);
      throw new Error("Failed to fetch learning history");
    }

    // Get application logs for effectiveness ratings and last reflection dates
    const knowledgeIds = completedSteps?.map((step) => step.knowledge_content_id) || [];

    const { data: applicationLogs, error: logsError } = await supabase
      .from("application_logs")
      .select(
        `
        roadmap_step_id,
        effectiveness_rating,
        created_at,
        roadmap_steps!inner(
          knowledge_content_id
        )
      `
      )
      .eq("user_id", userId)
      .in("roadmap_steps.knowledge_content_id", knowledgeIds)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("Error fetching application logs:", error);
      throw new Error("Failed to fetch application logs");
    }

    // Get current active roadmap
    const { data: activeRoadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    // Transform data into UserLearningHistory format
    const learnedConcepts = this.transformToLearnedConcepts(
      completedSteps || [],
      applicationLogs || []
    );

    return {
      userId,
      learnedConcepts,
      currentRoadmapId: activeRoadmap?.id,
    };
  }

  async getKnowledgeContent(): Promise<KnowledgeContent[]> {
    const supabase = await createClient();

    const { data: knowledgeContent, error } = await supabase.from("knowledge_content").select(`
        id,
        title,
        category,
        type,
        summary,
        description,
        application,
        keywords,
        embedding,
        goal_examples (
          goal,
          if_then_example,
          spotting_mission_example
        )
      `);

    if (error) {
      console.error("Error fetching knowledge content:", error);
      throw new Error("Failed to fetch knowledge content");
    }

    return (knowledgeContent || []).map((content) => {
      // Transform database response to include goalExamples
      const result: KnowledgeContent = {
        ...content,
        goalExamples:
          content.goal_examples?.map((example) => ({
            goal: example.goal,
            if_then_example: example.if_then_example,
            spotting_mission_example: example.spotting_mission_example,
          })) || undefined,
      };
      return result;
    });
  }

  async searchKnowledgeContentByEmbedding(
    queryEmbedding: number[],
    matchThreshold: number = 0.3,
    matchCount: number = 30,
    userLearningHistory?: UserLearningHistory
  ): Promise<KnowledgeSearchResult[]> {
    // Check if we should use test data
    if (process.env.USE_TEST_DATA === "true") {
      // For test data, we'll use a simple search based on the query
      // In a real scenario, you'd pass the actual query text here
      const testResults = testSemanticSearch("", matchCount);

      return testResults.map((result) => ({
        id: result.id,
        title: result.title,
        type:
          result.type === "mental-model"
            ? "mental-model"
            : ("cognitive-bias" as "mental-model" | "cognitive-bias" | "fallacy"),
        category: result.type === "mental-model" ? "decision-making" : "cognitive-biases",
        summary: result.summary,
        description: result.summary,
        application: "Test application example",
        keywords: [],
        embedding: null,
        goalExamples: [],
        similarity: result.similarity,
      }));
    }

    const supabase = await createClient();

    // Use the match_knowledge_content function for vector similarity search
    const { data: searchResults, error } = await supabase.rpc("match_knowledge_content", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error("Error searching knowledge content:", error);
      throw new Error("Failed to search knowledge content");
    }

    // Get full content details for the matched items
    const ids = searchResults?.map((r: any) => r.id) || [];

    if (ids.length === 0) {
      return [];
    }

    const { data: fullContent, error: contentError } = await supabase
      .from("knowledge_content")
      .select(
        `
        id,
        title,
        category,
        type,
        summary,
        description,
        application,
        keywords,
        embedding,
        goal_examples (
          goal,
          if_then_example,
          spotting_mission_example
        )
      `
      )
      .in("id", ids);

    if (contentError) {
      console.error("Error fetching full knowledge content:", contentError);
      throw new Error("Failed to fetch full knowledge content");
    }

    // Create a map of similarity scores
    const similarityMap = new Map(searchResults?.map((r: any) => [r.id, r.similarity]) || []);

    // Combine full content with similarity scores
    const results: KnowledgeSearchResult[] = (fullContent || []).map((content) => {
      const similarity = similarityMap.get(content.id) || 0;

      return {
        ...content,
        goalExamples:
          content.goal_examples?.map((example: any) => ({
            goal: example.goal,
            if_then_example: example.if_then_example,
            spotting_mission_example: example.spotting_mission_example,
          })) || undefined,
        similarity: similarity as number,
      } as KnowledgeSearchResult;
    });

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  async saveRoadmap(
    userId: string,
    goalDescription: string,
    roadmapSteps: Array<{
      knowledgeContentId: string;
      order: number;
    }>
  ) {
    const supabase = await createClient();

    // Start a transaction
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        user_id: userId,
        goal_description: goalDescription,
        status: "active",
      })
      .select()
      .single();

    if (roadmapError) {
      console.error("Error creating roadmap:", roadmapError);
      throw new Error("Failed to create roadmap");
    }

    // Insert roadmap steps
    const steps = roadmapSteps.map((step) => ({
      roadmap_id: roadmap.id,
      knowledge_content_id: step.knowledgeContentId,
      order: step.order,
      status: step.order === 1 ? "unlocked" : "locked",
    }));

    const { error: stepsError } = await supabase
      .from("roadmap_steps")
      .insert(steps as RoadmapStepInsert[]);

    if (stepsError) {
      console.error("Error creating roadmap steps:", stepsError);
      // Rollback by deleting the roadmap
      await supabase.from("roadmaps").delete().eq("id", roadmap.id);
      throw new Error("Failed to create roadmap steps");
    }

    return roadmap.id;
  }

  private transformToLearnedConcepts(completedSteps: any[], applicationLogs: any[]) {
    const conceptMap = new Map<string, any>();

    // Group by knowledge content id
    completedSteps.forEach((step) => {
      const logs = applicationLogs.filter(
        (log) => log.roadmap_steps?.knowledge_content_id === step.knowledge_content_id
      );

      const latestLog = logs[0]; // Already sorted by created_at desc
      const avgRating =
        logs.length > 0
          ? logs.reduce((sum, log) => sum + (log.effectiveness_rating || 0), 0) / logs.length
          : 0;

      conceptMap.set(step.knowledge_content_id, {
        knowledgeContentId: step.knowledge_content_id,
        completedAt: latestLog?.created_at || new Date().toISOString(),
        lastReflectionAt: latestLog?.created_at || new Date().toISOString(),
        effectivenessRating: Math.round(avgRating),
        applicationCount: logs.length,
      });
    });

    return Array.from(conceptMap.values());
  }
}
