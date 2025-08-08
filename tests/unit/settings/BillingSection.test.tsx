import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BillingSection from "@/components/settings/BillingSection";

// Mock fetch
global.fetch = vi.fn();

describe("BillingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    render(<BillingSection isLoading={true} />);

    expect(screen.getByText("BILLING")).toBeInTheDocument();
    expect(document.querySelector(".animate-fadeIn")).toBeInTheDocument();
  });

  it("renders free subscription status correctly", () => {
    render(<BillingSection subscriptionStatus="free" isLoading={false} />);

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
  });

  it("renders premium subscription status correctly", () => {
    render(
      <BillingSection
        subscriptionStatus="active"
        stripeCustomerId="cus_123"
        subscriptionPeriodEnd="2025-02-08T00:00:00Z"
        isLoading={false}
      />
    );

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText(/Renews/)).toBeInTheDocument();
  });

  it("renders trial subscription status correctly", () => {
    render(
      <BillingSection
        subscriptionStatus="trialing"
        stripeCustomerId="cus_123"
        subscriptionPeriodEnd="2025-02-08T00:00:00Z"
        isLoading={false}
      />
    );

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText(/Trial ends/)).toBeInTheDocument();
  });

  it("renders past due subscription status correctly", () => {
    render(
      <BillingSection subscriptionStatus="past_due" stripeCustomerId="cus_123" isLoading={false} />
    );

    expect(screen.getByText("Past Due")).toBeInTheDocument();
  });

  it("does not respond to clicks for free users", async () => {
    render(<BillingSection subscriptionStatus="free" isLoading={false} />);

    const card = screen.getByText("Subscription").closest(".bg-white");
    fireEvent.click(card!);

    // Fetch should not be called for free users
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("calls billing portal API for premium users", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://billing.stripe.com/session/123" }),
    });

    // Mock window.location.href
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    render(
      <BillingSection subscriptionStatus="active" stripeCustomerId="cus_123" isLoading={false} />
    );

    const card = screen.getByText("Subscription").closest(".bg-white");
    fireEvent.click(card!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe("https://billing.stripe.com/session/123");
    });

    // Restore original location
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("handles billing portal API error gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <BillingSection subscriptionStatus="active" stripeCustomerId="cus_123" isLoading={false} />
    );

    const card = screen.getByText("Subscription").closest(".bg-white");
    fireEvent.click(card!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create billing portal session");
    });

    consoleErrorSpy.mockRestore();
  });

  it("formats subscription period end date correctly", () => {
    const testDate = "2025-02-15T00:00:00Z";

    render(
      <BillingSection
        subscriptionStatus="active"
        stripeCustomerId="cus_123"
        subscriptionPeriodEnd={testDate}
        isLoading={false}
      />
    );

    expect(screen.getByText(/Feb 15, 2025/)).toBeInTheDocument();
  });

  it("shows subscription period only for premium users", () => {
    render(
      <BillingSection
        subscriptionStatus="free"
        subscriptionPeriodEnd="2025-02-15T00:00:00Z"
        isLoading={false}
      />
    );

    expect(screen.queryByText(/Renews/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Trial ends/)).not.toBeInTheDocument();
  });
});
