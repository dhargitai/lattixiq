import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import ReflectScreen from "../ReflectScreen";

// Mock canvas-confetti first
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

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
  rpc: vi.fn(),
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
    plan_trigger: "When I feel overwhelmed at work",
    plan_action: "Take 5 deep breaths",
    plan_created_at: "2025-01-01T10:00:00Z",
    completed_at: null,
    updated_at: null,
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
    updated_at: "2025-01-01T00:00:00Z",
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

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Mock successful RPC call for step completion
    mockSupabase.rpc.mockResolvedValue({
      data: {
        completed_step_id: "step-1",
        unlocked_step_id: "step-2",
        all_steps_completed: false,
        roadmap_completed: false,
      },
      error: null,
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

    // Verify the RPC mechanism was triggered
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
    });

    await waitFor(() => {
      // Should use RPC function for atomic step completion
      expect(mockSupabase.rpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
        p_step_id: "step-1",
        p_roadmap_id: "roadmap-1",
      });
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

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Mock RPC call for last step (no next step to unlock)
    mockSupabase.rpc.mockResolvedValue({
      data: {
        completed_step_id: "step-1",
        unlocked_step_id: null,
        all_steps_completed: true,
        roadmap_completed: true,
      },
      error: null,
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

    // Should complete using RPC
    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalled();
      expect(mockSupabase.rpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
        p_step_id: lastStep.id,
        p_roadmap_id: lastStep.roadmap_id,
      });
    });

    // Should show success dialog with completion message since all_steps_completed is true
    await waitFor(() => {
      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });

    // Click continue to navigate (shows "View Completed Roadmap" for final step)
    const user2 = userEvent.setup();
    await user2.click(screen.getByText("View Completed Roadmap"));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    });
  });

  it("should handle case when next step is already unlocked", async () => {
    // Mock successful reflection save
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Mock RPC call - next step is already unlocked, so just completes current
    mockSupabase.rpc.mockResolvedValue({
      data: {
        completed_step_id: "step-1",
        unlocked_step_id: null, // No unlock needed
        all_steps_completed: false,
        roadmap_completed: false,
      },
      error: null,
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

    // Should complete using RPC
    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalled();
      expect(mockSupabase.rpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
        p_step_id: "step-1",
        p_roadmap_id: "roadmap-1",
      });
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
});
