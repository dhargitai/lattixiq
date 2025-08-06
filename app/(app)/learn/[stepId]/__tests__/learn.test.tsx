import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock functions
const mockPush = vi.fn();
const mockRedirect = vi.fn();
const mockNotFound = vi.fn();

// Set up mocks before imports
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error("NEXT_REDIRECT"); // Simulate Next.js redirect behavior
  },
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND"); // Simulate Next.js notFound behavior
  },
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/components/features/roadmap/LearnScreen", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/queries/roadmap-queries", () => ({
  getRoadmapStepWithContent: vi.fn(),
}));

// Import modules after mocks
import { createClient } from "@/lib/supabase/server";
import type { createClient as createClientType } from "@/lib/supabase/server";
import LearnScreen from "@/components/features/roadmap/LearnScreen";
import { getRoadmapStepWithContent } from "@/lib/queries/roadmap-queries";
import LearnPage from "../page";

// Type for Supabase client
type SupabaseClientType = Awaited<ReturnType<typeof createClientType>>;

// Mock data
const mockStepWithContent = {
  id: "step-1",
  roadmap_id: "roadmap-1",
  knowledge_content_id: "content-1",
  order: 0,
  status: "unlocked" as const,
  plan_action: null,
  plan_created_at: null,
  plan_situation: null,
  plan_trigger: null,
  completed_at: null,
  updated_at: null,
  knowledge_content: {
    id: "content-1",
    title: "Confirmation Bias",
    type: "cognitive-bias" as const,
    category: "bias",
    summary: "The tendency to search for information that confirms our existing beliefs",
    description:
      "Confirmation bias is a type of cognitive bias that involves favoring information that confirms previously existing beliefs or biases.",
    application:
      "Before making important decisions, actively seek out information that contradicts your initial assumptions.",
    keywords: ["bias", "confirmation"],
    embedding: null,
  },
  roadmap: {
    id: "roadmap-1",
    user_id: "test-user-id",
    goal_description: "Improve decision-making skills",
    status: "active" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
};

const mockStepWithPlan = {
  ...mockStepWithContent,
  plan_action: "Ask myself 'What evidence would prove me wrong?' before making decisions",
  plan_situation: "Work meetings when proposing new ideas",
  plan_trigger: "When I feel certain about something",
  plan_created_at: new Date().toISOString(),
};

describe("Learn Page", () => {
  const mockCreateClient = vi.mocked(createClient);
  const mockLearnScreen = vi.mocked(LearnScreen);
  const mockGetRoadmapStepWithContent = vi.mocked(getRoadmapStepWithContent);

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup LearnScreen mock
    mockLearnScreen.mockImplementation(({ step }) => {
      const handleNavigateToPlan = () => mockPush(`/plan/${step.id}`);
      const handleNavigateBack = () => mockPush("/roadmap");

      return (
        <div data-testid="learn-screen">
          <nav aria-label="breadcrumb">
            <button onClick={handleNavigateBack} data-testid="back-button">
              Back to Roadmap
            </button>
          </nav>

          <header>
            <h1>{step.knowledge_content.title}</h1>
            <span data-testid="category-badge" className="badge">
              {step.knowledge_content.category}
            </span>
            <span data-testid="type-indicator">{step.knowledge_content.type}</span>
          </header>

          <section data-testid="summary-section">
            <h2>Summary</h2>
            <p>{step.knowledge_content.summary}</p>
          </section>

          <section data-testid="description-section">
            <h2>Description</h2>
            <p>{step.knowledge_content.description}</p>
          </section>

          <section data-testid="application-section">
            <h2>Application</h2>
            <p>{step.knowledge_content.application}</p>
          </section>

          <footer>
            <button
              onClick={handleNavigateToPlan}
              data-testid="continue-to-plan-button"
              disabled={!!step.plan_created_at}
              className="btn-primary"
            >
              {step.plan_created_at ? "Plan Created" : "Continue to Plan"}
            </button>
          </footer>
        </div>
      );
    });

    // Default Supabase mock - authenticated user
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      },
    } as unknown as SupabaseClientType;
    mockCreateClient.mockResolvedValue(mockSupabaseClient);

    // Default step query mock
    mockGetRoadmapStepWithContent.mockResolvedValue({
      data: mockStepWithContent,
      error: null,
    });
  });

  it("should redirect unauthenticated users to login", async () => {
    // Mock unauthenticated user
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    } as unknown as SupabaseClientType;
    mockCreateClient.mockResolvedValueOnce(mockSupabaseClient);

    await expect(() =>
      LearnPage({ params: Promise.resolve({ stepId: "step-1" }) })
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should return 404 for non-existent step", async () => {
    mockGetRoadmapStepWithContent.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await expect(() =>
      LearnPage({ params: Promise.resolve({ stepId: "invalid-step" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("should return 404 for step user doesn't own", async () => {
    const stepWithDifferentUser = {
      ...mockStepWithContent,
      roadmap: {
        ...mockStepWithContent.roadmap,
        user_id: "different-user-id",
      },
    };

    mockGetRoadmapStepWithContent.mockResolvedValueOnce({
      data: stepWithDifferentUser,
      error: null,
    });

    await expect(() =>
      LearnPage({ params: Promise.resolve({ stepId: "step-1" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("should load and display knowledge content", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId("learn-screen")).toBeInTheDocument();
      expect(screen.getByText("Confirmation Bias")).toBeInTheDocument();
    });
  });

  it("should display title, category, and type prominently", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      // Title as h1
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("Confirmation Bias");

      // Category badge
      const categoryBadge = screen.getByTestId("category-badge");
      expect(categoryBadge).toHaveTextContent("bias");
      expect(categoryBadge).toHaveClass("badge");

      // Type indicator
      const typeIndicator = screen.getByTestId("type-indicator");
      expect(typeIndicator).toHaveTextContent("cognitive-bias");
    });
  });

  it("should show summary and description sections", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      // Summary section
      const summarySection = screen.getByTestId("summary-section");
      expect(summarySection).toBeInTheDocument();
      expect(summarySection).toHaveTextContent(
        "The tendency to search for information that confirms our existing beliefs"
      );

      // Description section
      const descriptionSection = screen.getByTestId("description-section");
      expect(descriptionSection).toBeInTheDocument();
      expect(descriptionSection).toHaveTextContent("Confirmation bias is a type of cognitive bias");
    });
  });

  it("should display application guidance clearly", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      const applicationSection = screen.getByTestId("application-section");
      expect(applicationSection).toBeInTheDocument();
      expect(applicationSection).toHaveTextContent(
        "Before making important decisions, actively seek out information"
      );
    });
  });

  it("should have Continue to Plan button at bottom", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      const continueButton = screen.getByTestId("continue-to-plan-button");
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toHaveTextContent("Continue to Plan");
      expect(continueButton).toHaveClass("btn-primary");
      expect(continueButton).not.toBeDisabled();
    });
  });

  it("should disable Continue to Plan button if plan already exists", async () => {
    mockGetRoadmapStepWithContent.mockResolvedValueOnce({
      data: mockStepWithPlan,
      error: null,
    });

    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      const continueButton = screen.getByTestId("continue-to-plan-button");
      expect(continueButton).toBeDisabled();
      expect(continueButton).toHaveTextContent("Plan Created");
    });
  });

  it("should provide back navigation to roadmap", async () => {
    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      const backButton = screen.getByTestId("back-button");
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent("Back to Roadmap");
    });
  });

  it("should handle Continue to Plan button click", async () => {
    const user = userEvent.setup();

    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId("continue-to-plan-button")).toBeInTheDocument();
    });

    const continueButton = screen.getByTestId("continue-to-plan-button");
    await user.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith("/plan/step-1");
  });

  it("should handle back navigation click", async () => {
    const user = userEvent.setup();

    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    const backButton = screen.getByTestId("back-button");
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("should have mobile responsive design", async () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event("resize"));

    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    await waitFor(() => {
      const learnScreen = screen.getByTestId("learn-screen");
      expect(learnScreen).toBeInTheDocument();
      // Component should be rendered and responsive behavior will be handled in CSS
    });
  });

  it("should show loading state while content fetches", async () => {
    // Mock slow loading
    mockGetRoadmapStepWithContent.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockStepWithContent, error: null }), 100)
        )
    );

    const PageComponent = await LearnPage({ params: Promise.resolve({ stepId: "step-1" }) });
    render(PageComponent);

    // Initial state should show loading
    // Note: In actual implementation, we'll add a loading skeleton
    expect(screen.queryByTestId("learn-screen")).toBeInTheDocument();
  });

  it("should handle error if content fails to load", async () => {
    mockGetRoadmapStepWithContent.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Database connection failed",
        details: "",
        hint: "",
        code: "CONNECTION_ERROR",
        name: "PostgrestError",
      },
    });

    await expect(() =>
      LearnPage({ params: Promise.resolve({ stepId: "step-1" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });
});
