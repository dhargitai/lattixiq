import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatSubscriptionPeriod,
  isSubscriptionActive,
  getSubscriptionStatus,
  getSubscriptionDetails,
} from "@/lib/subscription/status";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Subscription Status Utilities", () => {
  const mockSupabase = {
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  describe("formatSubscriptionPeriod", () => {
    it("returns null for null date", () => {
      expect(formatSubscriptionPeriod(null)).toBeNull();
    });

    it("formats date more than 7 days away", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = formatSubscriptionPeriod(futureDate.toISOString());
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/); // e.g., "March 10, 2025"
    });

    it("shows 'in X days' for dates within 7 days", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const result = formatSubscriptionPeriod(futureDate.toISOString());
      expect(result).toBe("in 3 days");
    });

    it("shows 'in 1 day' for tomorrow", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = formatSubscriptionPeriod(tomorrow.toISOString());
      expect(result).toBe("in 1 day");
    });
  });

  describe("isSubscriptionActive", () => {
    it("returns true for active status", () => {
      expect(isSubscriptionActive("active")).toBe(true);
    });

    it("returns true for trialing status", () => {
      expect(isSubscriptionActive("trialing")).toBe(true);
    });

    it("returns false for free status", () => {
      expect(isSubscriptionActive("free")).toBe(false);
    });

    it("returns false for past_due status", () => {
      expect(isSubscriptionActive("past_due")).toBe(false);
    });

    it("returns false for canceled status", () => {
      expect(isSubscriptionActive("canceled")).toBe(false);
    });
  });

  describe("getSubscriptionStatus", () => {
    it("returns subscription status when found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { subscription_status: "active" },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getSubscriptionStatus("user123");

      expect(mockSupabase.from).toHaveBeenCalledWith("user_subscriptions");
      expect(mockSelect).toHaveBeenCalledWith("subscription_status");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user123");
      expect(result).toBe("active");
    });

    it("returns free when no subscription found", async () => {
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

      const result = await getSubscriptionStatus("user123");
      expect(result).toBe("free");
    });

    it("returns free when subscription_status is null", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { subscription_status: null },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getSubscriptionStatus("user123");
      expect(result).toBe("free");
    });
  });

  describe("getSubscriptionDetails", () => {
    it("returns complete subscription details when found", async () => {
      const mockData = {
        subscription_status: "active",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_456",
        subscription_current_period_end: "2025-02-15T00:00:00Z",
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getSubscriptionDetails("user123");

      expect(result.userId).toBe("user123");
      expect(result.status).toBe("active");
      expect(result.stripeCustomerId).toBe("cus_123");
      expect(result.stripeSubscriptionId).toBe("sub_456");
      expect(result.isActive).toBe(true);
      expect(result.isPastDue).toBe(false);
      expect(result.formattedPeriodEnd).toBeTruthy();
    });

    it("returns default details when no subscription found", async () => {
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

      const result = await getSubscriptionDetails("user123");

      expect(result.userId).toBe("user123");
      expect(result.status).toBe("free");
      expect(result.stripeCustomerId).toBeNull();
      expect(result.stripeSubscriptionId).toBeNull();
      expect(result.isActive).toBe(false);
      expect(result.isPastDue).toBe(false);
      expect(result.formattedPeriodEnd).toBeNull();
    });

    it("correctly identifies past_due status", async () => {
      const mockData = {
        subscription_status: "past_due",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_456",
        subscription_current_period_end: "2025-02-15T00:00:00Z",
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getSubscriptionDetails("user123");

      expect(result.status).toBe("past_due");
      expect(result.isActive).toBe(false);
      expect(result.isPastDue).toBe(true);
    });

    it("correctly identifies trialing status as active", async () => {
      const mockData = {
        subscription_status: "trialing",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_456",
        subscription_current_period_end: "2025-02-15T00:00:00Z",
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getSubscriptionDetails("user123");

      expect(result.status).toBe("trialing");
      expect(result.isActive).toBe(true);
      expect(result.isPastDue).toBe(false);
    });
  });
});
