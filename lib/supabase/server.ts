import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Type for the Supabase server client
type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

// Global state for E2E tests
let mockHasCreatedRoadmap = false;

// Mock Supabase client for E2E tests
class MockSupabaseClient {
  auth = {
    getUser: async () => ({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      },
      error: null,
    }),
  };

  from(table: string) {
    return {
      select: (query?: string) => ({
        eq: (_column: string, _value: unknown) => ({
          eq: (_column2: string, _value2: unknown) => ({
            single: async () => {
              // Mock responses for different tables
              if (table === "roadmaps") {
                if (
                  mockHasCreatedRoadmap &&
                  (query?.includes("roadmap_steps") || query?.includes("steps:"))
                ) {
                  // Return active roadmap with steps after creation
                  const roadmapData = {
                    id: "test-roadmap-id",
                    user_id: "test-user-id",
                    goal_description:
                      "I want to stop procrastinating on my important work projects",
                    status: "active",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  // Handle renamed field for getActiveRoadmapWithSteps
                  if (query?.includes("steps:")) {
                    return {
                      data: {
                        ...roadmapData,
                        steps: [
                          {
                            id: "step-1",
                            roadmap_id: "test-roadmap-id",
                            knowledge_content_id: "test-content-1",
                            order: 1,
                            status: "not_started",
                            plan_situation: null,
                            plan_trigger: null,
                            plan_action: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            knowledge_content: {
                              id: "test-content-1",
                              title: "First Principles Thinking",
                              type: "model",
                              category: "problem_solving",
                              summary: "Break complex problems into fundamental truths",
                              description:
                                "A problem-solving approach that involves breaking down complex problems into their most basic, foundational elements.",
                              application:
                                "Use when facing complex problems or when conventional solutions aren't working.",
                            },
                          },
                          {
                            id: "step-2",
                            roadmap_id: "test-roadmap-id",
                            knowledge_content_id: "test-content-2",
                            order: 2,
                            status: "not_started",
                            plan_situation: null,
                            plan_trigger: null,
                            plan_action: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            knowledge_content: {
                              id: "test-content-2",
                              title: "Parkinson's Law",
                              type: "model",
                              category: "productivity",
                              summary: "Work expands to fill the time available",
                              description:
                                "The observation that work expands to fill the time available for its completion.",
                              application:
                                "Set artificial deadlines to increase productivity and prevent procrastination.",
                            },
                          },
                        ],
                      },
                      error: null,
                    };
                  } else {
                    // Standard roadmap_steps field
                    return {
                      data: {
                        ...roadmapData,
                        roadmap_steps: [
                          {
                            id: "step-1",
                            order: 1,
                            status: "not_started",
                            plan_situation: null,
                            plan_trigger: null,
                            plan_action: null,
                            knowledge_content: {
                              id: "test-content-1",
                              title: "First Principles Thinking",
                              type: "model",
                              category: "problem_solving",
                              summary: "Break complex problems into fundamental truths",
                              description:
                                "A problem-solving approach that involves breaking down complex problems into their most basic, foundational elements.",
                              application:
                                "Use when facing complex problems or when conventional solutions aren't working.",
                            },
                          },
                          {
                            id: "step-2",
                            order: 2,
                            status: "not_started",
                            plan_situation: null,
                            plan_trigger: null,
                            plan_action: null,
                            knowledge_content: {
                              id: "test-content-2",
                              title: "Parkinson's Law",
                              type: "model",
                              category: "productivity",
                              summary: "Work expands to fill the time available",
                              description:
                                "The observation that work expands to fill the time available for its completion.",
                              application:
                                "Set artificial deadlines to increase productivity and prevent procrastination.",
                            },
                          },
                        ],
                      },
                      error: null,
                    };
                  }
                }
                return { data: null, error: { code: "PGRST116" } }; // No active roadmap
              }
              // Handle user_subscriptions table for billing portal
              if (table === "user_subscriptions") {
                return {
                  data: {
                    stripe_customer_id: "cus_test_customer_id",
                    user_id: "test-user-id",
                  },
                  error: null,
                };
              }
              return { data: null, error: null };
            },
            order: (_orderColumn: string, _options?: unknown) => ({
              single: async () =>
                // This is unused in our mock
                ({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
          single: async () => {
            if (table === "roadmaps") {
              return { data: null, error: { code: "PGRST116" } }; // No active roadmap
            }
            if (table === "user_subscriptions") {
              return {
                data: {
                  stripe_customer_id: "cus_test_customer_id",
                  user_id: "test-user-id",
                },
                error: null,
              };
            }
            return { data: null, error: null };
          },
        }),
        order: () => ({
          single: async () => ({ data: null, error: { code: "PGRST116" } }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => {
            if (table === "roadmaps") {
              mockHasCreatedRoadmap = true; // Mark that roadmap has been created
              return {
                data: { id: "test-roadmap-id" },
                error: null,
              };
            }
            return { data: { id: "test-id" }, error: null };
          },
        }),
      }),
    };
  }
}

export async function createClient() {
  // Return mock client in E2E test mode
  if (process.env.NEXT_PUBLIC_E2E_TEST === "true") {
    console.log("E2E test mode - using mock Supabase client");
    return new MockSupabaseClient() as unknown as SupabaseServerClient;
  }

  // Skip mock client if explicitly using real Supabase for integration tests
  if (process.env.USE_REAL_SUPABASE === "true") {
    // Fall through to real client creation
  } else if (process.env.INTEGRATION_TEST === "true" || process.env.NODE_ENV === "test") {
    // Return mock client in integration test mode
    console.log("Integration test mode - using mock Supabase client");
    const { createMockSupabaseClient, mockUsers } = await import("@/tests/utils/auth-mocks");
    return createMockSupabaseClient(mockUsers.authenticated) as unknown as SupabaseServerClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are not set (e.g., during build), return a mock client
  if (!url || !key) {
    console.warn("Supabase environment variables not set, using mock client");
    return new MockSupabaseClient() as unknown as SupabaseServerClient;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
