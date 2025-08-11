import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlanScreen } from "@/components/features/roadmap/PlanScreen";
import type { RoadmapStep, KnowledgeContent, GoalExample } from "@/lib/supabase/types";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/useUserSettings", () => ({
  useUserSettings: () => ({
    user: {
      id: "test-user",
      reminder_enabled: false,
      reminder_time: "09:00",
    },
    updateReminderSettings: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => ({ error: null }),
      }),
    }),
    auth: {
      getUser: () => ({ data: { user: { id: "test-user" } } }),
    },
  }),
}));

const mockStep: RoadmapStep = {
  id: "test-step-1",
  roadmap_id: "test-roadmap-1",
  knowledge_content_id: "test-content-1",
  order: 1,
  status: "unlocked",
  completed_at: null,
  plan_created_at: null,
  plan_trigger: null,
  plan_action: null,
  updated_at: null,
};

const mockKnowledgeContent: KnowledgeContent = {
  id: "test-content-1",
  title: "Activation Energy",
  type: "mental-model",
  application: null,
  category: null,
  description: null,
  embedding: null,
  keywords: null,
  summary: null,
};

const mockGoalExamples: GoalExample[] = [
  {
    id: "test-example-1",
    knowledge_content_id: "test-content-1",
    goal: "Stop procrastinating",
    if_then_example: "IF I feel unmotivated, THEN I will do just 5 minutes of work",
    spotting_mission_example: "Notice when I feel unmotivated",
  },
];

describe("Plan Screen Focus States", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show blue focus and character count for IF textarea initially", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);

    // Initially should show 0 characters - check that there are multiple instances
    const initialCharCountElements = screen.getAllByText("0 / 30 minimum");
    expect(initialCharCountElements).toHaveLength(2); // Both textareas show this initially

    // Focus should trigger blue focus styles (this is tested via className)
    fireEvent.focus(situationTextarea);
    expect(situationTextarea).toHaveClass("focus:border-blue-500", "focus:ring-blue-200");
  });

  it("should show blue focus and character count for THEN textarea initially", async () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const actionTextarea = screen.getByLabelText(/THEN I WILL:/i);

    // Should have blue focus classes initially
    fireEvent.focus(actionTextarea);
    expect(actionTextarea).toHaveClass("focus:border-blue-500", "focus:ring-blue-200");
  });

  it("should update character count as user types in IF textarea", async () => {
    const user = userEvent.setup();
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);

    // Type some text
    await user.type(situationTextarea, "Hello world!");

    // Should show character count
    await waitFor(() => {
      expect(screen.getByText("12 / 30 minimum")).toBeInTheDocument();
    });
  });

  it("should switch to green focus and character display when IF textarea reaches 30 characters", async () => {
    const user = userEvent.setup();
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);

    // Type exactly 30 characters
    const thirtyCharText = "123456789012345678901234567890";
    await user.type(situationTextarea, thirtyCharText);

    // Should show green character count
    await waitFor(() => {
      expect(screen.getByText("30 characters")).toBeInTheDocument();
    });

    // Should have green focus classes
    expect(situationTextarea).toHaveClass("focus:border-green-500", "focus:ring-green-200");
  });

  it("should switch to green focus and character display when THEN textarea reaches 30 characters", async () => {
    const user = userEvent.setup();
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const actionTextarea = screen.getByLabelText(/THEN I WILL:/i);

    // Type exactly 30 characters
    const thirtyCharText = "123456789012345678901234567890";
    await user.type(actionTextarea, thirtyCharText);

    // Should show green character count
    await waitFor(() => {
      expect(screen.getByText("30 characters")).toBeInTheDocument();
    });

    // Should have green focus classes
    expect(actionTextarea).toHaveClass("focus:border-green-500", "focus:ring-green-200");
  });

  it("should maintain blue focus state for text under 30 characters", async () => {
    const user = userEvent.setup();
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);

    // Type 29 characters
    const twentyNineCharText = "12345678901234567890123456789";
    await user.type(situationTextarea, twentyNineCharText);

    // Should show minimum count
    await waitFor(() => {
      expect(screen.getByText("29 / 30 minimum")).toBeInTheDocument();
    });

    // Should still have blue focus classes
    expect(situationTextarea).toHaveClass("focus:border-blue-500", "focus:ring-blue-200");
  });

  it("should handle both textareas independently", async () => {
    const user = userEvent.setup();
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);
    const actionTextarea = screen.getByLabelText(/THEN I WILL:/i);

    // Type different amounts in each textarea
    await user.type(situationTextarea, "Short text");
    await user.type(actionTextarea, "123456789012345678901234567890");

    await waitFor(() => {
      // Situation textarea should show blue state
      expect(screen.getByText("10 / 30 minimum")).toBeInTheDocument();
      // Action textarea should show green state
      expect(screen.getByText("30 characters")).toBeInTheDocument();
    });

    // Check focus classes
    expect(situationTextarea).toHaveClass("focus:border-blue-500", "focus:ring-blue-200");
    expect(actionTextarea).toHaveClass("focus:border-green-500", "focus:ring-green-200");
  });

  it("should have smooth transitions between focus states", () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);

    // Check for transition classes
    expect(situationTextarea).toHaveClass("transition-all", "duration-300", "ease-in-out");
  });

  it("should maintain accessibility attributes with dynamic focus states", () => {
    render(
      <PlanScreen
        step={mockStep}
        knowledgeContent={mockKnowledgeContent}
        goalExamples={mockGoalExamples}
      />
    );

    const situationTextarea = screen.getByLabelText(/IF:/i);
    const actionTextarea = screen.getByLabelText(/THEN I WILL:/i);

    // Check accessibility attributes are preserved
    expect(situationTextarea).toHaveAttribute("aria-label", "IF:");
    expect(actionTextarea).toHaveAttribute("aria-label", "THEN I WILL:");
    expect(situationTextarea).toBeRequired();
    expect(actionTextarea).toBeRequired();
  });
});
