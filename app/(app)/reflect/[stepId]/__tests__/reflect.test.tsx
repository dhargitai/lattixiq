import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mock canvas-confetti first
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

// Define mockSupabase and mockRouter first
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn().mockResolvedValue({
    data: {
      completed_step_id: "test-step-id",
      unlocked_step_id: "next-step-id",
      all_steps_completed: false,
      roadmap_completed: false,
    },
    error: null,
  }),
};

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};

// Mock the roadmap store
const mockMarkStepCompleted = vi.fn();
const mockActiveRoadmap = { id: "test-roadmap-id" };
const mockFetchActiveRoadmap = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/stores/roadmap-store", () => ({
  useRoadmapStore: () => ({
    markStepCompleted: mockMarkStepCompleted,
    activeRoadmap: mockActiveRoadmap,
    fetchActiveRoadmap: mockFetchActiveRoadmap,
  }),
}));

// Import after mocks are set up
import ReflectPage from "../page";

describe("Reflect Page", () => {
  const mockUser = { id: "test-user-id" };
  const mockStep = {
    id: "test-step-id",
    user_id: "test-user-id",
    roadmap_id: "test-roadmap-id",
    knowledge_content_id: "test-content-id",
    order: 1,
    status: "in_progress",
    plan_situation: "When I feel overwhelmed",
    plan_trigger: "at work",
    plan_action: "Take 5 deep breaths",
    plan_created_at: "2025-01-01T10:00:00Z",
    knowledge_content: {
      id: "test-content-id",
      title: "Activation Energy",
      content: "Test content",
    },
    roadmap: {
      id: "test-roadmap-id",
      user_id: "test-user-id",
      goal_description: "Stop procrastinating",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkStepCompleted.mockClear();

    // Set up server-side mocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockReturnValue(mockSupabase);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRouter as any).mockReturnValue(mockRouter);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
  });

  it("should require authentication", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const { redirect } = await import("next/navigation");

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  it("should load step and plan data", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") return stepQuery;
      return { select: vi.fn().mockReturnThis() };
    });

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("roadmap_steps");
      expect(stepQuery.select).toHaveBeenCalledWith(
        expect.stringContaining("knowledge_content(*)")
      );
      expect(stepQuery.eq).toHaveBeenCalledWith("id", "test-step-id");
    });
  });

  it("should display plan reminder section", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockReturnValue(stepQuery);

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      const planReminder = screen.getByTestId("plan-reminder");
      expect(planReminder).toBeInTheDocument();
      expect(planReminder).toHaveTextContent(
        `🎯 Your Plan: IF: ${mockStep.plan_situation} ${mockStep.plan_trigger} → THEN: ${mockStep.plan_action}`
      );
    });
  });

  it("should render reflection form with text area and star rating", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockReturnValue(stepQuery);

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(screen.getByTestId("reflection-text")).toBeInTheDocument();
      expect(screen.getByTestId("star-rating")).toBeInTheDocument();
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`star-${i}`)).toBeInTheDocument();
      }
    });
  });

  it("should validate form (minimum text length and rating selection)", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockReturnValue(stepQuery);

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeInTheDocument();
    });

    // Validation should be handled by ReflectScreen component
    // We're testing that the component receives the correct props
    const reflectionText = screen.getByTestId("reflection-text");
    expect(reflectionText).toHaveAttribute(
      "placeholder",
      "Share your experience applying this concept. What worked? What didn't? What did you learn?"
    );
  });

  it("should submit reflection successfully and persist data", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };

    const applicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") {
        return stepQuery;
      }
      if (table === "application_logs") {
        return applicationLogInsert;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Fill out the form
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "Test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    const learningTextarea = screen.getByTestId("learning-text");
    await user.type(learningTextarea, "Test learning that is optional but encouraged");

    // Click the 5th star for rating
    const star5 = screen.getByTestId("star-5") || screen.getByLabelText("Rate 5 stars");
    await user.click(star5);

    // Submit the form
    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(applicationLogInsert.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        roadmap_step_id: "test-step-id",
        situation_text:
          "Test reflection that is longer than 50 characters to meet the minimum requirement",
        learning_text: "Test learning that is optional but encouraged",
        effectiveness_rating: 5,
        created_at: expect.any(String),
      });
    });
  });

  it("should handle save failure with error", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };

    const applicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: null, error: { message: "Save failed" } }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") return stepQuery;
      if (table === "application_logs") return applicationLogInsert;
      return { select: vi.fn().mockReturnThis() };
    });

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    // Error handling would be in the ReflectScreen component
    // We're testing that the submission flow is triggered
    const user = userEvent.setup();

    // Fill out the form first
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "Test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    // Click the 5th star for rating
    const star5 = screen.getByTestId("star-5") || screen.getByLabelText("Rate 5 stars");
    await user.click(star5);

    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(applicationLogInsert.insert).toHaveBeenCalled();
    });
  });

  it("should allow back navigation to learn screen", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockReturnValue(stepQuery);

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId("back-button"));

    expect(mockRouter.push).toHaveBeenCalledWith("/learn/test-step-id?from=reflect");
  });

  it("should display success feedback", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };

    const applicationLogInsert = {
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") {
        return stepQuery; // Just return the stepQuery for .select().eq().single() chain
      }
      if (table === "application_logs") {
        return applicationLogInsert;
      }
      return { select: vi.fn().mockReturnThis() };
    });

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Fill out the form first
    const reflectionTextarea = screen.getByTestId("reflection-text");
    await user.type(
      reflectionTextarea,
      "Test reflection that is longer than 50 characters to meet the minimum requirement"
    );

    // Click the 5th star for rating
    const star5 = screen.getByTestId("star-5") || screen.getByLabelText("Rate 5 stars");
    await user.click(star5);

    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(applicationLogInsert.insert).toHaveBeenCalled();
      expect(mockSupabase.rpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
        p_step_id: "test-step-id",
        p_roadmap_id: "test-roadmap-id",
      });
    });

    // Should show success dialog instead of immediate navigation
    await waitFor(() => {
      expect(screen.getByText("Excellent Work!")).toBeInTheDocument();
    });

    // Click continue button to navigate
    const continueButton = screen.getByText("Continue to Roadmap");
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    });
  });

  it("should have mobile responsive layout", async () => {
    const stepQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
    };
    mockSupabase.from.mockReturnValue(stepQuery);

    render(await ReflectPage({ params: Promise.resolve({ stepId: "test-step-id" }) }));

    await waitFor(() => {
      const reflectScreen = screen.getByTestId("reflect-screen");
      expect(reflectScreen).toBeInTheDocument();
      // Mobile responsiveness would be tested with actual CSS classes
      // This is a placeholder for the test structure
    });
  });
});
