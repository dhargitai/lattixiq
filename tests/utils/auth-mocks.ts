import type { User } from "@supabase/supabase-js";

export const mockUsers = {
  authenticated: {
    id: "test-user-123",
    email: "test@example.com",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User,

  premium: {
    id: "premium-user-456",
    email: "premium@example.com",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { subscription: "premium" },
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User,

  admin: {
    id: "admin-user-789",
    email: "admin@example.com",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { role: "admin" },
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User,
};

export function createMockSupabaseClient(user: User | null = mockUsers.authenticated) {
  return {
    auth: {
      getUser: async () => ({
        data: { user },
        error: user ? null : new Error("Not authenticated"),
      }),
      getSession: async () => ({
        data: {
          session: user
            ? {
                access_token: "mock-access-token",
                refresh_token: "mock-refresh-token",
                expires_in: 3600,
                token_type: "bearer",
                user,
              }
            : null,
        },
        error: user ? null : new Error("Not authenticated"),
      }),
    },
    rpc: async (functionName: string, _params?: Record<string, unknown>) => {
      // Mock for match_knowledge_content RPC
      if (functionName === "match_knowledge_content") {
        return {
          data: [
            {
              id: "pareto-principle",
              title: "Pareto Principle",
              type: "mental-model",
              category: "productivity",
              summary: "80% of effects come from 20% of causes",
              similarity: 0.95,
            },
            {
              id: "first-principles",
              title: "First Principles Thinking",
              type: "mental-model",
              category: "problem_solving",
              summary: "Break down problems to fundamental truths",
              similarity: 0.92,
            },
            {
              id: "parkinsons-law",
              title: "Parkinson's Law",
              type: "mental-model",
              category: "productivity",
              summary: "Work expands to fill time",
              similarity: 0.88,
            },
            {
              id: "confirmation-bias",
              title: "Confirmation Bias",
              type: "cognitive-bias",
              category: "reasoning",
              summary: "Favor confirming evidence",
              similarity: 0.85,
            },
            {
              id: "sunk-cost-fallacy",
              title: "Sunk Cost Fallacy",
              type: "cognitive-bias",
              category: "decision_making",
              summary: "Continue due to past investment",
              similarity: 0.82,
            },
            {
              id: "eisenhower-matrix",
              title: "Eisenhower Matrix",
              type: "mental-model",
              category: "productivity",
              summary: "Prioritize by urgency and importance",
              similarity: 0.78,
            },
            {
              id: "dunning-kruger",
              title: "Dunning-Kruger Effect",
              type: "cognitive-bias",
              category: "reasoning",
              summary: "Overestimate competence when unskilled",
              similarity: 0.75,
            },
          ],
          error: null,
        };
      }
      return { data: null, error: null };
    },
    from: (table: string) => {
      const queryBuilder: {
        select: (_query?: string) => typeof queryBuilder;
        eq: (_column: string, _value: unknown) => typeof queryBuilder;
        neq: (_column: string, _value: unknown) => typeof queryBuilder;
        in: (_column: string, _values: unknown[]) => typeof queryBuilder;
        order: (_column: string, _options?: unknown) => typeof queryBuilder;
        single: () => Promise<{ data: unknown; error: unknown }>;
        then: (resolve: (value: { data: unknown; error: unknown }) => void) => void;
        insert: (data: unknown) => {
          select: () => {
            single: () => Promise<{ data: { id: string }; error: unknown }>;
          };
        };
        update: (data: unknown) => {
          eq: (
            _column: string,
            _value: unknown
          ) => {
            select: () => {
              single: () => Promise<{ data: Record<string, unknown>; error: unknown }>;
            };
          };
        };
        delete: () => {
          eq: (_column: string, _value: unknown) => { data: null; error: null };
        };
      } = {
        select: (_query?: string) => queryBuilder,
        eq: (_column: string, _value: unknown) => queryBuilder,
        neq: (_column: string, _value: unknown) => queryBuilder,
        in: (_column: string, _values: unknown[]) => queryBuilder,
        order: (_column: string, _options?: unknown) => queryBuilder,
        single: async () => {
          // Mock for checking existing active roadmap
          if (table === "roadmaps") {
            return { data: null, error: { code: "PGRST116" } }; // No active roadmap
          }
          if (table === "knowledge_content") {
            // Return mock knowledge content
            return {
              data: {
                id: "pareto-principle",
                title: "Pareto Principle",
                type: "mental-model",
                category: "productivity",
                summary: "80% of effects come from 20% of causes",
                description:
                  "The Pareto Principle states that roughly 80% of effects come from 20% of causes.",
                application:
                  "Use to prioritize tasks and focus resources on high-impact activities.",
                keywords: ["productivity", "prioritization"],
                embedding: null,
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        then: async (resolve: (value: { data: unknown; error: unknown }) => void) => {
          // Mock for getUserLearningHistory and other multi-row queries
          if (table === "application_logs") {
            resolve({ data: [], error: null });
          } else if (table === "roadmap_steps") {
            resolve({ data: [], error: null });
          } else if (table === "knowledge_content") {
            // Return multiple knowledge content items for queries
            resolve({
              data: [
                {
                  id: "pareto-principle",
                  title: "Pareto Principle",
                  type: "mental-model",
                  category: "productivity",
                  summary: "80% of effects come from 20% of causes",
                  description:
                    "The Pareto Principle states that roughly 80% of effects come from 20% of causes.",
                  application:
                    "Use to prioritize tasks and focus resources on high-impact activities.",
                  keywords: ["productivity", "prioritization"],
                  embedding: null,
                },
                {
                  id: "first-principles",
                  title: "First Principles Thinking",
                  type: "mental-model",
                  category: "problem_solving",
                  summary: "Break down problems to fundamental truths",
                  description:
                    "A problem-solving approach that involves breaking down complex problems.",
                  application: "Use when facing complex problems or seeking innovative solutions.",
                  keywords: ["problem-solving", "innovation"],
                  embedding: null,
                },
                {
                  id: "parkinsons-law",
                  title: "Parkinson's Law",
                  type: "mental-model",
                  category: "productivity",
                  summary: "Work expands to fill time available",
                  description: "Work expands to fill the time available for its completion.",
                  application: "Set shorter deadlines to boost productivity.",
                  keywords: ["productivity", "time-management"],
                  embedding: null,
                },
                {
                  id: "confirmation-bias",
                  title: "Confirmation Bias",
                  type: "cognitive-bias",
                  category: "reasoning",
                  summary: "Tendency to favor confirming evidence",
                  description:
                    "The tendency to search for information that confirms existing beliefs.",
                  application: "Actively seek opposing viewpoints.",
                  keywords: ["bias", "reasoning"],
                  embedding: null,
                },
                {
                  id: "sunk-cost-fallacy",
                  title: "Sunk Cost Fallacy",
                  type: "cognitive-bias",
                  category: "decision_making",
                  summary: "Continue due to past investment",
                  description: "Continuing a behavior because of previously invested resources.",
                  application: "Evaluate decisions based on future benefits only.",
                  keywords: ["decision-making", "bias"],
                  embedding: null,
                },
                {
                  id: "eisenhower-matrix",
                  title: "Eisenhower Matrix",
                  type: "mental-model",
                  category: "productivity",
                  summary: "Prioritize by urgency and importance",
                  description: "A decision matrix that helps prioritize tasks.",
                  application: "Categorize tasks into four quadrants.",
                  keywords: ["productivity", "prioritization"],
                  embedding: null,
                },
                {
                  id: "dunning-kruger",
                  title: "Dunning-Kruger Effect",
                  type: "cognitive-bias",
                  category: "reasoning",
                  summary: "Overestimate competence when unskilled",
                  description:
                    "The tendency for incompetent people to overestimate their competence.",
                  application: "Seek feedback and continuous learning.",
                  keywords: ["bias", "self-awareness"],
                  embedding: null,
                },
              ],
              error: null,
            });
          } else {
            resolve({ data: null, error: null });
          }
        },
        insert: (_data: unknown) => ({
          select: () => ({
            single: async () => {
              if (table === "roadmaps") {
                return { data: { id: `test-roadmap-${Date.now()}` }, error: null };
              }
              if (table === "roadmap_steps") {
                return { data: { id: `test-step-${Date.now()}` }, error: null };
              }
              return { data: { id: "mock-id" }, error: null };
            },
          }),
        }),
        update: (_data: unknown) => ({
          eq: (_column: string, _value: unknown) => ({
            select: () => ({
              single: async () => ({ data: {}, error: null }),
            }),
          }),
        }),
        delete: () => ({
          eq: (_column: string, _value: unknown) => ({ data: null, error: null }),
        }),
      };
      return queryBuilder;
    },
  };
}

export function setupIntegrationTestAuth() {
  process.env.INTEGRATION_TEST = "true";
  // Ensure E2E mode is disabled
  delete process.env.NEXT_PUBLIC_E2E_TEST;
}

export function teardownIntegrationTestAuth() {
  delete process.env.INTEGRATION_TEST;
}
