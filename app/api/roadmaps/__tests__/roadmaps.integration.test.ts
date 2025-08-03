import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

/**
 * Integration tests for the /api/roadmaps endpoint
 * These tests use the real database and API to ensure end-to-end functionality
 *
 * Requirements:
 * 1. Local Supabase must be running: `supabase start`
 * 2. Next.js dev server must be running: `npm run dev`
 * 3. Environment variables must be configured in .env.local
 *
 * If these requirements aren't met, tests will be skipped automatically.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Skip tests if Supabase credentials aren't available
const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

describe.skipIf(!hasSupabaseCredentials)("/api/roadmaps Integration Tests", () => {
  let supabase: ReturnType<typeof createClient>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // This should never happen due to skipIf, but TypeScript needs assurance
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not available");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: "test-password-123",
    });

    if (authError || !authData.user) {
      throw new Error("Failed to create test user");
    }

    authToken = authData.session?.access_token || "";
    userId = authData.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId && supabase) {
      await supabase.from("roadmaps").delete().eq("user_id", userId);
      await supabase.auth.admin.deleteUser(userId);
    }
  });

  it("should create a roadmap with real data and embeddings", async () => {
    const response = await fetch(`${appUrl}/api/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        goalDescription:
          "I want to overcome procrastination and be more productive with my daily tasks",
      }),
    });

    expect(response.status).toBe(201);

    const roadmap = await response.json();

    // Verify roadmap structure
    expect(roadmap).toMatchObject({
      id: expect.any(String),
      userId,
      title: expect.any(String),
      goalDescription:
        "I want to overcome procrastination and be more productive with my daily tasks",
      status: "active",
      createdAt: expect.any(String),
    });

    // Verify we got 5-7 steps as expected
    expect(roadmap.steps).toHaveLength(expect.any(Number));
    expect(roadmap.steps.length).toBeGreaterThanOrEqual(5);
    expect(roadmap.steps.length).toBeLessThanOrEqual(7);

    // Verify first step is unlocked
    expect(roadmap.steps[0].status).toBe("unlocked");

    // Verify subsequent steps are locked
    for (let i = 1; i < roadmap.steps.length; i++) {
      expect(roadmap.steps[i].status).toBe("locked");
    }

    // Verify each step has knowledge content
    roadmap.steps.forEach((step: any) => {
      expect(step.knowledgeContent).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        type: expect.stringMatching(/^(mental-model|cognitive-bias|fallacy)$/),
        summary: expect.any(String),
      });
    });
  });

  it("should return relevant mental models for productivity goals", async () => {
    const response = await fetch(`${appUrl}/api/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        goalDescription:
          "I need to manage my time better and stop wasting hours on unimportant tasks",
      }),
    });

    expect(response.status).toBe(201);

    const roadmap = await response.json();

    // Check that we got productivity-related mental models
    const titles = roadmap.steps.map((step: any) => step.knowledgeContent.title.toLowerCase());
    // Should include some productivity-focused mental models
    const productivityKeywords = [
      "parkinson",
      "eisenhower",
      "pareto",
      "80/20",
      "time",
      "priority",
      "focus",
    ];
    const hasProductivityContent = titles.some((title: string) =>
      productivityKeywords.some((keyword) => title.includes(keyword))
    );

    expect(hasProductivityContent).toBe(true);
  });

  it("should handle authentication errors", async () => {
    const response = await fetch(`${appUrl}/api/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No auth token
      },
      body: JSON.stringify({
        goalDescription: "Test goal without authentication",
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should validate goal description length", async () => {
    const response = await fetch(`${appUrl}/api/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        goalDescription: "Too short",
      }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toContain("at least 10 characters");
  });

  it("should complete within 5 seconds", async () => {
    const startTime = Date.now();

    const response = await fetch(`${appUrl}/api/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        goalDescription: "I want to make better decisions in my personal and professional life",
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
