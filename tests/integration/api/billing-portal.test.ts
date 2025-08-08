import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/billing-portal/route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("stripe", () => {
  const mockStripe = vi.fn();
  mockStripe.prototype.billingPortal = {
    sessions: {
      create: vi.fn(),
    },
  };
  return { default: mockStripe };
});

describe("Billing Portal API Route", () => {
  interface MockSupabase {
    auth: {
      getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
  }

  let mockSupabase: MockSupabase;
  let mockStripeInstance: {
    billingPortal: {
      sessions: {
        create: ReturnType<typeof vi.fn>;
      };
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);

    // Setup mock Stripe instance
    const MockStripeClass = Stripe as unknown as { new (): typeof mockStripeInstance };
    mockStripeInstance = new MockStripeClass();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 404 when subscription not found", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Subscription not found");
  });

  it("returns 400 when no Stripe customer ID exists", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { stripe_customer_id: null },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No Stripe customer found. Please upgrade to Premium first.");
  });

  it("successfully creates billing portal session", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { stripe_customer_id: "cus_123" },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockStripeInstance.billingPortal.sessions.create.mockResolvedValue({
      url: "https://billing.stripe.com/session/test_123",
    });

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://billing.stripe.com/session/test_123");
    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: expect.stringContaining("/settings"),
    });
  });

  it("uses NEXT_PUBLIC_APP_URL when available", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://myapp.com";

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { stripe_customer_id: "cus_123" },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockStripeInstance.billingPortal.sessions.create.mockResolvedValue({
      url: "https://billing.stripe.com/session/test_123",
    });

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    await POST(request);

    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://myapp.com/settings",
    });

    // Restore original env
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("handles Stripe API errors gracefully", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { stripe_customer_id: "cus_123" },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockStripeInstance.billingPortal.sessions.create.mockRejectedValue(
      new Error("Stripe API error")
    );

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create billing portal session");
  });

  it("handles unexpected errors gracefully", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/billing-portal", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred processing your request");
  });
});
