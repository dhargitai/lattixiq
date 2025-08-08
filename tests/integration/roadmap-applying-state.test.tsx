import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoadmapView from "@/components/features/roadmap/RoadmapView";
import type { TransformedRoadmap } from "@/lib/transformers/roadmap-transformers";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Roadmap Applying State Integration", () => {
  const createMockRoadmap = (stepOverrides = {}): TransformedRoadmap => ({
    id: "roadmap-1",
    goal_description: "Stop Procrastinating",
    steps: [
      {
        id: "step-1",
        order_index: 0,
        status: "completed",
        plan_situation: "Morning routine",
        plan_trigger: "After coffee",
        plan_action: "Write for 5 minutes",
        has_reflection: true,
        plan_created_at: "2024-01-01T10:00:00Z",
        knowledge_content: {
          id: "content-1",
          title: "Activation Energy",
          category: "Mental Models",
          type: "mental-model",
          summary: "The minimum energy needed to start",
        },
      },
      {
        id: "step-2",
        order_index: 1,
        status: "unlocked",
        plan_situation: "Big decisions",
        plan_trigger: "Before choosing",
        plan_action: "List negative outcomes",
        has_reflection: false,
        plan_created_at: "2024-01-02T10:00:00Z",
        knowledge_content: {
          id: "content-2",
          title: "Inversion",
          category: "Mental Models",
          type: "mental-model",
          summary: "Think backwards from failure",
        },
        ...stepOverrides,
      },
      {
        id: "step-3",
        order_index: 2,
        status: "locked",
        plan_situation: null,
        plan_trigger: null,
        plan_action: null,
        has_reflection: false,
        plan_created_at: null,
        knowledge_content: {
          id: "content-3",
          title: "Deprival-Superreaction",
          category: "Cognitive Biases",
          type: "cognitive-bias",
          summary: "Overreacting to loss",
        },
      },
    ],
  });

  describe("State Transitions", () => {
    it("should show normal state when step has no plan", () => {
      const roadmap = createMockRoadmap({
        plan_situation: null,
        plan_trigger: null,
        plan_action: null,
        has_reflection: false,
      });

      render(<RoadmapView roadmap={roadmap} />);

      // Should show current step label
      expect(screen.getByText(/Step 2 • Current/)).toBeInTheDocument();

      // Should show Start Learning CTA
      expect(screen.getByText(/Start Learning/)).toBeInTheDocument();

      // Should not show applying state
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();
    });

    it("should show applying state when step has plan but no reflection", () => {
      const roadmap = createMockRoadmap();

      render(<RoadmapView roadmap={roadmap} />);

      // Should show applying label
      expect(screen.getByText(/Step 2 • Applying/)).toBeInTheDocument();

      // Should show hourglass and message
      expect(screen.getByText("⏳")).toBeInTheDocument();
      expect(screen.getByText("You're on a mission to apply what you learned")).toBeInTheDocument();

      // Should show Reflect CTA
      expect(screen.getByText(/Reflect On What You Learned/)).toBeInTheDocument();
    });

    it("should transition from applying state when reflection is added", () => {
      const roadmap = createMockRoadmap({
        has_reflection: true,
      });

      render(<RoadmapView roadmap={roadmap} />);

      // Should not show applying state anymore
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should show View Step CTA
      expect(screen.getByText(/View Step/)).toBeInTheDocument();
    });

    it("should not show applying state for completed steps", () => {
      const roadmap = createMockRoadmap({
        status: "completed",
        has_reflection: false,
      });

      render(<RoadmapView roadmap={roadmap} />);

      // Should not show applying state for completed step
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();
    });
  });

  describe("Multiple Steps", () => {
    it("should only show applying state for the current active step", () => {
      const roadmap: TransformedRoadmap = {
        id: "roadmap-1",
        goal_description: "Improve Decision Making",
        steps: [
          {
            id: "step-1",
            order_index: 0,
            status: "completed",
            plan_situation: "Morning",
            plan_trigger: "Wake up",
            plan_action: "Meditate",
            has_reflection: true,
            plan_created_at: "2024-01-01T10:00:00Z",
            knowledge_content: {
              id: "content-1",
              title: "First Principles",
              category: "Mental Models",
              type: "mental-model",
              summary: "Break down to basics",
            },
          },
          {
            id: "step-2",
            order_index: 1,
            status: "unlocked",
            plan_situation: "Work",
            plan_trigger: "Meeting",
            plan_action: "Question assumptions",
            has_reflection: false,
            plan_created_at: "2024-01-02T10:00:00Z",
            knowledge_content: {
              id: "content-2",
              title: "Second-Order Thinking",
              category: "Mental Models",
              type: "mental-model",
              summary: "Consider consequences",
            },
          },
          {
            id: "step-3",
            order_index: 2,
            status: "locked",
            plan_situation: "Evening",
            plan_trigger: "Review",
            plan_action: "Journal",
            has_reflection: false,
            plan_created_at: "2024-01-03T10:00:00Z",
            knowledge_content: {
              id: "content-3",
              title: "Margin of Safety",
              category: "Mental Models",
              type: "mental-model",
              summary: "Build in buffers",
            },
          },
        ],
      };

      render(<RoadmapView roadmap={roadmap} />);

      // Should show applying state only for step 2 (current unlocked step)
      const houglasses = screen.getAllByText("⏳");
      expect(houglasses).toHaveLength(1);

      // Should show applying message only once
      const messages = screen.getAllByText("You're on a mission to apply what you learned");
      expect(messages).toHaveLength(1);

      // Step 1 should not show applying (it's completed)
      expect(screen.queryByText(/Step 1 • Applying/)).not.toBeInTheDocument();

      // Step 2 should show applying
      expect(screen.getByText(/Step 2 • Applying/)).toBeInTheDocument();

      // Step 3 should not show applying (it's locked)
      expect(screen.queryByText(/Step 3 • Applying/)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle step with partial plan data correctly", () => {
      const roadmap = createMockRoadmap({
        plan_situation: "Test",
        plan_trigger: null,
        plan_action: null,
        has_reflection: false,
      });

      render(<RoadmapView roadmap={roadmap} />);

      // Should not show applying state with incomplete plan
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should show Start Learning (plan is incomplete)
      expect(screen.getByText(/Start Learning/)).toBeInTheDocument();
    });

    it("should handle all steps completed roadmap", () => {
      const roadmap: TransformedRoadmap = {
        id: "roadmap-1",
        goal_description: "Master Mental Models",
        steps: [
          {
            id: "step-1",
            order_index: 0,
            status: "completed",
            plan_situation: "Test",
            plan_trigger: "Test",
            plan_action: "Test",
            has_reflection: true,
            plan_created_at: "2024-01-01T10:00:00Z",
            knowledge_content: {
              id: "content-1",
              title: "Model 1",
              category: "Mental Models",
              type: "mental-model",
              summary: "Summary 1",
            },
          },
          {
            id: "step-2",
            order_index: 1,
            status: "completed",
            plan_situation: "Test",
            plan_trigger: "Test",
            plan_action: "Test",
            has_reflection: true,
            plan_created_at: "2024-01-02T10:00:00Z",
            knowledge_content: {
              id: "content-2",
              title: "Model 2",
              category: "Mental Models",
              type: "mental-model",
              summary: "Summary 2",
            },
          },
        ],
      };

      render(<RoadmapView roadmap={roadmap} />);

      // Should not show any applying states
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should not show any CTAs
      expect(screen.queryByText(/Start Learning/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Reflect On What You Learned/)).not.toBeInTheDocument();
    });

    it("should handle first step in applying state", () => {
      const roadmap: TransformedRoadmap = {
        id: "roadmap-1",
        goal_description: "Get Started",
        steps: [
          {
            id: "step-1",
            order_index: 0,
            status: "unlocked",
            plan_situation: "Morning",
            plan_trigger: "Wake up",
            plan_action: "Exercise",
            has_reflection: false,
            plan_created_at: "2024-01-01T10:00:00Z",
            knowledge_content: {
              id: "content-1",
              title: "Getting Started",
              category: "Mental Models",
              type: "mental-model",
              summary: "Begin with small steps",
            },
          },
        ],
      };

      render(<RoadmapView roadmap={roadmap} />);

      // Should show applying state for first step
      expect(screen.getByText("⏳")).toBeInTheDocument();
      expect(screen.getByText("You're on a mission to apply what you learned")).toBeInTheDocument();
      expect(screen.getByText(/Step 1 • Applying/)).toBeInTheDocument();
      expect(screen.getByText(/Reflect On What You Learned/)).toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should maintain applying state indicators on mobile", () => {
      const roadmap = createMockRoadmap();

      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<RoadmapView roadmap={roadmap} />);

      // All applying state elements should still be visible
      expect(screen.getByText("⏳")).toBeInTheDocument();
      expect(screen.getByText("You're on a mission to apply what you learned")).toBeInTheDocument();
      expect(screen.getByText(/Reflect On What You Learned/)).toBeInTheDocument();
    });
  });
});
