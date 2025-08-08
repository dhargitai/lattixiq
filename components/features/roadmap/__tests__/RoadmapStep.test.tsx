import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import RoadmapStep from "../RoadmapStep";
import type { TransformedStep } from "@/lib/transformers/roadmap-transformers";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("RoadmapStep", () => {
  const mockPush = vi.fn();

  const createMockStep = (overrides = {}): TransformedStep => ({
    id: "step-1",
    order_index: 0,
    status: "unlocked",
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    has_reflection: false,
    plan_created_at: null,
    knowledge_content: {
      id: "content-1",
      title: "Test Mental Model",
      category: "Cognitive Biases",
      type: "mental-model",
      summary: "Test summary",
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  describe("Applying State Detection", () => {
    it("should detect applying state when step has plan but no reflection", () => {
      const step = createMockStep({
        plan_situation: "Test situation",
        plan_trigger: "Test trigger",
        plan_action: "Test action",
        has_reflection: false,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      // Check for hourglass emoji
      expect(screen.getByText("⏳")).toBeInTheDocument();

      // Check for applying message
      expect(screen.getByText("You're on a mission to apply what you learned")).toBeInTheDocument();

      // Check for correct CTA text
      expect(screen.getByText(/Reflect On What You Learned/)).toBeInTheDocument();

      // Check step label shows "Applying"
      expect(screen.getByText(/Step 1 • Applying/)).toBeInTheDocument();
    });

    it("should not show applying state when step has no plan", () => {
      const step = createMockStep({
        plan_situation: null,
        plan_trigger: null,
        plan_action: null,
        has_reflection: false,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      // Should not show hourglass or applying message
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should show "Start Learning" CTA
      expect(screen.getByText(/Start Learning/)).toBeInTheDocument();

      // Should show "Current" label instead of "Applying"
      expect(screen.getByText(/Step 1 • Current/)).toBeInTheDocument();
    });

    it("should not show applying state when step has reflection", () => {
      const step = createMockStep({
        plan_situation: "Test situation",
        plan_trigger: "Test trigger",
        plan_action: "Test action",
        has_reflection: true,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      // Should not show hourglass or applying message
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should show "View Step" CTA
      expect(screen.getByText(/View Step/)).toBeInTheDocument();
    });

    it("should not show applying state when step is completed", () => {
      const step = createMockStep({
        plan_situation: "Test situation",
        plan_trigger: "Test trigger",
        plan_action: "Test action",
        has_reflection: false,
        status: "completed",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={true} />);

      // Should not show hourglass or applying message
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();

      // Should not show any CTA button
      expect(
        screen.queryByRole("button", { name: /Reflect On What You Learned/i })
      ).not.toBeInTheDocument();
    });

    it("should not show applying state when step is locked", () => {
      const step = createMockStep({
        plan_situation: "Test situation",
        plan_trigger: "Test trigger",
        plan_action: "Test action",
        has_reflection: false,
        status: "locked",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={false} />);

      // Should not show hourglass or applying message
      expect(screen.queryByText("⏳")).not.toBeInTheDocument();
      expect(
        screen.queryByText("You're on a mission to apply what you learned")
      ).not.toBeInTheDocument();
    });
  });

  describe("CTA Text Updates", () => {
    it("should show 'Start Learning' when no plan exists", () => {
      const step = createMockStep();

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      expect(screen.getByText(/Start Learning/)).toBeInTheDocument();
    });

    it("should show 'Reflect On What You Learned' when plan exists but no reflection", () => {
      const step = createMockStep({
        plan_situation: "Test",
        plan_trigger: "Test",
        plan_action: "Test",
        has_reflection: false,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      expect(screen.getByText(/Reflect On What You Learned/)).toBeInTheDocument();
    });

    it("should show 'View Step' when both plan and reflection exist", () => {
      const step = createMockStep({
        plan_situation: "Test",
        plan_trigger: "Test",
        plan_action: "Test",
        has_reflection: true,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      expect(screen.getByText(/View Step/)).toBeInTheDocument();
    });

    it("should not show CTA for completed steps", () => {
      const step = createMockStep({
        status: "completed",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={true} />);

      // Should not have any clickable CTA button with arrow
      expect(screen.queryByText(/→/)).not.toBeInTheDocument();
    });

    it("should not show CTA for locked steps", () => {
      const step = createMockStep({
        status: "locked",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={false} />);

      // Should not have any clickable CTA button with arrow
      expect(screen.queryByText(/→/)).not.toBeInTheDocument();
    });
  });

  describe("Navigation Logic", () => {
    it("should navigate to learn screen when no plan exists", () => {
      const step = createMockStep();

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      const button = screen.getByText(/Start Learning/);
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/learn/step-1");
    });

    it("should navigate to reflect screen when plan exists but no reflection", () => {
      const step = createMockStep({
        plan_situation: "Test",
        plan_trigger: "Test",
        plan_action: "Test",
        has_reflection: false,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      const button = screen.getByText(/Reflect On What You Learned/);
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/reflect/step-1");
    });

    it("should navigate to learn screen when both plan and reflection exist", () => {
      const step = createMockStep({
        plan_situation: "Test",
        plan_trigger: "Test",
        plan_action: "Test",
        has_reflection: true,
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      const button = screen.getByText(/View Step/);
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/learn/step-1");
    });

    it("should not navigate when step is locked", () => {
      const step = createMockStep({
        status: "locked",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={false} />);

      // No clickable button should exist
      const buttons = screen.queryAllByRole("button");
      buttons.forEach((button) => {
        fireEvent.click(button);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Visual States", () => {
    it("should show completed indicator for completed steps", () => {
      const step = createMockStep({
        status: "completed",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={true} />);

      // Check for check icon (using aria-label from component)
      const checkIcon = screen.getByTestId("roadmap-step-0").querySelector(".text-white");
      expect(checkIcon).toBeInTheDocument();
    });

    it("should show lock icon for locked steps", () => {
      const step = createMockStep({
        status: "locked",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={false} isCompleted={false} />);

      // The lock icon should be present in the step indicator
      const stepContainer = screen.getByTestId("roadmap-step-0");
      const lockIcon = stepContainer.querySelector(".text-gray-400");
      expect(lockIcon).toBeInTheDocument();
    });

    it("should show active indicator for current available step", () => {
      const step = createMockStep({
        status: "unlocked",
      });

      render(<RoadmapStep step={step} index={0} isAvailable={true} isCompleted={false} />);

      // Check for the active button with step number
      const activeButton = screen.getByRole("button", { name: /Current step 1/i });
      expect(activeButton).toBeInTheDocument();
      expect(activeButton).toHaveClass("bg-blue-500");
    });
  });
});
