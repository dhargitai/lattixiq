import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkCanCreateRoadmap,
  hasCompletedFreeRoadmap,
  hasActiveSubscription,
  getUserSubscriptionStatus,
} from "@/lib/subscription/check-limits";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Subscription Limit Checking", () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client with chainable methods
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  describe("hasActiveSubscription", () => {
    it("should return true for active subscription", async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          subscription_status: "active",
          subscription_current_period_end: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });

      const result = await hasActiveSubscription("user-123");
      expect(result).toBe(true);
    });

    it("should return false for expired subscription", async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          subscription_status: "active",
          subscription_current_period_end: new Date(Date.now() - 86400000).toISOString(),
        },
        error: null,
      });

      const result = await hasActiveSubscription("user-123");
      expect(result).toBe(false);
    });

    it("should return false for canceled subscription", async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          subscription_status: "canceled",
          subscription_current_period_end: null,
        },
        error: null,
      });

      const result = await hasActiveSubscription("user-123");
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const result = await hasActiveSubscription("user-123");
      expect(result).toBe(false);
    });
  });

  describe("hasCompletedFreeRoadmap", () => {
    it("should return true if user has completed roadmaps", async () => {
      mockSupabase.limit.mockResolvedValue({
        data: [{ id: "roadmap-1" }],
        error: null,
      });

      const result = await hasCompletedFreeRoadmap("user-123");
      expect(result).toBe(true);
    });

    it("should return false if user has no completed roadmaps", async () => {
      mockSupabase.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await hasCompletedFreeRoadmap("user-123");
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      mockSupabase.limit.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const result = await hasCompletedFreeRoadmap("user-123");
      expect(result).toBe(false);
    });
  });

  describe("checkCanCreateRoadmap", () => {
    it("should allow creation with active subscription", async () => {
      // First call: user_subscriptions table
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          subscription_status: "active",
          subscription_current_period_end: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });

      const result = await checkCanCreateRoadmap("user-123");
      expect(result).toBe(true);
    });

    it("should allow first roadmap without subscription", async () => {
      // First call: user_subscriptions table (no subscription)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }, // No rows found
      });

      // Second call: users table
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          roadmap_count: 0,
          free_roadmaps_used: false,
          testimonial_bonus_used: false,
          testimonial_url: null,
        },
        error: null,
      });

      const result = await checkCanCreateRoadmap("user-123");
      expect(result).toBe(true);
    });

    it("should block second roadmap without subscription", async () => {
      // First call: user_subscriptions table (no subscription)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }, // No rows found
      });

      // Second call: users table (already used free roadmap)
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          roadmap_count: 1,
          free_roadmaps_used: true,
          testimonial_bonus_used: false,
          testimonial_url: null,
        },
        error: null,
      });

      const result = await checkCanCreateRoadmap("user-123");
      expect(result).toBe(false);
    });
  });

  describe("getUserSubscriptionStatus", () => {
    it("should return complete subscription status", async () => {
      // Mock active subscription
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          subscription_status: "active",
          subscription_current_period_end: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });

      // Mock completed roadmap
      mockSupabase.limit.mockResolvedValue({
        data: [{ id: "roadmap-1" }],
        error: null,
      });

      // Mock subscription status check
      mockSupabase.single.mockResolvedValue({
        data: {
          subscription_status: "active",
        },
        error: null,
      });

      const result = await getUserSubscriptionStatus("user-123");

      expect(result).toEqual({
        isSubscribed: true,
        status: "active",
        canCreateRoadmap: true,
        completedFreeRoadmap: true,
        hasTestimonialBonus: false,
      });
    });

    it("should handle free user with no roadmaps", async () => {
      // Mock no subscription
      mockSupabase.single.mockResolvedValue({
        data: {
          subscription_status: "free",
          subscription_current_period_end: null,
        },
        error: null,
      });

      // Mock no completed roadmaps
      mockSupabase.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getUserSubscriptionStatus("user-123");

      expect(result).toEqual({
        isSubscribed: false,
        status: "free",
        canCreateRoadmap: true,
        completedFreeRoadmap: false,
        hasTestimonialBonus: false,
      });
    });
  });
});
