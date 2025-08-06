import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderGreeting } from "@/components/features/toolkit/HeaderGreeting";
import { QuickStats } from "@/components/features/toolkit/QuickStats";
import { ActiveRoadmapCard } from "@/components/features/toolkit/ActiveRoadmapCard";
import { QuickActions } from "@/components/features/toolkit/QuickActions";
import { NavigationCards } from "@/components/features/toolkit/NavigationCards";
import { EmptyState } from "@/components/features/toolkit/EmptyState";
import type { ToolkitStats, ActiveRoadmapData } from "@/lib/db/toolkit";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Toolkit Components", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe("HeaderGreeting", () => {
    it("should display greeting with Achiever", () => {
      render(<HeaderGreeting userName="Achiever" />);
      expect(screen.getByText("Welcome back, Achiever!")).toBeInTheDocument();
    });
  });

  describe("QuickStats", () => {
    it("should display user statistics", () => {
      const stats: ToolkitStats = {
        streak: 5,
        totalLearned: 10,
      };

      render(<QuickStats stats={stats} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Day Streak")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Models Learned")).toBeInTheDocument();
    });
  });

  describe("ActiveRoadmapCard", () => {
    it("should display active roadmap information", () => {
      const roadmap: ActiveRoadmapData = {
        id: "test-id",
        goal_description: "Stop Procrastinating",
        currentStep: {
          id: "step-1",
          title: "First Principles Thinking",
          order: 2,
          status: "unlocked",
          planCreatedAt: null,
          hasReflection: false,
        },
        totalSteps: 7,
        completedSteps: 3,
        lastActivityDate: new Date().toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={roadmap} />);

      expect(screen.getByText("ACTIVE ROADMAP")).toBeInTheDocument();
      expect(screen.getByText("Stop Procrastinating")).toBeInTheDocument();
      expect(screen.getByText(/First Principles Thinking/)).toBeInTheDocument();
      expect(screen.getByText("Step 4 of 7")).toBeInTheDocument();
    });

    it("should navigate to roadmap page on arrow click", async () => {
      const roadmap: ActiveRoadmapData = {
        id: "test-id",
        goal_description: "Test Goal",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: null,
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={roadmap} />);

      const arrowButton = screen.getByRole("button");
      await userEvent.click(arrowButton);

      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });

    it("should show correct time ago formatting", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const roadmap: ActiveRoadmapData = {
        id: "test-id",
        goal_description: "Test Goal",
        currentStep: null,
        totalSteps: 5,
        completedSteps: 0,
        lastActivityDate: yesterday.toISOString(),
        isNearCompletion: false,
        isPaused: false,
      };

      render(<ActiveRoadmapCard roadmap={roadmap} />);

      expect(screen.getByText(/Yesterday/)).toBeInTheDocument();
    });
  });

  describe("QuickActions", () => {
    it("should show start first roadmap button when no active roadmap", async () => {
      render(<QuickActions hasActiveRoadmap={false} hasActivePlan={false} currentStepId={null} />);

      const button = screen.getByText("Start Your First Roadmap");
      expect(button).toBeInTheDocument();

      await userEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith("/new-roadmap");
    });

    it("should show reflection button when active plan exists", () => {
      render(
        <QuickActions hasActiveRoadmap={true} hasActivePlan={true} currentStepId="step-123" />
      );

      expect(screen.getByText("Today's Reflection")).toBeInTheDocument();
    });

    it("should NOT show Start New Roadmap when roadmap is active", () => {
      render(<QuickActions hasActiveRoadmap={true} hasActivePlan={false} currentStepId={null} />);

      expect(screen.queryByText("Start New Roadmap")).not.toBeInTheDocument();
    });

    it("should navigate to step reflection page on button click", async () => {
      render(
        <QuickActions hasActiveRoadmap={true} hasActivePlan={true} currentStepId="step-123" />
      );

      await userEvent.click(screen.getByText("Today's Reflection"));
      expect(mockPush).toHaveBeenCalledWith("/reflect/step-123");
    });
  });

  describe("NavigationCards", () => {
    it("should display all navigation cards with counts", () => {
      const recentLog = {
        text: "Applied First Principles to a work problem",
        date: new Date().toISOString(),
      };

      render(
        <NavigationCards
          learnedModelsCount={5}
          completedRoadmapsCount={2}
          recentLogEntry={recentLog}
        />
      );

      expect(screen.getByText("My Learned Models")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();

      expect(screen.getByText("My Completed Roadmaps")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();

      expect(screen.getByText("Application Log")).toBeInTheDocument();
      expect(screen.getByText(/Applied First Principles/)).toBeInTheDocument();
    });

    it("should navigate to correct routes on card clicks", async () => {
      render(
        <NavigationCards learnedModelsCount={0} completedRoadmapsCount={0} recentLogEntry={null} />
      );

      const cards = screen.getAllByTestId("navigation-card");

      await userEvent.click(cards[0]);
      expect(mockPush).toHaveBeenCalledWith("/models");

      await userEvent.click(cards[1]);
      expect(mockPush).toHaveBeenCalledWith("/roadmaps/completed");

      await userEvent.click(cards[2]);
      expect(mockPush).toHaveBeenCalledWith("/logs");
    });

    it("should truncate long text in recent log entry", () => {
      const longText =
        "This is a very long reflection text that should be truncated after a certain number of characters to maintain the layout";
      const recentLog = {
        text: longText,
        date: new Date().toISOString(),
      };

      render(
        <NavigationCards
          learnedModelsCount={0}
          completedRoadmapsCount={0}
          recentLogEntry={recentLog}
        />
      );

      const displayedText = screen.getByText(/This is a very long reflection text/);
      expect(displayedText.textContent).toContain("...");
      expect(displayedText.textContent?.length).toBeLessThan(longText.length);
    });
  });

  describe("EmptyState", () => {
    it("should display welcome message for new users", () => {
      render(<EmptyState />);

      expect(screen.getByText("Welcome to Your Toolkit!")).toBeInTheDocument();
      expect(screen.getByText(/Your personal space for growth/)).toBeInTheDocument();
      expect(screen.getByText("Start Your First Roadmap")).toBeInTheDocument();
    });

    it("should navigate to onboarding on button click", async () => {
      render(<EmptyState />);

      const button = screen.getByText("Start Your First Roadmap");
      await userEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/new-roadmap");
    });

    it("should display discovery badges", () => {
      render(<EmptyState />);

      expect(screen.getByText("Mental Models")).toBeInTheDocument();
      expect(screen.getByText("Cognitive Biases")).toBeInTheDocument();
      expect(screen.getByText("Decision Frameworks")).toBeInTheDocument();
      expect(screen.getByText("Problem-Solving Tools")).toBeInTheDocument();
    });
  });
});
