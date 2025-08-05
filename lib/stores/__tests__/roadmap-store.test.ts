import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRoadmapStore } from "../roadmap-store";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn(),
};

const mockFrom = {
  select: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
};

// Reset store before each test
const resetStore = () => {
  useRoadmapStore.setState({
    activeRoadmap: null,
    currentStepIndex: 0,
    isLoading: false,
    error: null,
    currentStep: null,
    knowledgeContent: null,
  });
};

describe("roadmap-store - step unlocking bug", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();

    // Setup mock chain
    mockSupabase.from.mockReturnValue(mockFrom);
    mockFrom.select.mockReturnValue(mockFrom);
    mockFrom.update.mockReturnValue(mockFrom);
    mockFrom.eq.mockReturnValue(mockFrom);
    mockFrom.single.mockReturnValue(mockFrom);

    const { createClient } = require("@/lib/supabase/client");
    createClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should unlock the next step when a step is completed", async () => {
    // Setup test data
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      title: "Test Roadmap",
      status: "active",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          title: "Step 1",
          order: 0,
          status: "unlocked",
          knowledge_content: { id: "content-1", title: "Content 1" },
        },
        {
          id: "step-2",
          roadmap_id: "roadmap-1",
          title: "Step 2",
          order: 1,
          status: "locked",
          knowledge_content: { id: "content-2", title: "Content 2" },
        },
        {
          id: "step-3",
          roadmap_id: "roadmap-1",
          title: "Step 3",
          order: 2,
          status: "locked",
          knowledge_content: { id: "content-3", title: "Content 3" },
        },
      ],
    };

    // Mock successful database operations
    mockFrom.single.mockResolvedValueOnce({ data: testRoadmap, error: null });
    mockFrom.eq.mockResolvedValueOnce({ error: null }); // Step completion
    mockFrom.eq.mockResolvedValueOnce({ error: null }); // Next step unlock

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
      title: "Test Roadmap",
      status: "active",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          title: "Step 1",
          order: 0,
          status: "unlocked",
          knowledge_content: { id: "content-1", title: "Content 1" },
        },
        {
          id: "step-2",
          roadmap_id: "roadmap-1",
          title: "Step 2",
          order: 1,
          status: "locked",
          knowledge_content: { id: "content-2", title: "Content 2" },
        },
      ],
    };

    // Mock database operations with unlock failure
    mockFrom.single.mockResolvedValueOnce({ data: testRoadmap, error: null });
    mockFrom.eq
      .mockResolvedValueOnce({ error: null }) // Step completion succeeds
      .mockResolvedValueOnce({ error: new Error("Unlock failed") }); // Next step unlock fails

    // Set up the store
    useRoadmapStore.setState({ activeRoadmap: testRoadmap });

    const store = useRoadmapStore.getState();

    // Mark step 1 as completed - should not throw despite unlock failure
    await store.markStepCompleted("step-1");

    const newState = useRoadmapStore.getState();

    // Step 1 should still be completed
    const updatedStep1 = newState.activeRoadmap?.steps.find((s) => s.id === "step-1");
    expect(updatedStep1?.status).toBe("completed");

    // Step 2 should remain locked due to unlock failure
    const updatedStep2 = newState.activeRoadmap?.steps.find((s) => s.id === "step-2");
    expect(updatedStep2?.status).toBe("locked");
  });

  it("should handle edge case: last step completion", async () => {
    // Setup test data with only one step
    const testRoadmap = {
      id: "roadmap-1",
      user_id: "user-1",
      title: "Test Roadmap",
      status: "active",
      steps: [
        {
          id: "step-1",
          roadmap_id: "roadmap-1",
          title: "Step 1",
          order: 0,
          status: "unlocked",
          knowledge_content: { id: "content-1", title: "Content 1" },
        },
      ],
    };

    mockFrom.single.mockResolvedValueOnce({ data: testRoadmap, error: null });
    mockFrom.eq
      .mockResolvedValueOnce({ error: null }) // Step completion
      .mockResolvedValueOnce({ error: null }); // Roadmap completion

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
