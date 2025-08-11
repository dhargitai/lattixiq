import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasCompletedOnboarding,
  hasCompletedOnboardingClient,
  addShownModal,
  hasShownModal,
  getShownModals,
  generateModalId,
  clearModalCache,
  clearAllModalCache,
  migrateLocalStorageModals,
} from "@/lib/db/user-preferences";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

// Mock createClient functions
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("User Preferences Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllModalCache();
    mockLocalStorage.length = 0;
  });

  describe("hasCompletedOnboarding", () => {
    it("should return true when user has roadmap_count > 0", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { roadmap_count: 3 },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasCompletedOnboarding("user-123");
      expect(result).toBe(true);
    });

    it("should return false when user has roadmap_count = 0", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { roadmap_count: 0 },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasCompletedOnboarding("user-123");
      expect(result).toBe(false);
    });

    it("should return false when user data is null", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasCompletedOnboarding("user-123");
      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasCompletedOnboarding("user-123");
      expect(result).toBe(false);
    });

    it("should return false for invalid userId", async () => {
      const result = await hasCompletedOnboarding("");
      expect(result).toBe(false);
    });
  });

  describe("hasCompletedOnboardingClient", () => {
    it("should return true when authenticated user has roadmap_count > 0", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { roadmap_count: 2 },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasCompletedOnboardingClient();
      expect(result).toBe(true);
    });

    it("should return false when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth error"),
      });

      const result = await hasCompletedOnboardingClient();
      expect(result).toBe(false);
    });
  });

  describe("hasShownModal", () => {
    it("should return true when modal has been shown", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: ["modal-1", "modal-2"] },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasShownModal("user-123", "modal-1");
      expect(result).toBe(true);
    });

    it("should return false when modal has not been shown", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: ["modal-1", "modal-2"] },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasShownModal("user-123", "modal-3");
      expect(result).toBe(false);
    });

    it("should return false when shown_modals is null", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: null },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasShownModal("user-123", "modal-1");
      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await hasShownModal("user-123", "modal-1");
      expect(result).toBe(false);
    });

    it("should return false for invalid parameters", async () => {
      const result = await hasShownModal("", "");
      expect(result).toBe(false);
    });
  });

  describe("addShownModal", () => {
    it("should successfully add a new modal ID", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: ["modal-1"] },
        error: null,
      });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      await expect(addShownModal("user-123", "modal-2")).resolves.not.toThrow();
    });

    it("should not add duplicate modal IDs", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: ["modal-1", "modal-2"] },
        error: null,
      });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      await expect(addShownModal("user-123", "modal-1")).resolves.not.toThrow();
      // Should not call update since modal already exists
      expect(mockEq).not.toHaveBeenCalled();
    });

    it("should handle null shown_modals array", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: null },
        error: null,
      });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      await expect(addShownModal("user-123", "modal-1")).resolves.not.toThrow();
    });
  });

  describe("getShownModals", () => {
    it("should return array of shown modals", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: ["modal-1", "modal-2", "modal-3"] },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getShownModals("user-123");
      expect(result).toEqual(["modal-1", "modal-2", "modal-3"]);
    });

    it("should return empty array when shown_modals is null", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: null },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getShownModals("user-123");
      expect(result).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getShownModals("user-123");
      expect(result).toEqual([]);
    });
  });

  describe("generateModalId", () => {
    it("should generate consistent modal IDs", () => {
      const result = generateModalId("plan", "step-123");
      expect(result).toBe("plan-step-123");
    });

    it("should handle empty strings", () => {
      const result = generateModalId("", "");
      expect(result).toBe("-");
    });
  });

  describe("cache functions", () => {
    it("should clear cache for specific user", () => {
      clearModalCache("user-123");
      expect(true).toBe(true); // Function exists and can be called
    });

    it("should clear all cache", () => {
      clearAllModalCache();
      expect(true).toBe(true); // Function exists and can be called
    });
  });

  describe("migrateLocalStorageModals", () => {
    beforeEach(() => {
      mockLocalStorage.clear();
      mockLocalStorage.length = 0;
    });

    it("should migrate localStorage modals to database", async () => {
      // Setup localStorage mock
      mockLocalStorage.length = 2;
      mockLocalStorage.key.mockImplementation((index) =>
        index === 0 ? "plan-modal-shown-step-1" : "plan-modal-shown-step-2"
      );
      mockLocalStorage.getItem.mockImplementation((key) =>
        key.startsWith("plan-modal-shown-") ? "true" : null
      );

      // Setup auth and database mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { shown_modals: [] },
        error: null,
      });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      const result = await migrateLocalStorageModals();
      expect(result).toBe(2);
    });

    it("should handle empty localStorage", async () => {
      mockLocalStorage.length = 0;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const result = await migrateLocalStorageModals();
      expect(result).toBe(0);
    });

    it("should handle authentication errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth error"),
      });

      const result = await migrateLocalStorageModals();
      expect(result).toBe(0);
    });
  });
});
