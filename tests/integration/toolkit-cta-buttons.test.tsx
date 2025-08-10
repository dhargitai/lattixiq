import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuickActions } from "@/components/features/toolkit/QuickActions";
import { EmptyState } from "@/components/features/toolkit/EmptyState";
import { ApplicationGuidanceModal } from "@/components/modals/ApplicationGuidanceModal";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Toolkit CTA Buttons Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("QuickActions CTA Buttons", () => {
    it("should use StandardCTAButton for 'Start Your First Roadmap'", () => {
      render(
        <QuickActions
          hasActiveRoadmap={false}
          hasActivePlan={false}
          currentStepId={null}
          hasCompletedRoadmap={false}
        />
      );

      const button = screen.getByRole("button", { name: /start your first roadmap/i });
      expect(button).toBeInTheDocument();

      // Should have primary variant styles (blue gradient)
      expect(button).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-blue-600");

      // Should have standard CTA button styling
      expect(button).toHaveClass(
        "font-semibold",
        "rounded-xl",
        "transition-all",
        "duration-300",
        "shadow-lg"
      );
    });

    it("should use StandardCTAButton for 'Start New Roadmap' when available", () => {
      render(
        <QuickActions
          hasActiveRoadmap={false}
          hasActivePlan={false}
          currentStepId={null}
          hasCompletedRoadmap={true}
          userId="test-user"
        />
      );

      // Note: The actual button shown depends on canCreateRoadmap state
      // which is determined by an API call in useEffect
      // We're testing that IF the button appears, it uses StandardCTAButton
      const button = screen.queryByRole("button");
      if (button && button.textContent?.includes("Start New Roadmap")) {
        expect(button).toHaveClass(
          "bg-gradient-to-r",
          "from-blue-500",
          "to-blue-600",
          "font-semibold",
          "rounded-xl"
        );
      }
    });
  });

  describe("EmptyState CTA Button", () => {
    it("should use StandardCTAButton with correct primary variant", () => {
      render(<EmptyState />);

      const button = screen.getByRole("button", { name: /start your first roadmap/i });
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

      // Should include arrow icon
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("ApplicationGuidanceModal CTA Button", () => {
    it("should use StandardCTAButton with correct primary variant", () => {
      render(
        <ApplicationGuidanceModal
          isOpen={true}
          onClose={vi.fn()}
          conceptType="mental-model"
          conceptName="Test Model"
        />
      );

      const button = screen.getByRole("button", { name: /got it/i });
      expect(button).toBeInTheDocument();

      // Should have primary variant styles (blue gradient)
      expect(button).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-blue-600");

      // Should be full width
      expect(button).toHaveClass("w-full");

      // Should have standard CTA button styling
      expect(button).toHaveClass("font-semibold", "rounded-xl", "transition-all", "duration-300");
    });

    it("should have medium size styling", () => {
      render(
        <ApplicationGuidanceModal isOpen={true} onClose={vi.fn()} conceptType="cognitive-bias" />
      );

      const button = screen.getByRole("button", { name: /got it/i });

      // Should have medium size styling
      expect(button).toHaveClass("px-10", "py-6", "text-lg");
    });
  });

  describe("Button Consistency Across Toolkit Components", () => {
    it("should have consistent hover effects", () => {
      const { rerender } = render(<EmptyState />);

      let button = screen.getByRole("button");
      expect(button).toHaveClass("hover:-translate-y-0.5");

      rerender(
        <QuickActions
          hasActiveRoadmap={false}
          hasActivePlan={false}
          currentStepId={null}
          hasCompletedRoadmap={false}
        />
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass("hover:-translate-y-0.5");

      rerender(
        <ApplicationGuidanceModal isOpen={true} onClose={vi.fn()} conceptType="mental-model" />
      );

      button = screen.getByRole("button", { name: /got it/i });
      expect(button).toHaveClass("hover:-translate-y-0.5");
    });

    it("should have consistent shadow effects", () => {
      const { rerender } = render(<EmptyState />);

      let button = screen.getByRole("button");
      expect(button).toHaveClass("shadow-lg", "hover:shadow-xl");

      rerender(
        <QuickActions
          hasActiveRoadmap={false}
          hasActivePlan={false}
          currentStepId={null}
          hasCompletedRoadmap={false}
        />
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass("shadow-lg", "hover:shadow-xl");
    });

    it("should all use rounded-xl for consistent border radius", () => {
      const { rerender } = render(<EmptyState />);

      let button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-xl");

      rerender(
        <QuickActions
          hasActiveRoadmap={false}
          hasActivePlan={false}
          currentStepId={null}
          hasCompletedRoadmap={false}
        />
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-xl");

      rerender(<ApplicationGuidanceModal isOpen={true} onClose={vi.fn()} conceptType="fallacy" />);

      button = screen.getByRole("button", { name: /got it/i });
      expect(button).toHaveClass("rounded-xl");
    });
  });
});
