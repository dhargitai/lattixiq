import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/logout/route";
import { createClient } from "@/lib/supabase/server";

// Mock the supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("POST /api/auth/logout", () => {
  let mockSupabase: {
    auth: {
      signOut: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signOut: vi.fn(),
      },
    };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  it("should successfully logout user", async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

    const response = await POST();
    const data = await response.json();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(data).toEqual({ message: "Successfully logged out" });
  });

  it("should clear auth cookies on successful logout", async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

    const response = await POST();
    const setCookieHeader = response.headers.get("set-cookie");

    expect(setCookieHeader).toContain("sb-access-token=");
    expect(setCookieHeader).toContain("sb-refresh-token=");
    expect(setCookieHeader).toContain("Max-Age=0");
  });

  it("should handle Supabase error gracefully", async () => {
    const mockError = { message: "Sign out failed" };
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: mockError });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to sign out" });
  });

  it("should handle unexpected errors gracefully", async () => {
    mockSupabase.auth.signOut.mockRejectedValueOnce(new Error("Unexpected error"));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "An unexpected error occurred" });
  });
});
