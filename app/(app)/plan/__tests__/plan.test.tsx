import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PlanScreen } from "@/components/features/roadmap/PlanScreen";
import { useUserSettings } from "@/lib/hooks/useUserSettings";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock useUserSettings hook
vi.mock("@/lib/hooks/useUserSettings", () => ({
  useUserSettings: vi.fn(),
}));

// Mock user-preferences client functions
vi.mock("@/lib/db/user-preferences-client", () => ({
  hasShownModalClient: vi.fn().mockResolvedValue(false),
  addShownModalClient: vi.fn().mockResolvedValue(undefined),
  generateModalId: vi.fn().mockImplementation((type, stepId) => `${type}-${stepId}`),
  migrateLocalStorageModals: vi.fn().mockResolvedValue(0),
}));

describe("Plan Screen", () => {
  const mockPush = vi.fn();
  const mockUpdateReminderSettings = vi.fn();
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
  };

  const mockStep = {
    id: "step-1",
    roadmap_id: "roadmap-1",
    knowledge_content_id: "content-1",
    status: "unlocked" as const,
    order: 1,
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    plan_created_at: null,
    completed_at: null,
    updated_at: null,
  };

  const mockKnowledgeContent = {
    id: "content-1",
    title: "First Principles Thinking",
    type: "mental-model" as const,
    summary: "Break down problems into fundamental truths",
    description: "First principles thinking is a problem-solving approach...",
    application: "Use when facing complex problems",
    category: "problem-solving",
    keywords: ["analysis", "problem-solving"],
    embedding: null,
  };

  const mockGoalExample = {
    id: "example-1",
    knowledge_content_id: "content-1",
    goal: "Make better career decisions",
    if_then_example:
      "If I'm considering a new job offer, then I will list out all the fundamental factors that matter to me (compensation, growth, work-life balance) and evaluate each option against these core principles.",
    spotting_mission_example: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({
      push: mockPush,
    });
    (createClient as Mock).mockReturnValue(mockSupabase);
    // Default mock for useUserSettings - no user data
    (useUserSettings as Mock).mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      updateReminderSettings: mockUpdateReminderSettings,
      refetch: vi.fn(),
    });
  });

  it("should display Implementation Intention form for mental models", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    expect(screen.getByText("Create Your Plan")).toBeInTheDocument();
    expect(screen.getByLabelText(/if:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/then i will:/i)).toBeInTheDocument();
  });

  it("should display Spotting Mission form for biases/fallacies", async () => {
    const biasContent = {
      ...mockKnowledgeContent,
      type: "cognitive-bias" as const,
      title: "Confirmation Bias",
    };

    const biasExample = {
      ...mockGoalExample,
      if_then_example: null,
      spotting_mission_example:
        "Watch for moments when I only seek information that confirms my existing beliefs about my career path.",
    };

    render(
      <PlanScreen step={mockStep} knowledgeContent={biasContent} goalExamples={[biasExample]} />
    );

    expect(screen.getByLabelText(/if:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/then i will:/i)).toBeInTheDocument();
  });

  it("should display goal example when available", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    expect(
      screen.getByText("📝 See example for: Make better career decisions")
    ).toBeInTheDocument();
  });

  it("should allow expand/collapse functionality of example card", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    expect(
      screen.getByText("📝 See example for: Make better career decisions")
    ).toBeInTheDocument();

    // Initially collapsed - example text should not be visible
    expect(screen.queryByText(/If I'm considering a new job offer/)).not.toBeInTheDocument();

    // Click to expand
    const exampleCard = screen
      .getByText("📝 See example for: Make better career decisions")
      .closest("button");
    await userEvent.click(exampleCard!);

    // Should now show the example text
    expect(screen.getByText(/If I'm considering a new job offer/)).toBeInTheDocument();

    // Click to collapse again
    await userEvent.click(exampleCard!);

    // Should hide the example text
    await waitFor(() => {
      expect(screen.queryByText(/If I'm considering a new job offer/)).not.toBeInTheDocument();
    });
  });

  it("should validate form fields before submission", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Clear any pre-filled values and try to submit
    const situationField = screen.getByLabelText(/if:/i) as HTMLTextAreaElement;
    const actionField = screen.getByLabelText(/then i will:/i) as HTMLTextAreaElement;

    // Clear fields to ensure they're empty
    await userEvent.clear(situationField);
    await userEvent.clear(actionField);

    // Try to submit without filling fields
    const saveButton = screen.getByText("Save Plan & Take Action");
    await userEvent.click(saveButton);

    // Check that fields have validation errors (required attribute)
    expect(situationField.validity.valueMissing).toBe(true);
    expect(actionField.validity.valueMissing).toBe(true);
  });

  it("should successfully submit plan and show modal on first save", async () => {
    const fromMock = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: {
              ...mockStep,
              plan_situation: "test",
              plan_trigger: "test",
              plan_action: "test",
            },
            error: null,
          })
        ),
      })),
    }));

    mockSupabase.from.mockImplementation(fromMock);

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Fill out the form
    const situationField = screen.getByLabelText(/if:/i);
    const actionField = screen.getByLabelText(/then i will:/i);

    await userEvent.type(situationField, "When making important career decisions");
    await userEvent.type(
      actionField,
      "I will list out the fundamental factors and evaluate each option"
    );

    // Submit the form
    const saveButton = screen.getByText("Save Plan & Take Action");
    await userEvent.click(saveButton);

    // Should update the database and show modal on first save
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("roadmap_steps");
      // Modal should appear on first save
      expect(screen.getByText(/Now it's time to put it into action/i)).toBeInTheDocument();
    });
  });

  it("should handle save failure with error message", async () => {
    const fromMock = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: null,
            error: { message: "Failed to save plan", code: "500", details: "", hint: "" },
          })
        ),
      })),
    }));

    mockSupabase.from.mockImplementation(fromMock);

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Fill out the form
    const situationField = screen.getByLabelText(/if:/i);
    const actionField = screen.getByLabelText(/then i will:/i);

    await userEvent.type(situationField, "Test situation");
    await userEvent.type(actionField, "Test action");

    // Submit the form
    const saveButton = screen.getByText("Save Plan & Take Action");
    await userEvent.click(saveButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to save plan/i)).toBeInTheDocument();
    });
  });

  it("should display unified header with help button and back navigation", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Check that header displays back navigation
    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();
    expect(screen.getByText("Back to Learn")).toBeInTheDocument();

    // Check that help button exists
    const helpButton = screen.getByRole("button", { name: /show help/i });
    expect(helpButton).toBeInTheDocument();
  });

  it("should navigate back to learn screen when back button is clicked", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    const backButton = screen.getByTestId("back-button");
    await userEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(`/learn/${mockStep.id}`);
  });

  it("should be mobile responsive", async () => {
    // Mock window resize to mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    const formContainer = screen.getByRole("form");
    // Check that the container has responsive classes (the parent container)
    const mainContainer = formContainer.closest("main");
    expect(mainContainer).toHaveClass("flex-1", "px-5", "py-8");
  });

  it("should not display goal example when none available", async () => {
    render(
      <PlanScreen step={mockStep} knowledgeContent={mockKnowledgeContent} goalExamples={[]} />
    );

    expect(screen.queryByText(/📝 See example for:/)).not.toBeInTheDocument();
  });

  it("should handle keyboard navigation for form submission", async () => {
    const fromMock = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: {
              ...mockStep,
              plan_situation: "test",
              plan_trigger: "test",
              plan_action: "test",
            },
            error: null,
          })
        ),
      })),
    }));

    mockSupabase.from.mockImplementation(fromMock);

    // Mock that modal has already been shown for this step
    const { hasShownModalClient } = await import("@/lib/db/user-preferences-client");
    vi.mocked(hasShownModalClient).mockResolvedValue(true);

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Fill out the form
    const situationField = screen.getByLabelText(/if:/i);
    const actionField = screen.getByLabelText(/then i will:/i);

    await userEvent.type(situationField, "Test situation");
    await userEvent.type(actionField, "Test action");

    // Submit the form by clicking the submit button
    const saveButton = screen.getByText("Save Plan & Take Action");
    await userEvent.click(saveButton);

    // Should update the database and navigate (no modal since already shown)
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("roadmap_steps");
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });

  it("should select correct reminder time when user has reminder_enabled and reminder_time set", async () => {
    // Mock user with reminder settings
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      reminder_enabled: true,
      reminder_time: "11:00:00",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (useUserSettings as Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null,
      updateReminderSettings: mockUpdateReminderSettings,
      refetch: vi.fn(),
    });

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={[mockGoalExample]}
      />
    );

    // Wait for the component to update with user settings
    await waitFor(() => {
      // Check that the reminder switch is enabled
      const reminderSwitch = screen.getByRole("switch", { name: /daily reminder/i });
      expect(reminderSwitch).toHaveAttribute("aria-checked", "true");
    });

    // Check that the correct time option is selected
    const timeSelector = screen.getByLabelText(/remind me at:/i) as HTMLSelectElement;
    expect(timeSelector.value).toBe("11:00:00");

    // Verify that the "11:00 AM" option is selected
    const selectedOption = timeSelector.querySelector(
      'option[value="11:00:00"]'
    ) as HTMLOptionElement;
    expect(selectedOption).not.toBeNull();
    expect(selectedOption.selected).toBe(true);
    expect(selectedOption.textContent).toBe("11:00 AM");
  });
});
