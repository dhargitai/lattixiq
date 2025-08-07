import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { middleware } from "@/middleware";
import { createServerClient } from "@supabase/ssr";

// Mock Supabase SSR
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

// Mock NextResponse
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(),
      redirect: vi.fn(),
    },
  };
});

const mockNextResponse = NextResponse as any;
const mockCreateServerClient = createServerClient as any;

describe("Auto-redirect middleware", () => {
  let mockRequest: Partial<NextRequest>;
  let mockSupabase: any;
  let mockCookies: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockCookies = {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    };

    const mockNextUrl = {
      pathname: "/toolkit",
      clone: vi.fn(() => mockNextUrl),
    };

    mockRequest = {
      nextUrl: mockNextUrl as any,
      cookies: mockCookies,
    };

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            count: 0,
          })),
        })),
      })),
    };

    const mockResponse = {
      cookies: {
        set: vi.fn(),
        getAll: vi.fn(() => []),
        setAll: vi.fn(),
      },
    };

    mockNextResponse.next.mockReturnValue(mockResponse);
    mockNextResponse.redirect.mockReturnValue(mockResponse);
    mockCreateServerClient.mockReturnValue(mockSupabase);
  });

  describe("New user redirect behavior", () => {
    it("should redirect authenticated users with 0 roadmaps to /new-roadmap", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 0 })),
        })),
      });

      const redirectUrl = { pathname: "/new-roadmap" };
      (mockRequest.nextUrl as any).clone = vi.fn(() => redirectUrl);

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("roadmaps");
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it("should NOT redirect users with existing roadmaps", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 2 })),
        })),
      });

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it("should NOT redirect when user is already on /new-roadmap", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 0 })),
        })),
      });

      mockRequest.nextUrl!.pathname = "/new-roadmap";

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it("should NOT redirect when user is on auth routes", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 0 })),
        })),
      });

      mockRequest.nextUrl!.pathname = "/auth/callback";

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      // Note: This test validates our new redirect logic doesn't interfere
      // with auth routes, but existing auth logic may still redirect
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should NOT redirect when user is on API routes", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 0 })),
        })),
      });

      mockRequest.nextUrl!.pathname = "/api/roadmaps";

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("Existing user normal flow", () => {
    it("should allow users with roadmaps to access any route", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 3 })),
        })),
      });

      mockRequest.nextUrl!.pathname = "/toolkit";

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("Auth flow regression tests", () => {
    it("should still redirect unauthenticated users to login for protected routes", async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockRequest.nextUrl!.pathname = "/(app)/toolkit";

      const redirectUrl = { pathname: "/login" };
      (mockRequest.nextUrl as any).clone = vi.fn(() => redirectUrl);

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it("should still redirect authenticated users away from auth routes", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockRequest.nextUrl!.pathname = "/(auth)/login";

      const redirectUrl = { pathname: "/" };
      (mockRequest.nextUrl as any).clone = vi.fn(() => redirectUrl);

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe("Error handling and performance", () => {
    it("should handle database query errors gracefully", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.reject(new Error("Database error"))),
        })),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const redirectUrl = { pathname: "/new-roadmap" };
      (mockRequest.nextUrl as any).clone = vi.fn(() => redirectUrl);

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith("Error counting user roadmaps:", expect.any(Error));
      // On error, function returns 0, which should trigger redirect to /new-roadmap for safety
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(redirectUrl);

      consoleSpy.mockRestore();
    });

    it("should use efficient count query with head=true", async () => {
      // Arrange
      const user = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const mockEq = vi.fn(() => Promise.resolve({ count: 1 }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      // Act
      await middleware(mockRequest as NextRequest);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("roadmaps");
      expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(mockEq).toHaveBeenCalledWith("user_id", user.id);
    });
  });
});
