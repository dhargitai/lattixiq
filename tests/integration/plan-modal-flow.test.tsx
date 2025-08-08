import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanScreen } from "@/components/features/roadmap/PlanScreen";
import { createClient } from "@/lib/supabase/client";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("@/lib/supabase/client");
vi.mock("@/lib/hooks/useUserSettings");
vi.mock("next/navigation");

describe("Plan Modal Flow Integration", () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockUserSettings = {
    user: {
      id: "user-123",
      email: "test@example.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reminder_enabled: false,
      reminder_time: "09:00:00",
      reminder_frequency: "daily",
      reminder_last_sent: null,
      reminder_timezone: "UTC",
      subscription_status: "free",
      subscription_plan: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_current_period_end: null,
      free_roadmaps_used: false,
      roadmap_count: 0,
      testimonial_bonus_used: false,
      testimonial_submission_date: null,
      testimonial_state: null,
      testimonial_url: null,
    },
    isLoading: false,
    error: null,
    updateReminderSettings: vi.fn().mockResolvedValue({}),
    refetch: vi.fn(),
  };

  const mockStep = {
    id: "step-123",
    roadmap_id: "roadmap-123",
    order: 1,
    knowledge_content_id: "content-123",
    status: "locked" as const,
    user_id: "user-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    learn_completed_at: null,
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    plan_created_at: null,
    reflect_situation_rating: null,
    reflect_outcome: null,
    reflect_completed_at: null,
  };

  const mockKnowledgeContent = {
    id: "content-123",
    title: "Activation Energy",
    type: "mental-model" as const,
    description: "Test description",
    summary: "Test summary",
    application: "Test application",
    category: "test",
    keywords: ["test"],
    embedding: null,
  };

  const mockGoalExamples = [
    {
      id: "example-123",
      knowledge_content_id: "content-123",
      goal: "Stop procrastinating",
      if_then_example: "IF it's 9 AM, THEN I will open my document and write for 5 minutes",
      spotting_mission_example: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as ReturnType<typeof createClient>);
    vi.mocked(useUserSettings).mockReturnValue(mockUserSettings);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("shows modal on first successful plan save", async () => {
    const user = userEvent.setup();

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    // Fill in the form
    const situationField = screen.getByPlaceholderText(/It's 9 AM and I need to start my report/i);
    const actionField = screen.getByPlaceholderText(/Open the doc and write for just 5 minutes/i);

    await user.type(situationField, "When I sit at my desk in the morning");
    await user.type(actionField, "I will immediately open my work document");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Save Plan & Take Action/i });
    await user.click(submitButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText("Time to Apply What You've Learned! 🎯")).toBeInTheDocument();
    });

    // Verify modal content - use more specific queries
    const modalContent = screen.getByRole("dialog");
    expect(modalContent).toHaveTextContent("Activation Energy");
    expect(modalContent).toHaveTextContent("Come back when you have some experience to reflect on");

    // Verify localStorage was set
    expect(localStorage.getItem("plan-modal-shown-step-123")).toBe("true");
  });

  it("does not show modal on subsequent saves for same step", async () => {
    const user = userEvent.setup();

    // Set localStorage to indicate modal was already shown
    localStorage.setItem("plan-modal-shown-step-123", "true");

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    // Fill in the form
    const situationField = screen.getByPlaceholderText(/It's 9 AM and I need to start my report/i);
    const actionField = screen.getByPlaceholderText(/Open the doc and write for just 5 minutes/i);

    await user.type(situationField, "When I sit at my desk");
    await user.type(actionField, "I will start working");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Save Plan & Take Action/i });
    await user.click(submitButton);

    // Wait for navigation instead of modal
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap");
    });

    // Verify modal is not shown
    expect(screen.queryByText("Time to Apply What You've Learned! 🎯")).not.toBeInTheDocument();
  });

  it("navigates to roadmap after closing modal", async () => {
    const user = userEvent.setup();

    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    // Fill and submit form
    const situationField = screen.getByPlaceholderText(/It's 9 AM and I need to start my report/i);
    const actionField = screen.getByPlaceholderText(/Open the doc and write for just 5 minutes/i);

    await user.type(situationField, "Test situation");
    await user.type(actionField, "Test action");

    const submitButton = screen.getByRole("button", { name: /Save Plan & Take Action/i });
    await user.click(submitButton);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText("Time to Apply What You've Learned! 🎯")).toBeInTheDocument();
    });

    // Click "Got it!" button
    const gotItButton = screen.getByRole("button", { name: /Got it!/i });
    await user.click(gotItButton);

    // Verify navigation to roadmap
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap");
    });
  });

  it("shows different messages for different concept types", async () => {
    const user = userEvent.setup();

    // Test with bias type
    const biasContent = {
      ...mockKnowledgeContent,
      type: "cognitive-bias" as const,
      title: "Confirmation Bias",
    };

    const { rerender } = render(
      <PlanScreen step={mockStep} knowledgeContent={biasContent} goalExamples={mockGoalExamples} />
    );

    // Fill and submit form
    const situationField = screen.getByPlaceholderText(/I'm about to make a big decision/i);
    const actionField = screen.getByPlaceholderText(/List three ways this could go wrong first/i);

    await user.type(situationField, "Test");
    await user.type(actionField, "Test");
    await user.click(screen.getByRole("button", { name: /Save Plan & Take Action/i }));

    // Verify bias-specific content
    await waitFor(() => {
      const modalContent = screen.getByRole("dialog");
      expect(modalContent).toHaveTextContent("Confirmation Bias");
    });

    // Clean up for next test
    localStorage.clear();
    vi.clearAllMocks();

    // Test with fallacy type
    const fallacyContent = {
      ...mockKnowledgeContent,
      type: "fallacy" as const,
      title: "Straw Man Fallacy",
    };

    rerender(
      <PlanScreen
        step={{ ...mockStep, id: "step-456" }}
        knowledgeContent={fallacyContent}
        goalExamples={mockGoalExamples}
      />
    );
  });

  it("tracks separate modal states for different steps", async () => {
    const user = userEvent.setup();

    // First step
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    // Submit first step
    await user.type(screen.getByPlaceholderText(/It's 9 AM/i), "Test");
    await user.type(screen.getByPlaceholderText(/Open the doc/i), "Test");
    await user.click(screen.getByRole("button", { name: /Save Plan & Take Action/i }));

    // Verify modal shown and localStorage set for first step
    await waitFor(() => {
      expect(screen.getByText("Time to Apply What You've Learned! 🎯")).toBeInTheDocument();
    });
    expect(localStorage.getItem("plan-modal-shown-step-123")).toBe("true");

    // Close modal
    await user.click(screen.getByRole("button", { name: /Got it!/i }));

    // Different step should still show modal
    expect(localStorage.getItem("plan-modal-shown-step-456")).toBeNull();
  });
});
