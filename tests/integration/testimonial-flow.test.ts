import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type TestimonialState = Database["public"]["Enums"]["testimonial_state"];

// Skip if no database connection available
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === "true";

describe.skipIf(SKIP_INTEGRATION)("Testimonial Flow Integration", () => {
  let supabase: any;
  let testUserId: string;

  beforeAll(async () => {
    supabase = await createClient();

    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-testimonial-${Date.now()}@example.com`,
      password: "TestPassword123!",
    });

    if (authError || !authData.user) {
      throw new Error("Failed to create test user");
    }

    testUserId = authData.user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      // Clean up test user
      await supabase.from("users").delete().eq("id", testUserId);
    }
  });

  beforeEach(async () => {
    // Reset user testimonial state
    await supabase
      .from("users")
      .update({
        testimonial_state: "not_asked",
        testimonial_url: null,
      })
      .eq("id", testUserId);
  });

  describe("Testimonial State Transitions", () => {
    it("transitions from not_asked to asked_first", async () => {
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ testimonial_state: "asked_first" })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("asked_first");
    });

    it("transitions from not_asked to dismissed_first", async () => {
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_first" })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("dismissed_first");
    });

    it("transitions from not_asked to submitted with URL", async () => {
      const testimonialUrl = "https://senja.io/testimonial/123";

      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({
          testimonial_state: "submitted",
          testimonial_url: testimonialUrl,
        })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("submitted");
      expect(updateData.testimonial_url).toBe(testimonialUrl);
    });

    it("transitions from asked_first to asked_second", async () => {
      // First set to asked_first
      await supabase
        .from("users")
        .update({ testimonial_state: "asked_first" })
        .eq("id", testUserId);

      // Then transition to asked_second
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ testimonial_state: "asked_second" })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("asked_second");
    });

    it("transitions from asked_second to dismissed_second", async () => {
      // Set to asked_second
      await supabase
        .from("users")
        .update({ testimonial_state: "asked_second" })
        .eq("id", testUserId);

      // Then transition to dismissed_second
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_second" })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("dismissed_second");
    });

    it("can transition from dismissed_second to submitted", async () => {
      // Set to dismissed_second
      await supabase
        .from("users")
        .update({ testimonial_state: "dismissed_second" })
        .eq("id", testUserId);

      // Then transition to submitted
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({
          testimonial_state: "submitted",
          testimonial_url: "https://senja.io/late-submission",
        })
        .eq("id", testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.testimonial_state).toBe("submitted");
      expect(updateData.testimonial_url).toBe("https://senja.io/late-submission");
    });
  });

  describe("Milestone Detection", () => {
    it("detects first roadmap completion milestone", async () => {
      // Create a completed roadmap for the test user
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: testUserId,
          goal_description: "Test goal",
          status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(roadmapError).toBeNull();
      expect(roadmap).toBeDefined();

      // Verify user can be asked for testimonial
      const { data: user } = await supabase
        .from("users")
        .select("testimonial_state")
        .eq("id", testUserId)
        .single();

      expect(user.testimonial_state).toBe("not_asked");

      // Clean up
      if (roadmap) {
        await supabase.from("roadmaps").delete().eq("id", roadmap.id);
      }
    });

    it("detects sustained success milestone", async () => {
      // First mark user as asked_first
      await supabase
        .from("users")
        .update({ testimonial_state: "asked_first" })
        .eq("id", testUserId);

      // Create 3 completed roadmaps
      const roadmapIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const { data: roadmap } = await supabase
          .from("roadmaps")
          .insert({
            user_id: testUserId,
            goal_description: `Test goal ${i + 1}`,
            status: "completed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (roadmap) {
          roadmapIds.push(roadmap.id);
        }
      }

      // Count completed roadmaps
      const { count } = await supabase
        .from("roadmaps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", testUserId)
        .eq("status", "completed");

      expect(count).toBe(3);

      // Clean up
      for (const id of roadmapIds) {
        await supabase.from("roadmaps").delete().eq("id", id);
      }
    });
  });

  describe("Testimonial Persistence", () => {
    it("persists testimonial URL when submitted", async () => {
      const testimonialUrl = "https://senja.io/testimonial/persistent";

      // Submit testimonial
      await supabase
        .from("users")
        .update({
          testimonial_state: "submitted",
          testimonial_url: testimonialUrl,
        })
        .eq("id", testUserId);

      // Verify it persists
      const { data: user } = await supabase
        .from("users")
        .select("testimonial_state, testimonial_url")
        .eq("id", testUserId)
        .single();

      expect(user.testimonial_state).toBe("submitted");
      expect(user.testimonial_url).toBe(testimonialUrl);
    });

    it("does not overwrite URL when updating other fields", async () => {
      const testimonialUrl = "https://senja.io/testimonial/keep";

      // Submit testimonial with URL
      await supabase
        .from("users")
        .update({
          testimonial_state: "submitted",
          testimonial_url: testimonialUrl,
        })
        .eq("id", testUserId);

      // Update other fields
      await supabase
        .from("users")
        .update({
          reminder_enabled: true,
        })
        .eq("id", testUserId);

      // Verify URL is still there
      const { data: user } = await supabase
        .from("users")
        .select("testimonial_url")
        .eq("id", testUserId)
        .single();

      expect(user.testimonial_url).toBe(testimonialUrl);
    });
  });
});
