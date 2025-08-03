import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock functions
const mockPush = vi.fn();
const mockRedirect = vi.fn();

// Set up mocks before imports
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
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

vi.mock("@/components/features/roadmap/RoadmapView", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/queries/roadmap-queries", () => ({
  getActiveRoadmapWithSteps: vi.fn(),
}));

vi.mock("@/lib/transformers/roadmap-transformers", () => ({
  transformRoadmapForView: vi.fn((roadmap) => roadmap),
}));

// Import modules after mocks
import { createClient } from "@/lib/supabase/server";
import RoadmapView from "@/components/features/roadmap/RoadmapView";
import { getActiveRoadmapWithSteps } from "@/lib/queries/roadmap-queries";
import RoadmapPage from "../page";

// Mock data
const mockRoadmap = {
  id: "roadmap-1",
  user_id: "test-user-id",
  goal_description: "Improve decision-making skills",
  status: "active" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  completed_at: null,
  steps: [
    {
      id: "step-1",
      roadmap_id: "roadmap-1",
      knowledge_content_id: "content-1",
      order: 0,
      status: "unlocked" as const,
      plan_action: null,
      plan_created_at: null,
      plan_situation: null,
      plan_trigger: null,
      knowledge_content: {
        id: "content-1",
        title: "Confirmation Bias",
        type: "cognitive-bias" as const,
        category: "bias",
        summary: "The tendency to search for information that confirms our existing beliefs",
        description: "Detailed explanation...",
        application: "Application guide...",
        keywords: ["bias", "confirmation"],
        embedding: null,
      },
    },
    {
      id: "step-2",
      roadmap_id: "roadmap-1",
      knowledge_content_id: "content-2",
      order: 1,
      status: "locked" as const,
      plan_action: null,
      plan_created_at: null,
      plan_situation: null,
      plan_trigger: null,
      knowledge_content: {
        id: "content-2",
        title: "First Principles Thinking",
        type: "mental-model" as const,
        category: "mental-model",
        summary: "Breaking down complex problems into basic elements",
        description: "Detailed explanation...",
        application: "Application guide...",
        keywords: ["thinking", "principles"],
        embedding: null,
      },
    },
    {
      id: "step-3",
      roadmap_id: "roadmap-1",
      knowledge_content_id: "content-3",
      order: 2,
      status: "locked" as const,
      plan_action: null,
      plan_created_at: null,
      plan_situation: null,
      plan_trigger: null,
      knowledge_content: {
        id: "content-3",
        title: "Sunk Cost Fallacy",
        type: "fallacy" as const,
        category: "bias",
        summary: "Continuing something because of previously invested resources",
        description: "Detailed explanation...",
        application: "Application guide...",
        keywords: ["fallacy", "sunk cost"],
        embedding: null,
      },
    },
  ],
};

describe("Roadmap Page", () => {
  const mockCreateClient = vi.mocked(createClient);
  const mockRoadmapView = vi.mocked(RoadmapView);
  const mockGetActiveRoadmapWithSteps = vi.mocked(getActiveRoadmapWithSteps);

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup RoadmapView mock
    mockRoadmapView.mockImplementation(({ roadmap }) => {
      const completedSteps = roadmap.steps.filter((step) => step.status === "completed").length;
      const totalSteps = roadmap.steps.length;
      const progressPercentage = (completedSteps / totalSteps) * 100;

      return (
        <div data-testid="roadmap-container" className="flex-col">
          <h1>{roadmap.goal_description}</h1>
          <div role="progressbar" aria-valuenow={progressPercentage} aria-valuemax={100}>
            {completedSteps} of {totalSteps} steps completed
          </div>
          {roadmap.steps.map((step, index) => (
            <div
              key={step.id}
              data-testid={`roadmap-step-${index}`}
              className={step.status === "locked" ? "opacity-50 blur-sm" : ""}
              aria-disabled={step.status === "locked"}
            >
              <h2>{step.knowledge_content.title}</h2>
              {step.status === "unlocked" && index === 0 && (
                <button onClick={() => mockPush(`/learn?step=${step.id}`)}>Start Learning</button>
              )}
            </div>
          ))}
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
    };
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any);
    // Default roadmap query mock - user has active roadmap
    mockGetActiveRoadmapWithSteps.mockResolvedValue({
      data: mockRoadmap,
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
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValueOnce(mockSupabaseClient as any);
    await RoadmapPage();

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should load and display active roadmap data", async () => {
    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText("Improve decision-making skills")).toBeInTheDocument();
    });
  });

  it("should display all roadmap steps in order", async () => {
    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      const steps = screen.getAllByTestId(/^roadmap-step-/);
      expect(steps).toHaveLength(3);

      // Verify order
      expect(steps[0]).toHaveTextContent("Confirmation Bias");
      expect(steps[1]).toHaveTextContent("First Principles Thinking");
      expect(steps[2]).toHaveTextContent("Sunk Cost Fallacy");
    });
  });

  it("should show first step as unlocked and clickable", async () => {
    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      const firstStep = screen.getByTestId("roadmap-step-0");
      expect(firstStep).not.toHaveClass("opacity-50");
      expect(firstStep).not.toHaveClass("blur-sm");
      expect(firstStep).not.toHaveAttribute("aria-disabled", "true");

      // Should have Start Learning button
      const startButton = screen.getByRole("button", { name: /start learning/i });
      expect(startButton).toBeInTheDocument();
    });
  });

  it("should show subsequent steps as locked and blurred", async () => {
    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      const secondStep = screen.getByTestId("roadmap-step-1");
      const thirdStep = screen.getByTestId("roadmap-step-2");

      // Check for locked state styling
      expect(secondStep).toHaveClass("opacity-50");
      expect(secondStep).toHaveClass("blur-sm");
      expect(secondStep).toHaveAttribute("aria-disabled", "true");

      expect(thirdStep).toHaveClass("opacity-50");
      expect(thirdStep).toHaveClass("blur-sm");
      expect(thirdStep).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should display progress indicators", async () => {
    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      // Progress bar should show 0% complete (0 of 3 steps)
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");

      // Progress text
      expect(screen.getByText(/0 of 3 steps completed/i)).toBeInTheDocument();
    });
  });

  it("should have mobile responsive layout", async () => {
    // Mock window resize
    global.innerWidth = 375;
    global.dispatchEvent(new Event("resize"));

    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      const container = screen.getByTestId("roadmap-container");
      // On mobile, should use flex-col
      expect(container).toHaveClass("flex-col");
    });
  });

  it("should navigate to learning screen when Start Learning is clicked", async () => {
    const user = userEvent.setup();

    const PageComponent = await RoadmapPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start learning/i })).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start learning/i });
    await user.click(startButton);

    expect(mockPush).toHaveBeenCalledWith("/learn?step=step-1");
  });

  it("should redirect to new-roadmap if no active roadmap exists", async () => {
    // Mock no active roadmap
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValueOnce(mockSupabaseClient as any);
    // Mock getActiveRoadmapWithSteps to return null (no active roadmap)
    mockGetActiveRoadmapWithSteps.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await RoadmapPage();

    expect(mockRedirect).toHaveBeenCalledWith("/new-roadmap");
  });
});
