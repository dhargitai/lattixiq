import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestClient, cleanupTestUser } from "@/tests/utils/supabase-test-client";
import { getToolkitData } from "@/lib/db/toolkit";

// Skip if no database connection available
const SKIP_INTEGRATION =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_INTEGRATION_TESTS === "true";

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

      // Create 3 completed roadmaps
      const roadmapIds = [];
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
          roadmapIds.push(roadmap.id);
        }
      }

      // Create application logs with high ratings
      for (const roadmapId of roadmapIds) {
        // Create a step for the roadmap
        const { data: step } = await supabase
          .from("roadmap_steps")
          .insert({
            roadmap_id: roadmapId,
            order: 1,
            status: "completed",
            knowledge_content_id: "activation-energy", // Use a real content ID
          })
          .select()
          .single();

        if (step) {
          // Create a high-rated application log
          await supabase.from("application_logs").insert({
            user_id: testUserId,
            roadmap_step_id: step.id,
            effectiveness_rating: 5,
            learning_text: "Great learning!",
          });
        }
      }

      const toolkitData = await getToolkitData(testUserId);

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

      // Import the check function
      const { checkCanCreateRoadmap } = await import("@/lib/subscription/check-limits");
      const canCreate = await checkCanCreateRoadmap(testUserId);

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

      const { checkCanCreateRoadmap } = await import("@/lib/subscription/check-limits");
      const canCreate = await checkCanCreateRoadmap(testUserId);

      expect(canCreate).toBe(false);
    });

    it("should track bonus usage correctly", async () => {
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
      const { getTestimonialBonus } = await import("@/lib/subscription/check-limits");
      const hasBonus = await getTestimonialBonus(testUserId);

      expect(hasBonus).toBe(true);

      // Simulate using the bonus
      await supabase.from("users").update({ testimonial_bonus_used: true }).eq("id", testUserId);

      const hasBonusAfter = await getTestimonialBonus(testUserId);
      expect(hasBonusAfter).toBe(false);
    });
  });
});
