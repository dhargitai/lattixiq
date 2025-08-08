import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PremiumBenefitsDialog } from "@/components/features/subscription/PremiumBenefitsDialog";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// Mock Stripe config
vi.mock("@/lib/stripe/env-validation", () => ({
  stripeConfig: {
    monthlyProductId: "price_monthly_test",
    annualProductId: "price_annual_test",
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe("PremiumBenefitsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("should render when open", () => {
    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("Premium Access")).toBeInTheDocument();
    expect(
      screen.getByText("Take your personal growth journey to the next level")
    ).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    const { container } = render(<PremiumBenefitsDialog open={false} onOpenChange={vi.fn()} />);

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("should fetch content on open", async () => {
    const mockContent = {
      content: "## Premium Benefits\n\nTest content here",
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContent,
    });

    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/content-blocks/premium-benefits-modal");
    });

    await waitFor(() => {
      expect(screen.getByText("Premium Benefits")).toBeInTheDocument();
      expect(screen.getByText("Test content here")).toBeInTheDocument();
    });
  });

  it("should show default content if fetch fails", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Unlock Your Full Potential with Premium")).toBeInTheDocument();
      expect(screen.getByText(/\$9\.99\/month/)).toBeInTheDocument();
    });
  });

  it("should show loading state while fetching", async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ content: "Loaded content" }),
              }),
            100
          )
        )
    );

    const { container } = render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should handle checkout button click", async () => {
    const mockCheckoutUrl = "https://checkout.stripe.com/test";

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: "Test content" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: mockCheckoutUrl }),
      });

    // Mock window.location
    delete (window as any).location;
    window.location = { href: "" } as any;

    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Get Premium Access")).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText("Get Premium Access");
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: "price_monthly_test",
        }),
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe(mockCheckoutUrl);
    });
  });

  it("should show processing state during checkout", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: "Test content" }),
      })
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ url: "https://checkout.stripe.com/test" }),
                }),
              100
            )
          )
      );

    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Get Premium Access")).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText("Get Premium Access");
    fireEvent.click(checkoutButton);

    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(checkoutButton).toBeDisabled();
  });

  it("should handle checkout errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: "Test content" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Checkout failed" }),
      });

    render(<PremiumBenefitsDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Get Premium Access")).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText("Get Premium Access");
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create checkout session");
    });

    consoleErrorSpy.mockRestore();
  });

  it("should call onOpenChange when dialog is closed", () => {
    const mockOnOpenChange = vi.fn();

    const { rerender } = render(
      <PremiumBenefitsDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    // Simulate dialog close
    rerender(<PremiumBenefitsDialog open={false} onOpenChange={mockOnOpenChange} />);

    expect(mockOnOpenChange).toHaveBeenCalled();
  });
});
