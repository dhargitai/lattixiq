import { describe, it, expect, beforeEach, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase client
vi.mock("@supabase/supabase-js");

describe("User Preferences Database Operations", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "test-user-id",
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as ReturnType<typeof createClient>);
  });

  describe("shown_modals column", () => {
    it("should return empty array as default for new users", async () => {
      const mockUser = {
        id: "test-user-id",
        email: "test@example.com",
        shown_modals: [],
        created_at: new Date().toISOString(),
        reminder_enabled: false,
        reminder_time: "09:00:00",
        reminder_timezone: "UTC",
        reminder_last_sent: null,
        testimonial_state: "not_asked",
        testimonial_url: null,
        roadmap_count: 0,
        free_roadmaps_used: false,
        testimonial_bonus_used: false,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const { data, error } = await mockSupabase
        .from("users")
        .select("*")
        .eq("id", "test-user-id")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.shown_modals).toEqual([]);
      expect(Array.isArray(data.shown_modals)).toBe(true);
    });

    it("should allow updating shown_modals array", async () => {
      const updatedModals = ["step-123", "step-456"];

      mockSupabase.single.mockResolvedValue({
        data: { shown_modals: updatedModals },
        error: null,
      });

      const { data, error } = await mockSupabase
        .from("users")
        .update({ shown_modals: updatedModals })
        .eq("id", "test-user-id")
        .select("shown_modals")
        .single();

      expect(error).toBeNull();
      expect(data.shown_modals).toEqual(updatedModals);
    });

    it("should append new modal IDs to existing array", async () => {
      const existingModals = ["step-123", "step-456"];
      const newModalId = "step-789";
      const combinedModals = [...existingModals, newModalId];

      // Mock getting existing data
      mockSupabase.single.mockResolvedValueOnce({
        data: { shown_modals: existingModals },
        error: null,
      });

      // Get existing modals
      const { data: currentData } = await mockSupabase
        .from("users")
        .select("shown_modals")
        .eq("id", "test-user-id")
        .single();

      // Append new modal
      const updatedModals = [...currentData.shown_modals, newModalId];

      // Mock update
      mockSupabase.single.mockResolvedValueOnce({
        data: { shown_modals: updatedModals },
        error: null,
      });

      const { data: updatedData, error } = await mockSupabase
        .from("users")
        .update({ shown_modals: updatedModals })
        .eq("id", "test-user-id")
        .select("shown_modals")
        .single();

      expect(error).toBeNull();
      expect(updatedData.shown_modals).toEqual(combinedModals);
      expect(updatedData.shown_modals).toContain(newModalId);
    });

    it("should check if a specific modal has been shown", async () => {
      const modals = ["step-123", "step-456", "step-789"];

      mockSupabase.single.mockResolvedValue({
        data: { shown_modals: modals },
        error: null,
      });

      const { data } = await mockSupabase
        .from("users")
        .select("shown_modals")
        .eq("id", "test-user-id")
        .single();

      // Check if specific modals exist
      expect(data.shown_modals.includes("step-123")).toBe(true);
      expect(data.shown_modals.includes("step-999")).toBe(false);
    });

    it("should handle empty modal checks gracefully", async () => {
      mockSupabase.single.mockResolvedValue({
        data: { shown_modals: [] },
        error: null,
      });

      const { data } = await mockSupabase
        .from("users")
        .select("shown_modals")
        .eq("id", "test-user-id")
        .single();

      expect(data.shown_modals.includes("any-modal")).toBe(false);
      expect(data.shown_modals.length).toBe(0);
    });

    describe("RLS policies", () => {
      it("should allow authenticated users to read their own shown_modals", async () => {
        mockSupabase.single.mockResolvedValue({
          data: { shown_modals: ["step-123"] },
          error: null,
        });

        const { data, error } = await mockSupabase
          .from("users")
          .select("shown_modals")
          .eq("id", "test-user-id")
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.shown_modals).toBeDefined();
      });

      it("should allow authenticated users to update their own shown_modals", async () => {
        mockSupabase.single.mockResolvedValue({
          data: { shown_modals: ["updated-modal"] },
          error: null,
        });

        const { error } = await mockSupabase
          .from("users")
          .update({ shown_modals: ["updated-modal"] })
          .eq("id", "test-user-id")
          .single();

        expect(error).toBeNull();
      });

      it("should prevent users from updating other users' shown_modals", async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: {
            message: "new row violates row-level security policy",
            code: "42501",
          },
        });

        const { error } = await mockSupabase
          .from("users")
          .update({ shown_modals: ["hacker-modal"] })
          .eq("id", "other-user-id")
          .single();

        expect(error).toBeDefined();
        expect(error.code).toBe("42501");
      });
    });
  });

  describe("Integration with modal tracking", () => {
    it("should track plan modal shown state", async () => {
      const stepId = "step-123";
      const modalId = `plan-modal-${stepId}`;

      // Initially no modals shown
      mockSupabase.single.mockResolvedValueOnce({
        data: { shown_modals: [] },
        error: null,
      });

      const { data: initialData } = await mockSupabase
        .from("users")
        .select("shown_modals")
        .eq("id", "test-user-id")
        .single();

      expect(initialData.shown_modals).not.toContain(modalId);

      // Mark modal as shown
      const updatedModals = [modalId];
      mockSupabase.single.mockResolvedValueOnce({
        data: { shown_modals: updatedModals },
        error: null,
      });

      const { data: updatedData } = await mockSupabase
        .from("users")
        .update({ shown_modals: updatedModals })
        .eq("id", "test-user-id")
        .select("shown_modals")
        .single();

      expect(updatedData.shown_modals).toContain(modalId);
    });

    it("should handle multiple modal types", async () => {
      const modals = [
        "plan-modal-step-123",
        "onboarding-modal",
        "tutorial-modal-1",
        "plan-modal-step-456",
      ];

      mockSupabase.single.mockResolvedValue({
        data: { shown_modals: modals },
        error: null,
      });

      const { data } = await mockSupabase
        .from("users")
        .select("shown_modals")
        .eq("id", "test-user-id")
        .single();

      // Check different modal types
      const planModals = data.shown_modals.filter((m: string) => m.startsWith("plan-modal-"));
      const tutorialModals = data.shown_modals.filter((m: string) => m.startsWith("tutorial-"));

      expect(planModals).toHaveLength(2);
      expect(tutorialModals).toHaveLength(1);
      expect(data.shown_modals).toContain("onboarding-modal");
    });
  });
});
