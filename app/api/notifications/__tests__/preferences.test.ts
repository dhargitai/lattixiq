import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "../preferences/route";
import { NextRequest } from "next/server";

// Mock the Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  })),
}));

describe("Notification Preferences API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/notifications/preferences", () => {
    it("should return user reminder preferences", async () => {
      const mockUser = { id: "user-123" };
      const mockUserData = {
        id: "user-123",
        reminder_enabled: true,
        reminder_time: "14:30",
        reminder_timezone: "America/New_York",
      };

      const { createClient } = await import("@/lib/supabase/server");
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUserData, error: null }),
            }),
          }),
        }),
      };
      // @ts-expect-error - Mocking Supabase client
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        enabled: true,
        time: "14:30",
        timezone: "America/New_York",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      const { createClient } = await import("@/lib/supabase/server");
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: new Error("Not authenticated") }),
        },
      };
      // @ts-expect-error - Mocking Supabase client
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });
  });

  describe("PUT /api/notifications/preferences", () => {
    it("should update user reminder preferences", async () => {
      const mockUser = { id: "user-123" };
      const updateData = {
        enabled: true,
        time: "09:00",
        timezone: "UTC",
      };

      const { createClient } = await import("@/lib/supabase/server");
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
      // @ts-expect-error - Mocking Supabase client
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
    });

    it("should return 400 for invalid request body", async () => {
      const mockUser = { id: "user-123" };
      const invalidData = {
        enabled: "not a boolean",
        time: 123,
        timezone: null,
      };

      const { createClient } = await import("@/lib/supabase/server");
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      };
      // @ts-expect-error - Mocking Supabase client
      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const request = new NextRequest("http://localhost:3000/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid request body" });
    });
  });
});
