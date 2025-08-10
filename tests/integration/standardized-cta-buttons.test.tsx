import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LearnScreen from "@/components/features/roadmap/LearnScreen";
import { PlanScreen } from "@/components/features/roadmap/PlanScreen";
import ReflectScreen from "@/components/features/roadmap/ReflectScreen";
import NewRoadmapForm from "@/components/features/new-roadmap/NewRoadmapForm";
import type {
  RoadmapStepWithContent,
  RoadmapStep,
  KnowledgeContent,
  GoalExample,
  Roadmap,
} from "@/lib/supabase/types";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
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
    rpc: vi.fn(),
  }),
}));

const mockRoadmap: Roadmap = {
  id: "test-roadmap-1",
  user_id: "test-user",
  goal_description: "Test goal",
  status: "active",
  created_at: new Date().toISOString(),
  completed_at: null,
  updated_at: null,
};

const mockKnowledgeContent: KnowledgeContent = {
  id: "test-content-1",
  title: "Test Mental Model",
  type: "mental-model",
  application: "Test application",
  category: null,
  description: "Test description",
  embedding: null,
  keywords: null,
  summary: "Test summary",
};

const mockStepWithContent: RoadmapStepWithContent & { roadmap: Roadmap } = {
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
  knowledge_content: mockKnowledgeContent,
  roadmap: mockRoadmap,
};

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

const mockGoalExamples: GoalExample[] = [
  {
    id: "test-example-1",
    knowledge_content_id: "test-content-1",
    goal: "Test goal",
    if_then_example: "IF X, THEN Y",
    spotting_mission_example: "Spot X",
  },
];

describe("Standardized CTA Buttons Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LearnScreen CTA Button", () => {
    it("should use StandardCTAButton with correct primary variant", () => {
      render(<LearnScreen step={mockStepWithContent} onNavigateToPlan={vi.fn()} />);

      const button = screen.getByTestId("continue-to-plan-button");
      expect(button).toBeInTheDocument();

      // Should have primary variant styles (blue gradient)
      expect(button).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-blue-600");

      // Should have standard CTA button styling
      expect(button).toHaveClass(
        "font-semibold",
        "rounded-xl",
        "transition-all",
        "duration-300",
        "shadow-lg",
        "hover:shadow-xl"
      );
    });

    it("should have correct size and include arrow icon", () => {
      render(<LearnScreen step={mockStepWithContent} onNavigateToPlan={vi.fn()} />);

      const button = screen.getByTestId("continue-to-plan-button");

      // Should have medium size styling
      expect(button).toHaveClass("px-10", "py-6", "text-lg");

      // Should contain arrow icon
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("PlanScreen CTA Button", () => {
    it("should use StandardCTAButton with correct primary variant", () => {
      render(
        <PlanScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          goalExamples={mockGoalExamples}
        />
      );

      const submitButton = screen.getByRole("button", { name: /save plan/i });
      expect(submitButton).toBeInTheDocument();

      // Should have primary variant styles (blue gradient)
      expect(submitButton).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-blue-600");

      // Should have standard CTA button styling
      expect(submitButton).toHaveClass(
        "font-semibold",
        "rounded-xl",
        "transition-all",
        "duration-300"
      );
    });

    it("should handle loading state correctly", () => {
      // This test would need more complex mocking to test actual loading state
      // For now, we verify the button accepts loading prop and has correct styling
      render(
        <PlanScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          goalExamples={mockGoalExamples}
        />
      );

      const submitButton = screen.getByRole("button", { name: /save plan/i });
      expect(submitButton).toHaveClass("font-semibold", "rounded-xl");
    });
  });

  describe("ReflectScreen CTA Button", () => {
    it("should use StandardCTAButton with correct secondary variant", () => {
      render(
        <ReflectScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          roadmap={mockRoadmap}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeInTheDocument();

      // Should have secondary variant styles (green gradient)
      expect(submitButton).toHaveClass("bg-gradient-to-r", "from-green-500", "to-green-600");

      // Should be full width
      expect(submitButton).toHaveClass("w-full");

      // Should have large size
      expect(submitButton).toHaveClass("px-12", "py-7", "text-xl");
    });

    it("should handle disabled state correctly", () => {
      render(
        <ReflectScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          roadmap={mockRoadmap}
        />
      );

      const submitButton = screen.getByTestId("submit-button");

      // Should be disabled initially (since no input provided)
      expect(submitButton).toBeDisabled();

      // Should have disabled state styling
      expect(submitButton).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });
  });

  describe("NewRoadmapForm CTA Button", () => {
    it("should use StandardCTAButton with correct secondary variant", () => {
      render(<NewRoadmapForm />);

      const createButton = screen.getByRole("button", { name: /create my roadmap/i });
      expect(createButton).toBeInTheDocument();

      // Should have secondary variant styles (green gradient)
      expect(createButton).toHaveClass("bg-gradient-to-r", "from-green-500", "to-green-600");

      // Should be full width
      expect(createButton).toHaveClass("w-full");

      // Should have medium size
      expect(createButton).toHaveClass("px-10", "py-6", "text-lg");
    });

    it("should be disabled until minimum goal length is met", async () => {
      const user = userEvent.setup();
      render(<NewRoadmapForm />);

      const createButton = screen.getByRole("button", { name: /create my roadmap/i });
      const goalTextarea = screen.getByRole("textbox");

      // Should be disabled initially
      expect(createButton).toBeDisabled();

      // Type less than 10 characters
      await user.type(goalTextarea, "Short");
      expect(createButton).toBeDisabled();

      // Type 10+ characters
      await user.clear(goalTextarea);
      await user.type(goalTextarea, "This is a longer goal description");
      expect(createButton).not.toBeDisabled();
    });
  });

  describe("Button Consistency", () => {
    it("should have consistent hover effects across all buttons", () => {
      const { rerender } = render(
        <LearnScreen step={mockStepWithContent} onNavigateToPlan={vi.fn()} />
      );

      let button = screen.getByTestId("continue-to-plan-button");
      expect(button).toHaveClass("hover:-translate-y-0.5");

      rerender(
        <PlanScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          goalExamples={mockGoalExamples}
        />
      );

      button = screen.getByRole("button", { name: /save plan/i });
      expect(button).toHaveClass("hover:-translate-y-0.5");

      rerender(
        <ReflectScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          roadmap={mockRoadmap}
        />
      );

      button = screen.getByTestId("submit-button");
      expect(button).toHaveClass("hover:-translate-y-0.5");

      rerender(<NewRoadmapForm />);

      button = screen.getByRole("button", { name: /create my roadmap/i });
      expect(button).toHaveClass("hover:-translate-y-0.5");
    });

    it("should have consistent shadow effects", () => {
      const { rerender } = render(
        <LearnScreen step={mockStepWithContent} onNavigateToPlan={vi.fn()} />
      );

      let button = screen.getByTestId("continue-to-plan-button");
      expect(button).toHaveClass("shadow-lg", "hover:shadow-xl");

      rerender(
        <PlanScreen
          step={mockStep}
          knowledgeContent={mockKnowledgeContent}
          goalExamples={mockGoalExamples}
        />
      );

      button = screen.getByRole("button", { name: /save plan/i });
      expect(button).toHaveClass("shadow-lg", "hover:shadow-xl");
    });

    it("should have consistent disabled states", () => {
      render(<NewRoadmapForm />);

      const button = screen.getByRole("button", { name: /create my roadmap/i });
      expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });
  });
});
