import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import ReflectScreen from "../ReflectScreen";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

vi.mock("@/lib/notifications/reminder-cleanup", () => ({
  logReminderCleanup: vi.fn().mockResolvedValue(undefined),
}));

// Mock the roadmap store
const mockMarkStepCompleted = vi.fn();
const mockFetchActiveRoadmap = vi.fn();
vi.mock("@/lib/stores/roadmap-store", () => ({
  useRoadmapStore: () => ({
    markStepCompleted: mockMarkStepCompleted,
    activeRoadmap: null, // This simulates the bug scenario - no active roadmap
    fetchActiveRoadmap: mockFetchActiveRoadmap,
  }),
}));

// Define mockSupabase and mockRouter
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};

describe("ReflectScreen Step Unlock Bug", () => {
  const mockUser = { id: "test-user-id" };
  const mockStep = {
    id: "step-1",
    knowledge_content_id: "content-1",
    roadmap_id: "roadmap-1",
    order: 0,
    status: "unlocked" as const,
    plan_situation: "When I feel overwhelmed",
    plan_trigger: "at work",
    plan_action: "Take 5 deep breaths",
    plan_created_at: "2025-01-01T10:00:00Z",
  };

  const mockNextStep = {
    id: "step-2",
    knowledge_content_id: "content-2",
    roadmap_id: "roadmap-1",
    order: 1,
    status: "locked" as const,
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    plan_created_at: null,
  };

  const mockKnowledgeContent = {
    id: "content-1",
    title: "Test Mental Model",
    content: "Test content",
    application: "Test application",
    category: "cognitive-bias",
    description: "Test description",
    embedding: null,
    keywords: ["test"],
    summary: "Test summary",
    type: "mental-model" as const,
  };

  const mockRoadmap = {
    id: "roadmap-1",
    user_id: "test-user-id",
    goal_description: "Test goal",
    completed_at: null,
    created_at: "2025-01-01T00:00:00Z",
    status: "active" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRouter as any).mockReturnValue(mockRouter);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    // Mock the roadmap store to simulate "No active roadmap found" error
    mockMarkStepCompleted.mockRejectedValue(new Error("No active roadmap found"));
  });

  it("should unlock next step when roadmap store fails but reflection succeeds", async () => {
    // Mock successful reflection save
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    // Mock successful step update
    const mockStepUpdate = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    // Mock successful next step query and unlock
    const mockNextStepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockNextStep, error: null }),
    };

    const mockNextStepUnlock = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      if (table === "roadmap_steps") {
        // For the step update call
        if (mockStepUpdate.update.mock.calls.length === 0) {
          return mockStepUpdate;
        }
        // For the next step query call
        if (mockNextStepQuery.select.mock.calls.length === 0) {
          return mockNextStepQuery;
        }
        // For the next step unlock call
        return mockNextStepUnlock;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Render the component
    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();

    // Fill out the form
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "This is a test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    // Click the 4th star for rating
    const star4 = screen.getByTestId("star-4");
    await user.click(star4);

    // Submit the form
    await user.click(screen.getByTestId("submit-button"));

    // Verify the fallback mechanism was triggered
    await waitFor(() => {
      // Should save reflection first
      expect(mockApplicationLogInsert.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        roadmap_step_id: mockStep.id,
        situation_text: expect.any(String),
        learning_text: expect.any(String),
        effectiveness_rating: 4,
        created_at: expect.any(String),
      });

      // Should try the roadmap store first (which fails)
      expect(mockMarkStepCompleted).toHaveBeenCalledWith(mockStep.id);
    });

    await waitFor(() => {
      // Should fall back to direct database update for current step
      expect(mockStepUpdate.update).toHaveBeenCalledWith({ status: "completed" });
      expect(mockStepUpdate.eq).toHaveBeenCalledWith("id", mockStep.id);
    });

    await waitFor(() => {
      // Should query for next step
      expect(mockNextStepQuery.select).toHaveBeenCalledWith("id, status, order");
      expect(mockNextStepQuery.eq).toHaveBeenCalledWith("roadmap_id", mockStep.roadmap_id);
      expect(mockNextStepQuery.gt).toHaveBeenCalledWith("order", mockStep.order);
    });

    await waitFor(() => {
      // BUG: This is what should happen but currently doesn't
      // Should unlock the next step since it's status is "locked"
      expect(mockNextStepUnlock.update).toHaveBeenCalledWith({ status: "unlocked" });
      expect(mockNextStepUnlock.eq).toHaveBeenCalledWith("id", mockNextStep.id);
    });

    // Should show success dialog
    await waitFor(() => {
      expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
    });

    // Click continue to navigate
    const user2 = userEvent.setup();
    await user2.click(screen.getByText("Continue to Roadmap"));

    await waitFor(() => {
      // Should navigate back to roadmap
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    });
  });

  it("should handle case when next step does not exist", async () => {
    // Mock successful reflection save
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    // Mock successful step update
    const mockStepUpdate = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    // Mock no next step found
    const mockNextStepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      if (table === "roadmap_steps") {
        // For the step update call
        if (mockStepUpdate.update.mock.calls.length === 0) {
          return mockStepUpdate;
        }
        // For the next step query call
        return mockNextStepQuery;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Use the last step in roadmap
    const lastStep = { ...mockStep, order: 4 };

    render(
      <ReflectScreen
        step={lastStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();

    // Fill out and submit form
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "This is a test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    const star3 = screen.getByTestId("star-3");
    await user.click(star3);

    await user.click(screen.getByTestId("submit-button"));

    // Should complete without trying to unlock non-existent next step
    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalled();
      expect(mockStepUpdate.update).toHaveBeenCalledWith({ status: "completed" });
      expect(mockNextStepQuery.single).toHaveBeenCalled();
    });

    // Should show success dialog
    await waitFor(() => {
      expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
    });

    // Click continue to navigate
    const user2 = userEvent.setup();
    await user2.click(screen.getByText("Continue to Roadmap"));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    });
  });

  it("should handle case when next step is already unlocked", async () => {
    const alreadyUnlockedStep = { ...mockNextStep, status: "unlocked" as const };

    // Mock successful reflection save and step update
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    const mockStepUpdate = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    // Mock next step is already unlocked
    const mockNextStepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: alreadyUnlockedStep, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      if (table === "roadmap_steps") {
        // For the step update call
        if (mockStepUpdate.update.mock.calls.length === 0) {
          return mockStepUpdate;
        }
        // For the next step query call
        return mockNextStepQuery;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();

    // Fill out and submit form
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "This is a test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    const star2 = screen.getByTestId("star-2");
    await user.click(star2);

    await user.click(screen.getByTestId("submit-button"));

    // Should complete without trying to unlock already unlocked step
    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalled();
      expect(mockStepUpdate.update).toHaveBeenCalledWith({ status: "completed" });
      expect(mockNextStepQuery.single).toHaveBeenCalled();
    });

    // Should show success dialog
    await waitFor(() => {
      expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
    });

    // Click continue to navigate
    const user2 = userEvent.setup();
    await user2.click(screen.getByText("Continue to Roadmap"));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    });

    // Should NOT try to unlock since it's already unlocked
    await waitFor(() => {
      const roadmapStepsCalls = mockSupabase.from.mock.calls.filter(
        (call) => call[0] === "roadmap_steps"
      );
      // Should only be 2 calls: step update and next step query (no unlock)
      expect(roadmapStepsCalls).toHaveLength(2);
    });
  });
});
