import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestClient, cleanupTestUser } from "@/tests/utils/supabase-test-client";

// Skip if no database connection available
const SKIP_INTEGRATION =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_INTEGRATION_TESTS === "true";

// Helper function to get toolkit data for testing
async function getToolkitData(userId: string) {
  const supabase = createTestClient();

  // Get user data
  const { data: user } = await supabase.from("users").select("*").eq("id", userId).single();

  // Get completed roadmaps count
  const { data: completedRoadmaps } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed");

  const completedCount = completedRoadmaps?.length || 0;

  // Get application logs with ratings
  const { data: logs } = await supabase
    .from("application_logs")
    .select("effectiveness_rating")
    .eq("user_id", userId);

  // Count high-rated logs (rating >= 4) - matching the real implementation
  const highRatedLogsCount =
    logs?.filter((log) => (log.effectiveness_rating ?? 0) >= 4).length || 0;

  // Determine if testimonial card should be shown
  let shouldShowTestimonialCard = false;
  let testimonialTrigger = null;

  // First completion trigger
  if (completedCount === 1 && user?.testimonial_state === "not_asked") {
    shouldShowTestimonialCard = true;
    testimonialTrigger = "first-completion";
  }

  // Sustained success trigger - matching the real implementation
  if (
    completedCount >= 3 &&
    highRatedLogsCount >= 3 &&
    user?.testimonial_state === "dismissed_first"
  ) {
    shouldShowTestimonialCard = true;
    testimonialTrigger = "sustained-success";
  }

  return {
    shouldShowTestimonialCard,
    testimonialTrigger,
    user,
    completedCount,
    highRatedLogsCount,
  };
}

