import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasShownModal,
  hasShownModalClient,
  addShownModal,
  getShownModals,
  generateModalId,
  migrateLocalStorageModals,
  clearAllModalCache,
} from "@/lib/db/user-preferences";
import { createClient } from "@/lib/supabase/server";
import { createClient as createClientClient } from "@/lib/supabase/client";

// Mock Supabase clients
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/supabase/client");

describe("User Preferences - Modal Tracking", () => {
  const mockUserId = "user-123";
  const mockModalId = "plan-step-456";

  const mockSupabaseQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
  };

  const mockSupabaseClient = {
    from: vi.fn(() => mockSupabaseQuery),
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearAllModalCache(); // Clear the cache before each test

    // Reset the mock chain to always return mockSupabaseQuery
    mockSupabaseQuery.select.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.eq.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.update.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.single.mockResolvedValue({
      data: null,
      error: null,
    });

    // @ts-expect-error - mocking async function
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
    vi.mocked(createClientClient).mockReturnValue(mockSupabaseClient);
  });

  describe("generateModalId", () => {
    it("generates consistent modal IDs", () => {
      const modalId = generateModalId("plan", "step-123");
      expect(modalId).toBe("plan-step-123");
    });

    it("handles different modal types", () => {
      expect(generateModalId("reflect", "step-456")).toBe("reflect-step-456");
      expect(generateModalId("learn", "step-789")).toBe("learn-step-789");
    });
  });

  describe("hasShownModal", () => {
    it("returns true when modal exists in array", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: ["plan-step-123", mockModalId, "plan-step-789"] },
        error: null,
      });

      const result = await hasShownModal(mockUserId, mockModalId);
      expect(result).toBe(true);
    });

    it("returns false when modal does not exist in array", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: ["plan-step-123", "plan-step-789"] },
        error: null,
      });

      const result = await hasShownModal(mockUserId, mockModalId);
      expect(result).toBe(false);
    });

    it("returns false when shown_modals is null", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: null },
        error: null,
      });

      const result = await hasShownModal(mockUserId, mockModalId);
      expect(result).toBe(false);
    });

    it("returns false on database error", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await hasShownModal(mockUserId, mockModalId);
      expect(result).toBe(false);
    });

    it("uses cache on subsequent calls", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: [mockModalId] },
        error: null,
      });

      // First call - should hit database
      const result1 = await hasShownModal(mockUserId, mockModalId);
      expect(result1).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(1);

      // Clear mocks but the cache should remain
      vi.clearAllMocks();

      // Second call - should use cache
      const result2 = await hasShownModal(mockUserId, mockModalId);
      expect(result2).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(0); // Should not call database again
    });
  });

  describe("hasShownModalClient", () => {
    it("returns false when user is not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await hasShownModalClient(mockModalId);
      expect(result).toBe(false);
    });

    it("returns true when modal exists for authenticated user", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: [mockModalId] },
        error: null,
      });

      const result = await hasShownModalClient(mockModalId);
      expect(result).toBe(true);
    });
  });

  describe("addShownModal", () => {
    it("adds modal to empty array", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: [] },
        error: null,
      });

      mockSupabaseQuery.eq.mockResolvedValue({
        error: null,
      });

      await addShownModal(mockUserId, mockModalId);

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        shown_modals: [mockModalId],
      });
    });

    it("adds modal to existing array", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: ["plan-step-123"] },
        error: null,
      });

      mockSupabaseQuery.eq.mockResolvedValue({
        error: null,
      });

      await addShownModal(mockUserId, mockModalId);

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        shown_modals: ["plan-step-123", mockModalId],
      });
    });

    it("does not add duplicate modals", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: [mockModalId] },
        error: null,
      });

      await addShownModal(mockUserId, mockModalId);

      expect(mockSupabaseQuery.update).not.toHaveBeenCalled();
    });

    it("throws error on database failure", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(addShownModal(mockUserId, mockModalId)).rejects.toThrow();
    });
  });

  describe("getShownModals", () => {
    it("returns array of shown modals", async () => {
      const modals = ["plan-step-123", "plan-step-456", "reflect-step-789"];
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: modals },
        error: null,
      });

      const result = await getShownModals(mockUserId);
      expect(result).toEqual(modals);
    });

    it("returns empty array when shown_modals is null", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: null },
        error: null,
      });

      const result = await getShownModals(mockUserId);
      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await getShownModals(mockUserId);
      expect(result).toEqual([]);
    });
  });

  describe("migrateLocalStorageModals", () => {
    // Mock localStorage
    const localStorageMock = {
      length: 0,
      storage: {} as Record<string, string>,
      key: vi.fn((index: number) => {
        const keys = Object.keys(localStorageMock.storage);
        return keys[index] || null;
      }),
      getItem: vi.fn((key: string) => localStorageMock.storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock.storage[key] = value;
        localStorageMock.length = Object.keys(localStorageMock.storage).length;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock.storage[key];
        localStorageMock.length = Object.keys(localStorageMock.storage).length;
      }),
      clear: vi.fn(() => {
        localStorageMock.storage = {};
        localStorageMock.length = 0;
      }),
    };

    beforeEach(() => {
      localStorageMock.clear();
      Object.defineProperty(global, "localStorage", {
        value: localStorageMock,
        writable: true,
      });
    });

    it("migrates localStorage modal data to database", async () => {
      // Set up localStorage with modal data
      localStorageMock.setItem("plan-modal-shown-step-123", "true");
      localStorageMock.setItem("plan-modal-shown-step-456", "true");
      localStorageMock.setItem("other-key", "value"); // Should be ignored

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: [] },
        error: null,
      });

      mockSupabaseQuery.eq.mockResolvedValue({
        error: null,
      });

      const migratedCount = await migrateLocalStorageModals();

      expect(migratedCount).toBe(2);
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        shown_modals: ["plan-step-123", "plan-step-456"],
      });

      // Verify localStorage was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("plan-modal-shown-step-123");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("plan-modal-shown-step-456");
    });

    it("skips migration when no localStorage data exists", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const migratedCount = await migrateLocalStorageModals();

      expect(migratedCount).toBe(0);
      expect(mockSupabaseQuery.update).not.toHaveBeenCalled();
    });

    it("avoids duplicates when migrating", async () => {
      localStorageMock.setItem("plan-modal-shown-step-123", "true");

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: { shown_modals: ["plan-step-123"] }, // Already exists
        error: null,
      });

      const migratedCount = await migrateLocalStorageModals();

      expect(migratedCount).toBe(0);
      expect(mockSupabaseQuery.update).not.toHaveBeenCalled();
    });

    it("returns 0 when user is not authenticated", async () => {
      localStorageMock.setItem("plan-modal-shown-step-123", "true");

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const migratedCount = await migrateLocalStorageModals();

      expect(migratedCount).toBe(0);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });
});
