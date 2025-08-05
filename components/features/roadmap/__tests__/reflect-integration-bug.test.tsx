import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReflectScreen from "../ReflectScreen";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock the roadmap store to return null (simulating the bug scenario)
vi.mock("@/lib/stores/roadmap-store", () => ({
  useRoadmapStore: () => ({
    markStepCompleted: vi.fn().mockRejectedValue(new Error("No active roadmap found")),
    activeRoadmap: null,
    fetchActiveRoadmap: vi.fn(),
  }),
}));

// Mock reminder cleanup
vi.mock("@/lib/notifications/reminder-cleanup", () => ({
  logReminderCleanup: vi.fn().mockResolvedValue(undefined),
}));

// Mock Supabase client
const mockUser = { id: "test-user-id" };
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
  },
  from: vi.fn(),
  rpc: vi.fn().mockResolvedValue({
    data: {
      completed_step_id: "step-1",
      unlocked_step_id: "step-2",
      all_steps_completed: false,
      roadmap_completed: false,
    },
    error: null,
  }),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

describe("ReflectScreen Integration Bug Test", () => {
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
    mockPush.mockClear();
  });

  it("should demonstrate the step unlock bug when roadmap store is empty", async () => {
    // Setup mock implementation for application logs
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return {
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        };
      }
      return {};
    });

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

    // Click rating
    const star4 = screen.getByTestId("star-4");
    await user.click(star4);

    // Submit the form
    await user.click(screen.getByTestId("submit-button"));

    // Verify the RPC function was called with correct parameters
    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
        p_step_id: "step-1",
        p_roadmap_id: "roadmap-1",
      });
    });

    // Should show success dialog
    await waitFor(() => {
      expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
    });

    // Click continue button to navigate
    const continueButton = screen.getByText("Continue to Roadmap");
    await user.click(continueButton);

    // Now wait for navigation
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/roadmap?success=true");
      },
      { timeout: 3000 }
    );

    console.log("Integration test results:");
    console.log("- RPC function called successfully");
  });
});
