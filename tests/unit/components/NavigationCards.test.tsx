import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationCards } from "@/components/features/toolkit/NavigationCards";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("NavigationCards", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe("Happy Path", () => {
    it("should render only My Learned Models card for MVP", () => {
      render(
        <NavigationCards
          learnedModelsCount={5}
          completedRoadmapsCount={2}
          recentLogEntry={{
            text: "Applied First Principles to a work problem",
            date: new Date().toISOString(),
          }}
        />
      );

      // Should show My Learned Models card
      expect(screen.getByText("My Learned Models")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();

      // Should NOT show My Completed Roadmaps card (commented out for MVP)
      expect(screen.queryByText("My Completed Roadmaps")).not.toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();

      // Should NOT show Application Log card (commented out for MVP)
      expect(screen.queryByText("Application Log")).not.toBeInTheDocument();
      expect(screen.queryByText(/Applied First Principles/)).not.toBeInTheDocument();
    });

    it("should maintain proper layout with single card", () => {
      const { container } = render(
        <NavigationCards learnedModelsCount={10} completedRoadmapsCount={0} recentLogEntry={null} />
      );

      // Should have the MY LEARNINGS section header
      expect(screen.getByText("MY LEARNINGS")).toBeInTheDocument();

      // Should have exactly one navigation card
      const cards = container.querySelectorAll('[data-testid="navigation-card"]');
      expect(cards).toHaveLength(1);

      // Card should maintain proper styling classes
      const [card] = cards;
      expect(card).toHaveClass("p-4", "hover:shadow-md", "transition-all", "cursor-pointer");
    });

    it("should navigate to models page when My Learned Models card is clicked", async () => {
      render(
        <NavigationCards learnedModelsCount={3} completedRoadmapsCount={0} recentLogEntry={null} />
      );

      const card = screen.getByTestId("navigation-card");
      await userEvent.click(card);

      expect(mockPush).toHaveBeenCalledWith("/models");
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("should use custom onClick handler when provided", async () => {
      const customClickHandler = vi.fn();

      render(
        <NavigationCards
          learnedModelsCount={3}
          completedRoadmapsCount={0}
          recentLogEntry={null}
          onLearnedModelsClick={customClickHandler}
        />
      );

      const card = screen.getByTestId("navigation-card");
      await userEvent.click(card);

      expect(customClickHandler).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Unhappy Path", () => {
    it("should not throw errors when panels are commented out", () => {
      expect(() => {
        render(
          <NavigationCards
            learnedModelsCount={0}
            completedRoadmapsCount={0}
            recentLogEntry={null}
          />
        );
      }).not.toThrow();
    });

    it("should handle zero counts gracefully", () => {
      render(
        <NavigationCards learnedModelsCount={0} completedRoadmapsCount={0} recentLogEntry={null} />
      );

      expect(screen.getByText("My Learned Models")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle missing recent log entry", () => {
      render(
        <NavigationCards learnedModelsCount={5} completedRoadmapsCount={2} recentLogEntry={null} />
      );

      // Should not crash and should still render the My Learned Models card
      expect(screen.getByText("My Learned Models")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large numbers correctly", () => {
      render(
        <NavigationCards
          learnedModelsCount={999}
          completedRoadmapsCount={100}
          recentLogEntry={null}
        />
      );

      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("should maintain accessibility attributes", () => {
      render(
        <NavigationCards learnedModelsCount={5} completedRoadmapsCount={2} recentLogEntry={null} />
      );

      const card = screen.getByTestId("navigation-card");
      expect(card).toHaveAttribute("data-testid", "navigation-card");
    });
  });
});
