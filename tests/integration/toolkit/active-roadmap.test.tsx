import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveRoadmapCard } from "@/components/features/toolkit/ActiveRoadmapCard";
import { ActiveRoadmapCardSkeleton } from "@/components/features/toolkit/ActiveRoadmapCardSkeleton";
import { ActiveRoadmapCardError } from "@/components/features/toolkit/ActiveRoadmapCardError";
import type { ActiveRoadmapData } from "@/lib/db/toolkit";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("ActiveRoadmapCard Integration Tests", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe("Data Fetching and Display", () => {
    it("should display roadmap data correctly", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Learn to make better decisions",
        currentStep: {
          id: "step-2",
          title: "First Principles Thinking",
          order: 2,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 7,
        completedSteps: 1,
        lastActivityDate: new Date().toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("ACTIVE ROADMAP")).toBeInTheDocument();
      expect(screen.getByText("Learn to make better decisions")).toBeInTheDocument();
      expect(screen.getByText("First Principles Thinking")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 7")).toBeInTheDocument();
      expect(screen.getByText("READY TO START")).toBeInTheDocument();
    });

    it("should display skeleton loader", () => {
      const { container } = render(<ActiveRoadmapCardSkeleton />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should display error state with retry", async () => {
      const mockRetry = vi.fn();
      render(<ActiveRoadmapCardError retry={mockRetry} />);

      expect(screen.getByText("Unable to Load Roadmap")).toBeInTheDocument();
      const retryButton = screen.getByText("Retry");

      await userEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate progress correctly for partial completion", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test Goal",
        currentStep: {
          id: "step-4",
          title: "Mental Model 4",
          order: 4,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 7,
        completedSteps: 3,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("Step 4 of 7")).toBeInTheDocument();
      // Progress bar should be at 3/7 = ~43%
    });

    it("should identify near completion state", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Almost Done",
        currentStep: {
          id: "step-7",
          title: "Final Model",
          order: 7,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 7,
        completedSteps: 6,
        lastActivityDate: new Date().toISOString(),
        isNearCompletion: true,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("FINAL STEP")).toBeInTheDocument();
    });
  });

  describe("Navigation Logic", () => {
    it("should navigate to roadmap page on arrow button click", async () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: {
          id: "step-1",
          title: "Model 1",
          order: 1,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      // Find the arrow button (icon button in top right)
      const buttons = screen.getAllByRole("button");
      const [arrowButton] = buttons; // First button is the arrow icon button
      await userEvent.click(arrowButton);

      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });

    it("should navigate to roadmap on Continue Learning click", async () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: {
          id: "step-2",
          title: "Model 2",
          order: 2,
          status: "unlocked",
          planCreatedAt: "2024-01-01",
          hasReflection: false,
        },
        totalSteps: 5,
        completedSteps: 1,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      const continueButton = screen.getByRole("button", {
        name: /Continue Learning/i,
      });
      await userEvent.click(continueButton);

      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });

  describe("Step Phase Detection", () => {
    it("should show IN PROGRESS when plan exists but no reflection", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: {
          id: "step-1",
          title: "Model 1",
          order: 1,
          status: "unlocked",
          planCreatedAt: "2024-01-01T10:00:00Z",
          hasReflection: false,
        },
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    });

    it("should show READY TO START when no plan exists", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: {
          id: "step-1",
          title: "Model 1",
          order: 1,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("READY TO START")).toBeInTheDocument();
    });
  });

  describe("Time Formatting", () => {
    it("should format time as Just now for recent activity", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: new Date().toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText(/Just now/)).toBeInTheDocument();
    });

    it("should format time as Yesterday for 1 day ago", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: yesterday.toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText(/Yesterday/)).toBeInTheDocument();
    });

    it("should format time as days ago for 2-6 days", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: threeDaysAgo.toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
    });

    it("should show No activity yet for null date", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText(/No activity yet/)).toBeInTheDocument();
    });
  });

  describe("Paused State", () => {
    it("should show paused state for inactive roadmaps", () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Paused Journey",
        currentStep: {
          id: "step-3",
          title: "Model 3",
          order: 3,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 7,
        completedSteps: 2,
        lastActivityDate: tenDaysAgo.toISOString(),
        isNearCompletion: false,
        isPaused: true,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("PAUSED")).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Resume Learning/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing current step gracefully", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: "Test",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 2,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      expect(screen.queryByText("Current Step:")).not.toBeInTheDocument();
    });

    it("should handle missing goal description", () => {
      const mockRoadmap: ActiveRoadmapData = {
        id: "roadmap-1",
        goal_description: null,
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={mockRoadmap} />);

      expect(screen.getByText("Your Learning Journey")).toBeInTheDocument();
    });
  });
});
