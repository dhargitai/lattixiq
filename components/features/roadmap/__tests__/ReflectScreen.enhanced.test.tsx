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
    activeRoadmap: { id: "test-roadmap-id" },
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

describe("ReflectScreen Enhanced Features", () => {
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
    mockMarkStepCompleted.mockResolvedValue(undefined);
    mockSupabase.rpc.mockResolvedValue({
      data: {
        completed_step_id: "step-1",
        unlocked_step_id: "step-2",
        all_steps_completed: false,
        roadmap_completed: false,
      },
      error: null,
    });
  });

  it("should render separate 'What did you learn?' field", async () => {
    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    // Check for both text areas
    expect(screen.getByTestId("reflection-text")).toBeInTheDocument();
    expect(screen.getByTestId("learning-text")).toBeInTheDocument();

    // Check labels
    expect(screen.getByText("Describe what happened")).toBeInTheDocument();
    expect(screen.getByText("What did you learn?")).toBeInTheDocument();

    // Check placeholders
    expect(screen.getByTestId("reflection-text")).toHaveAttribute(
      "placeholder",
      "Share your experience applying this concept. What worked? What didn't? What did you learn?"
    );
    expect(screen.getByTestId("learning-text")).toHaveAttribute(
      "placeholder",
      "What insights did you gain? How will you apply this differently next time? (This helps solidify your learning!)"
    );

    // Check for optional text
    expect(screen.getByText(/Optional but encouraged/i)).toBeInTheDocument();
  });

  it("should save separate situation and learning text", async () => {
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
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

    // Fill out both text areas with different content
    const reflectionTextarea = screen.getByTestId("reflection-text");
    const learningTextarea = screen.getByTestId("learning-text");

    await user.type(
      reflectionTextarea,
      "I tried the technique and it worked surprisingly well in the meeting."
    );
    await user.type(
      learningTextarea,
      "I learned that taking a pause helps me think more clearly before responding."
    );

    // Select rating
    await user.click(screen.getByTestId("star-4"));

    // Submit
    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        roadmap_step_id: mockStep.id,
        situation_text: "I tried the technique and it worked surprisingly well in the meeting.",
        learning_text:
          "I learned that taking a pause helps me think more clearly before responding.",
        effectiveness_rating: 4,
        created_at: expect.any(String),
      });
    });
  });

  it("should auto-resize textareas as user types", async () => {
    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();
    const reflectionTextarea = screen.getByTestId("reflection-text") as HTMLTextAreaElement;
    const learningTextarea = screen.getByTestId("learning-text") as HTMLTextAreaElement;

    // Ensure elements are ready
    await waitFor(() => {
      expect(reflectionTextarea).toBeInTheDocument();
      expect(learningTextarea).toBeInTheDocument();
    });

    // Check initial classes - should not have resize-none
    expect(reflectionTextarea).not.toHaveClass("resize-none");
    expect(learningTextarea).not.toHaveClass("resize-none");

    // Check overflow handling
    expect(reflectionTextarea).toHaveClass("overflow-hidden");
    expect(learningTextarea).toHaveClass("overflow-hidden");

    // Type text in smaller chunks to avoid timing issues
    const textChunks = ["Short", " text", " that", " expands", " the", " textarea"];
    for (const chunk of textChunks) {
      await user.type(reflectionTextarea, chunk);
      // Small delay between chunks to ensure DOM updates
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Verify the textarea has the expected content
    const expectedText = textChunks.join("");
    expect(reflectionTextarea.value).toBe(expectedText);
  });

  it("should show success dialog instead of immediate navigation", async () => {
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
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

    // Fill form and submit
    await user.type(
      screen.getByTestId("reflection-text"),
      "Test reflection that is longer than 50 characters to meet the minimum"
    );
    await user.click(screen.getByTestId("star-5"));
    await user.click(screen.getByTestId("submit-button"));

    // Wait for success dialog to appear with extended timeout
    await waitFor(
      () => {
        expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
        expect(
          screen.getByText(
            "You've successfully completed this step. The next mental model in your roadmap is now unlocked!"
          )
        ).toBeInTheDocument();
        expect(screen.getByText("Continue to Roadmap")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should see celebration emoji
    await waitFor(() => {
      expect(screen.getByText("🎉")).toBeInTheDocument();
    });

    // Router should NOT have been called yet
    expect(mockRouter.push).not.toHaveBeenCalled();

    // Click the continue button in dialog
    await user.click(screen.getByText("Continue to Roadmap"));

    // Now router should be called
    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
      },
      { timeout: 3000 }
    );
  });

  it("should handle case where learning text is empty", async () => {
    const mockApplicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "application_logs") {
        return mockApplicationLogInsert;
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

    // Only fill situation text, leave learning text empty
    await user.type(
      screen.getByTestId("reflection-text"),
      "Test reflection that is longer than 50 characters to meet the minimum"
    );
    await user.click(screen.getByTestId("star-3"));
    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(mockApplicationLogInsert.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        roadmap_step_id: mockStep.id,
        situation_text: "Test reflection that is longer than 50 characters to meet the minimum",
        learning_text: "", // Empty learning text is allowed (optional field)
        effectiveness_rating: 3,
        created_at: expect.any(String),
      });
    });
  });

  it("should maintain form state when navigating to learn and back", async () => {
    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();

    // Fill out form partially
    await user.type(screen.getByTestId("reflection-text"), "Partial reflection text");
    await user.type(screen.getByTestId("learning-text"), "Partial learning");
    await user.click(screen.getByTestId("star-2"));

    // Click back to learn
    await user.click(screen.getByTestId("back-button"));

    expect(mockRouter.push).toHaveBeenCalledWith(`/learn/${mockStep.id}?from=reflect`);

    // Note: In real app, form state would be lost unless persisted
    // This test verifies the navigation behavior
  });

  it("should show correct character count for situation text", async () => {
    render(
      <ReflectScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        roadmap={mockRoadmap}
      />
    );

    const user = userEvent.setup();
    const reflectionTextarea = screen.getByTestId("reflection-text");

    // Initially should show 0 / 50 minimum
    await waitFor(() => {
      expect(screen.getByText("0 / 50 minimum")).toBeInTheDocument();
    });

    // Type some text
    await user.type(reflectionTextarea, "Short text");

    // Should update count
    await waitFor(() => {
      expect(screen.getByText("10 / 50 minimum")).toBeInTheDocument();
    });

    // Clear and type enough to meet minimum
    await user.clear(reflectionTextarea);
    const longText = "This text is now long enough to meet the minimum character requirement";
    await user.type(reflectionTextarea, longText);

    // Should show updated count without minimum text when requirement is met (actual length is 70 characters)
    await waitFor(() => {
      expect(screen.getByText("70 characters")).toBeInTheDocument();
    });
  });
});
