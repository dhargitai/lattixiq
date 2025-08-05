import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRoadmapStore } from "../roadmap-store";
import type { Roadmap } from "@/lib/supabase/types";
import {
  createSupabaseMock,
  createSupabaseMockWithData,
} from "@/tests/test-utils/supabase-mock-factory";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client module
vi.mock("@/lib/supabase/client");

let mockSupabase: ReturnType<typeof createSupabaseMock>;

// Reset store before each test
const resetStore = () => {
  useRoadmapStore.setState({
    activeRoadmap: null,
    currentStepIndex: 0,
    isLoading: false,
    error: null,
    currentStep: null,
    knowledgeContent: null,
    cacheMetadata: {
      lastFetched: null,
      ttl: 5 * 60 * 1000,
      userId: null,
    },
  });
};

describe("roadmap-store - step unlocking bug", () => {
  it("should use cached data when cache is valid", async () => {
    const userId = "user-1";
    const testRoadmap = {
      id: "roadmap-1",
      user_id: userId,
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-1",
          order: 0,
          status: "unlocked" as const,
          knowledge_content: { id: "content-1", title: "Content 1" } as any,
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    } as Roadmap;

    // Create mock with specific data
    mockSupabase = createSupabaseMockWithData({
      roadmaps: {
        data: testRoadmap,
        error: null,
      },
    });
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const store = useRoadmapStore.getState();

    // First fetch should hit the database
    await store.fetchActiveRoadmap(userId);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);

    // Second fetch should use cache
    await store.fetchActiveRoadmap(userId);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Still only 1 call

    // Force refresh should hit database again
    await store.fetchActiveRoadmap(userId, true);
    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });

  it("should invalidate cache when TTL expires", async () => {
    const userId = "user-1";
    const testRoadmap = {
      id: "roadmap-1",
      user_id: userId,
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [],
    } as Roadmap;

    mockSupabase = createSupabaseMockWithData({
      roadmaps: {
        data: testRoadmap,
        error: null,
      },
    });
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    // Set a very short TTL for testing BEFORE getting the store
    useRoadmapStore.setState({
      cacheMetadata: {
        lastFetched: null,
        ttl: 50, // 50ms for faster test
        userId: null,
      },
    });

    const store = useRoadmapStore.getState();

    // First fetch
    await store.fetchActiveRoadmap(userId);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);

    // Verify cache was populated
    const stateAfterFirstFetch = useRoadmapStore.getState();
    expect(stateAfterFirstFetch.cacheMetadata.userId).toBe(userId);
    expect(stateAfterFirstFetch.cacheMetadata.lastFetched).toBeTruthy();

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Second fetch should hit database because cache expired
    await store.fetchActiveRoadmap(userId);
    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });

  it("should invalidate cache for different user", async () => {
    const userId1 = "user-1";
    const userId2 = "user-2";
    const testRoadmap = {
      id: "roadmap-1",
      user_id: userId1,
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [],
    } as Roadmap;

    mockSupabase = createSupabaseMockWithData({
      roadmaps: {
        data: testRoadmap,
        error: null,
      },
    });
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const store = useRoadmapStore.getState();

    // Fetch for user 1
    await store.fetchActiveRoadmap(userId1);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);

    // Fetch for user 2 should hit database (different user)
    await store.fetchActiveRoadmap(userId2);
    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });

  it("should update cache timestamp when step is completed", async () => {
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-1",
          order: 0,
          status: "unlocked" as const,
          knowledge_content: { id: "content-1", title: "Content 1" },
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    } as Roadmap;

    const initialTimestamp = Date.now() - 1000; // 1 second ago
    useRoadmapStore.setState({
      activeRoadmap: testRoadmap,
      cacheMetadata: {
        lastFetched: initialTimestamp,
        ttl: 5 * 60 * 1000,
        userId: "user-1",
      },
    });

    const store = useRoadmapStore.getState();
    await store.markStepCompleted("step-1");

    const newState = useRoadmapStore.getState();
    expect(newState.cacheMetadata.lastFetched).toBeGreaterThan(initialTimestamp);
  });

  it("should clear cache on resetState", () => {
    useRoadmapStore.setState({
      activeRoadmap: { id: "test" } as any,
      cacheMetadata: {
        lastFetched: Date.now(),
        ttl: 5 * 60 * 1000,
        userId: "user-1",
      },
    });

    const store = useRoadmapStore.getState();
    store.resetState();

    const newState = useRoadmapStore.getState();
    expect(newState.cacheMetadata.lastFetched).toBeNull();
    expect(newState.cacheMetadata.userId).toBeNull();
    expect(newState.activeRoadmap).toBeNull();
  });
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();

    // Create a new mock for each test
    mockSupabase = createSupabaseMock();

    // Mock the createClient function
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockSupabase.__reset();
  });

  it("should unlock the next step when a step is completed", async () => {
    // Setup test data
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-1",
          order: 0,
          status: "unlocked" as const,
          knowledge_content: { id: "content-1", title: "Content 1" } as any,
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "step-2",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-2",
          order: 1,
          status: "locked" as const,
          knowledge_content: { id: "content-2", title: "Content 2" } as any,
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "step-3",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-3",
          order: 2,
          status: "locked" as const,
          knowledge_content: { id: "content-3", title: "Content 3" } as any,
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    };

    // No need to override anything - the default mock will handle the RPC call correctly

    // Set up the store with the test roadmap
    useRoadmapStore.setState({ activeRoadmap: testRoadmap });

    // Get the store instance
    const store = useRoadmapStore.getState();

    // Mark step 1 as completed
    await store.markStepCompleted("step-1");

    // Verify the state
    const newState = useRoadmapStore.getState();

    // Check that step 1 is completed
    const updatedStep1 = newState.activeRoadmap?.steps.find((s) => s.id === "step-1");
    expect(updatedStep1?.status).toBe("completed");

    // Check that step 2 is unlocked
    const updatedStep2 = newState.activeRoadmap?.steps.find((s) => s.id === "step-2");
    expect(updatedStep2?.status).toBe("unlocked");

    // Check that step 3 is still locked
    const updatedStep3 = newState.activeRoadmap?.steps.find((s) => s.id === "step-3");
    expect(updatedStep3?.status).toBe("locked");
  });

  it("should handle database errors during next step unlocking", async () => {
    // Setup test data
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-1",
          order: 0,
          status: "unlocked" as const,
          knowledge_content: { id: "content-1", title: "Content 1" } as any,
          plan_situation: "test situation",
          plan_trigger: "test trigger",
          plan_action: "test action",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "step-2",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-2",
          order: 1,
          status: "locked" as const,
          knowledge_content: { id: "content-2", title: "Content 2" } as any,
          plan_situation: "test situation",
          plan_trigger: "test trigger",
          plan_action: "test action",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    } as Roadmap;

    // Mock RPC to fail on unlock operation
    (mockSupabase.rpc as ReturnType<typeof vi.fn>) = vi.fn(
      (functionName: string, _params?: unknown) => {
        if (functionName === "complete_step_and_unlock_next") {
          // Simulate a failure in the RPC function (e.g., unlock constraint violation)
          return Promise.resolve({
            data: null,
            error: {
              message: "Failed to unlock next step: Foreign key constraint violation",
            },
          });
        }
        return Promise.resolve({ data: null, error: null });
      }
    );

    // Set up the store
    useRoadmapStore.setState({ activeRoadmap: testRoadmap });

    const store = useRoadmapStore.getState();

    // Mark step 1 as completed - should throw when unlock fails
    let errorThrown = false;
    try {
      await store.markStepCompleted("step-1");
    } catch (error) {
      errorThrown = true;
      expect((error as Error).message).toContain(
        "Failed to update step: Failed to unlock next step"
      );
    }

    expect(errorThrown).toBe(true);

    const newState = useRoadmapStore.getState();

    // Step 1 should NOT be marked as completed in local state due to the error
    const updatedStep1 = newState.activeRoadmap?.steps.find((s) => s.id === "step-1");
    expect(updatedStep1?.status).toBe("unlocked");

    // Step 2 should remain locked due to unlock failure
    const updatedStep2 = newState.activeRoadmap?.steps.find((s) => s.id === "step-2");
    expect(updatedStep2?.status).toBe("locked");
  });

  it("should handle edge case: last step completion", async () => {
    // Setup test data with only one step
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      status: "active" as const,
      completed_at: null,
      created_at: "2025-01-01T00:00:00Z",
      goal_description: "Test goal description",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          knowledge_content_id: "content-1",
          order: 0,
          status: "unlocked" as const,
          knowledge_content: { id: "content-1", title: "Content 1" },
          plan_situation: "test",
          plan_trigger: "test",
          plan_action: "test",
          plan_created_at: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    } as Roadmap;

    // Mock RPC for last step completion (roadmap should be marked as completed)
    (mockSupabase.rpc as ReturnType<typeof vi.fn>) = vi.fn(
      (functionName: string, _params?: unknown) => {
        if (functionName === "complete_step_and_unlock_next") {
          // Last step completed, no next step to unlock
          return Promise.resolve({
            data: {
              completed_step_id: (_params as { p_step_id?: string })?.p_step_id || "step-1",
              unlocked_step_id: null,
              all_steps_completed: true,
              roadmap_completed: true,
            },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      }
    );

    useRoadmapStore.setState({ activeRoadmap: testRoadmap });

    const store = useRoadmapStore.getState();

    await store.markStepCompleted("step-1");

    const newState = useRoadmapStore.getState();

    // Step 1 should be completed
    const updatedStep1 = newState.activeRoadmap?.steps.find((s) => s.id === "step-1");
    expect(updatedStep1?.status).toBe("completed");

    // Roadmap should be marked as completed
    expect(newState.activeRoadmap?.status).toBe("completed");
  });
});
