import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BillingSection from "@/components/settings/BillingSection";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("BillingSection", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as MockedFunction<typeof useRouter>).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as AppRouterInstance);
  });

  describe("Plan Display", () => {
    it("should display Free badge for free users", () => {
      render(<BillingSection subscriptionStatus="free" />);

      const badge = screen.getByText("Free");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-[#F7FAFC]", "text-[#4A5568]");
    });

    it("should display Premium badge for premium users", () => {
      render(<BillingSection subscriptionStatus="premium" stripeCustomerId="cus_123" />);

      const badge = screen.getByText("Premium");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "bg-gradient-to-r",
        "from-[#F6E05E]",
        "to-[#ECC94B]",
        "text-[#744210]"
      );
    });

    it("should default to Free badge when status is undefined", () => {
      render(<BillingSection />);

      const badge = screen.getByText("Free");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-[#F7FAFC]", "text-[#4A5568]");
    });

    it("should display Subscription label", () => {
      render(<BillingSection />);

      expect(screen.getByText("Subscription")).toBeInTheDocument();
    });
  });

  describe("Navigation Behavior", () => {
    it("should navigate to /pricing for free users", async () => {
      render(<BillingSection subscriptionStatus="free" />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/pricing");
      });
    });

    it("should navigate to /pricing when no subscription status", async () => {
      render(<BillingSection />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/pricing");
      });
    });

    it("should log Stripe portal action for premium users with customer ID", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      render(<BillingSection subscriptionStatus="premium" stripeCustomerId="cus_123" />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      fireEvent.click(card);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Redirect to Stripe customer portal");
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("should navigate to /pricing for premium users without customer ID", async () => {
      render(<BillingSection subscriptionStatus="premium" />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/pricing");
      });
    });
  });

  describe("Loading State", () => {
    it("should display skeleton loader when loading", () => {
      const { container } = render(<BillingSection isLoading={true} />);

      // Check for skeleton elements using the Skeleton component's class
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);

      // Should not display actual content
      expect(screen.queryByText("Free")).not.toBeInTheDocument();
      expect(screen.queryByText("Premium")).not.toBeInTheDocument();
    });

    it("should display content when not loading", () => {
      render(<BillingSection isLoading={false} subscriptionStatus="free" />);

      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("Subscription")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have proper hover styles on card", () => {
      render(<BillingSection />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      expect(card).toHaveClass(
        "bg-white",
        "border",
        "border-[#E2E8F0]",
        "rounded-xl",
        "hover:border-[#CBD5E0]",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        "cursor-pointer"
      );
    });

    it("should have chevron icon", () => {
      render(<BillingSection />);

      // Check for ChevronRight icon by its parent container
      const iconContainer = screen.getByText("Free").parentElement;
      expect(iconContainer?.querySelector("svg")).toBeInTheDocument();
    });

    it("should have proper section styling", () => {
      render(<BillingSection />);

      const section = screen.getByText("BILLING").parentElement;
      expect(section).toHaveClass("mb-9", "animate-fadeIn", "animation-delay-100");
    });
  });

  describe("Error Handling", () => {
    it("should handle navigation errors gracefully", async () => {
      const mockPushWithError = vi.fn().mockRejectedValue(new Error("Navigation failed"));
      (useRouter as MockedFunction<typeof useRouter>).mockReturnValue({
        push: mockPushWithError,
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      } as AppRouterInstance);

      render(<BillingSection subscriptionStatus="free" />);

      const card = screen.getByText("Subscription").closest("div[data-slot='card']") as HTMLElement;
      fireEvent.click(card);

      // Should not throw an error
      await waitFor(() => {
        expect(mockPushWithError).toHaveBeenCalledWith("/pricing");
      });
    });
  });
});