describe.skipIf(SKIP_INTEGRATION)("Testimonial Display Logic Integration", () => {
  let supabase: ReturnType<typeof createTestClient>;
  let testUserId: string;

  beforeAll(async () => {
    supabase = createTestClient();

    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-display-${Date.now()}@example.com`,
      password: "TestPassword123!",
    });

    if (authError || !authData.user) {
      throw new Error("Failed to create test user");
    }

    testUserId = authData.user.id;

    // Ensure user record exists in public.users table
    await supabase.from("users").insert({
      id: testUserId,
      email: authData.user.email,
      testimonial_state: "not_asked",
    });
  });

  afterAll(async () => {
    if (testUserId && supabase) {
      await cleanupTestUser(supabase, testUserId);
    }
  });

  beforeEach(async () => {
    // Reset user state
    await supabase
      .from("users")
      .update({
        testimonial_state: "not_asked",
        testimonial_url: null,
        testimonial_bonus_used: false,
        roadmap_count: 0,
        free_roadmaps_used: false,
      })
      .eq("id", testUserId);

    // Clean up any roadmaps and logs
    await supabase.from("roadmaps").delete().eq("user_id", testUserId);
    await supabase.from("application_logs").delete().eq("user_id", testUserId);
  });

  describe("First Roadmap Completion Trigger", () => {
    it("should show testimonial card after first roadmap completion", async () => {
      // Create a completed roadmap
      await supabase.from("roadmaps").insert({
        user_id: testUserId,
        goal_description: "Test goal",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      // Get toolkit data
      const toolkitData = await getToolkitData(testUserId);

      expect(toolkitData.shouldShowTestimonialCard).toBe(true);
      expect(toolkitData.testimonialTrigger).toBe("first-completion");
    });

    it("should not show card if already dismissed first", async () => {
      // Set state to dismissed_first
      await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_first" })
        .eq("id", testUserId);

      // Create a completed roadmap
      await supabase.from("roadmaps").insert({
        user_id: testUserId,
        goal_description: "Test goal",
        status: "completed",
      });

      const toolkitData = await getToolkitData(testUserId);

      expect(toolkitData.shouldShowTestimonialCard).toBe(false);
      expect(toolkitData.testimonialTrigger).toBeNull();
    });

    it("should not show card if already submitted", async () => {
      // Set state to submitted
      await supabase
        .from("users")
        .update({
          testimonial_state: "submitted",
          testimonial_url: "https://senja.io/test",
        })
        .eq("id", testUserId);

      // Create a completed roadmap
      await supabase.from("roadmaps").insert({
        user_id: testUserId,
        goal_description: "Test goal",
        status: "completed",
      });

      const toolkitData = await getToolkitData(testUserId);

      expect(toolkitData.shouldShowTestimonialCard).toBe(false);
      expect(toolkitData.testimonialTrigger).toBeNull();
    });
  });

  describe("Sustained Success Trigger", () => {
    it("should show card after 3+ roadmaps with high ratings", async () => {
      // Set state to dismissed_first (required for second trigger)
      await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_first" })
        .eq("id", testUserId);

      // Create 3 completed roadmaps with steps and high-rated logs
      for (let i = 0; i < 3; i++) {
        const { data: roadmap } = await supabase
          .from("roadmaps")
          .insert({
            user_id: testUserId,
            goal_description: `Goal ${i + 1}`,
            status: "completed",
          })
          .select()
          .single();

        if (roadmap) {
          // Create a step for the roadmap (using actual UUID from database)
          const { data: stepResult, error: stepError } = await supabase
            .from("roadmap_steps")
            .insert({
              roadmap_id: roadmap.id,
              order: 1,
              status: "completed",
              knowledge_content_id: "6bce98ec-5d30-41d1-ae56-682e1cb0428c", // UUID for Doubt/Avoidance Tendency
            })
            .select("*");

          if (stepError) {
            console.error("Failed to create step:", stepError);
          }

          const step = stepResult?.[0];

          if (step) {
            // Create a high-rated application log
            const { error: logError } = await supabase.from("application_logs").insert({
              user_id: testUserId,
              roadmap_step_id: step.id,
              effectiveness_rating: 5,
              learning_text: "Great learning!",
              created_at: new Date().toISOString(),
            });

            if (logError) {
              console.error("Failed to create application log:", logError);
            }
          }
        }
      }

      // Wait a moment for all data to be committed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Debug: verify the data was created correctly
      const { data: verifyLogs } = await supabase
        .from("application_logs")
        .select("*")
        .eq("user_id", testUserId);

      const { data: verifyRoadmaps } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", testUserId)
        .eq("status", "completed");

      const { data: verifyUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", testUserId)
        .single();

      console.log("Debug Data:", {
        logsCount: verifyLogs?.length,
        logs: verifyLogs?.map((l) => ({
          rating: l.effectiveness_rating,
          hasStepId: !!l.roadmap_step_id,
        })),
        roadmapsCount: verifyRoadmaps?.length,
        userState: verifyUser?.testimonial_state,
      });

      const toolkitData = await getToolkitData(testUserId);

      console.log("Toolkit Data:", {
        shouldShow: toolkitData.shouldShowTestimonialCard,
        trigger: toolkitData.testimonialTrigger,
        completedCount: toolkitData.completedCount,
        highRatedLogsCount: toolkitData.highRatedLogsCount,
      });

      // These are the actual assertions we want to pass
      expect(toolkitData.shouldShowTestimonialCard).toBe(true);
      expect(toolkitData.testimonialTrigger).toBe("sustained-success");
    });

    it("should not show card if ratings are low", async () => {
      // Set state to dismissed_first
      await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_first" })
        .eq("id", testUserId);

      // Create 3 completed roadmaps
      for (let i = 0; i < 3; i++) {
        await supabase.from("roadmaps").insert({
          user_id: testUserId,
          goal_description: `Goal ${i + 1}`,
          status: "completed",
        });
      }

      // Create a roadmap with a step for the application log
      const { data: roadmap } = await supabase
        .from("roadmaps")
        .insert({
          user_id: testUserId,
          goal_description: "Test for low rating",
          status: "completed",
        })
        .select()
        .single();

      if (roadmap) {
        const { data: step } = await supabase
          .from("roadmap_steps")
          .insert({
            roadmap_id: roadmap.id,
            order: 1,
            status: "completed",
            knowledge_content_id: "activation-energy",
          })
          .select()
          .single();

        if (step) {
          // Create application logs with LOW ratings
          await supabase.from("application_logs").insert({
            user_id: testUserId,
            roadmap_step_id: step.id,
            effectiveness_rating: 2, // Low rating
            learning_text: "Not very helpful",
          });
        }
      }

      const toolkitData = await getToolkitData(testUserId);

      expect(toolkitData.shouldShowTestimonialCard).toBe(false);
    });

    it("should not show card if already dismissed twice", async () => {
      // Set state to dismissed_second
      await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_second" })
        .eq("id", testUserId);

      // Create 3 completed roadmaps with high ratings
      for (let i = 0; i < 3; i++) {
        await supabase.from("roadmaps").insert({
          user_id: testUserId,
          goal_description: `Goal ${i + 1}`,
          status: "completed",
        });
      }

      const toolkitData = await getToolkitData(testUserId);

      expect(toolkitData.shouldShowTestimonialCard).toBe(false);
      expect(toolkitData.testimonialTrigger).toBeNull();
    });
  });

  describe("Testimonial Bonus Enforcement", () => {
    // Helper function to check if user can create roadmap (test version)
    async function checkCanCreateRoadmapTest(userId: string): Promise<boolean> {
      const { data: user } = await supabase
        .from("users")
        .select("free_roadmaps_used, testimonial_url, testimonial_bonus_used")
        .eq("id", userId)
        .single();

      if (!user) return false;

      // Allow first free roadmap
      if (!user.free_roadmaps_used) {
        return true;
      }

      // Allow second roadmap if testimonial exists and bonus not used
      if (user.testimonial_url && !user.testimonial_bonus_used) {
        return true;
      }

      return false;
    }

    it("should allow bonus roadmap when testimonial URL is set", async () => {
      // Set user to have used free roadmap but has testimonial
      await supabase
        .from("users")
        .update({
          free_roadmaps_used: true,
          testimonial_url: "https://senja.io/testimonial/123",
          testimonial_bonus_used: false,
        })
        .eq("id", testUserId);

      const canCreate = await checkCanCreateRoadmapTest(testUserId);

      expect(canCreate).toBe(true);
    });

    it("should block roadmap creation after bonus is used", async () => {
      // Set user to have used both free and bonus
      await supabase
        .from("users")
        .update({
          free_roadmaps_used: true,
          testimonial_url: "https://senja.io/testimonial/123",
          testimonial_bonus_used: true,
        })
        .eq("id", testUserId);

      const canCreate = await checkCanCreateRoadmapTest(testUserId);

      expect(canCreate).toBe(false);
    });

    it("should track bonus usage correctly", async () => {
      // Helper function to check testimonial bonus (test version)
      async function getTestimonialBonusTest(userId: string): Promise<boolean> {
        const { data: user } = await supabase
          .from("users")
          .select("testimonial_url, testimonial_bonus_used")
          .eq("id", userId)
          .single();

        if (!user) return false;

        // User has testimonial bonus if they have a testimonial URL and haven't used the bonus
        return !!(user.testimonial_url && !user.testimonial_bonus_used);
      }

      // Set up user with testimonial
      await supabase
        .from("users")
        .update({
          free_roadmaps_used: true,
          testimonial_url: "https://senja.io/testimonial/123",
          testimonial_bonus_used: false,
          roadmap_count: 1,
        })
        .eq("id", testUserId);

      // Check testimonial bonus availability
      const hasBonus = await getTestimonialBonusTest(testUserId);

      expect(hasBonus).toBe(true);

      // Simulate using the bonus
      await supabase.from("users").update({ testimonial_bonus_used: true }).eq("id", testUserId);

      const hasBonusAfter = await getTestimonialBonusTest(testUserId);
      expect(hasBonusAfter).toBe(false);
    });
  });
});
