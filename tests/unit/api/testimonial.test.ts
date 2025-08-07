import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/users/testimonial/route";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("PATCH /api/users/testimonial", () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
  };
  const mockedCreateClient = vi.mocked(createClient);

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    mockedCreateClient.mockResolvedValue(mockSupabase as never);
  });

  it("returns 401 if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/users/testimonial", {
      method: "PATCH",
      body: JSON.stringify({ testimonialState: "asked_first" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if testimonialState is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/users/testimonial", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("testimonialState is required");
  });

  it("validates state transitions", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { testimonial_state: "submitted" },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const request = new NextRequest("http://localhost/api/users/testimonial", {
      method: "PATCH",
      body: JSON.stringify({ testimonialState: "asked_first" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid state transition");
  });

  it("successfully updates testimonial state", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    // Mock getting current user state
    const mockSelectGet = vi.fn().mockReturnThis();
    const mockEqGet = vi.fn().mockReturnThis();
    const mockSingleGet = vi.fn().mockResolvedValue({
      data: { testimonial_state: "not_asked" },
      error: null,
    });

    // Mock updating user state
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEqUpdate = vi.fn().mockReturnThis();
    const mockSelectUpdate = vi.fn().mockReturnThis();
    const mockSingleUpdate = vi.fn().mockResolvedValue({
      data: {
        id: "user-123",
        testimonial_state: "asked_first",
        testimonial_url: null,
      },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: mockSelectGet,
          eq: mockEqGet,
          single: mockSingleGet,
          update: mockUpdate,
        };
      }
    });

    mockUpdate.mockReturnValue({
      eq: mockEqUpdate,
    });

    mockEqUpdate.mockReturnValue({
      select: mockSelectUpdate,
    });

    mockSelectUpdate.mockReturnValue({
      single: mockSingleUpdate,
    });

    const request = new NextRequest("http://localhost/api/users/testimonial", {
      method: "PATCH",
      body: JSON.stringify({ testimonialState: "asked_first" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.testimonial_state).toBe("asked_first");
  });

  it("updates testimonial URL when submitting", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    // Mock getting current user state
    const mockSelectGet = vi.fn().mockReturnThis();
    const mockEqGet = vi.fn().mockReturnThis();
    const mockSingleGet = vi.fn().mockResolvedValue({
      data: { testimonial_state: "asked_first" },
      error: null,
    });

    // Mock updating user state
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEqUpdate = vi.fn().mockReturnThis();
    const mockSelectUpdate = vi.fn().mockReturnThis();
    const mockSingleUpdate = vi.fn().mockResolvedValue({
      data: {
        id: "user-123",
        testimonial_state: "submitted",
        testimonial_url: "https://senja.io/test",
      },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: mockSelectGet,
          eq: mockEqGet,
          single: mockSingleGet,
          update: mockUpdate,
        };
      }
    });

    mockUpdate.mockReturnValue({
      eq: mockEqUpdate,
    });

    mockEqUpdate.mockReturnValue({
      select: mockSelectUpdate,
    });

    mockSelectUpdate.mockReturnValue({
      single: mockSingleUpdate,
    });

    const request = new NextRequest("http://localhost/api/users/testimonial", {
      method: "PATCH",
      body: JSON.stringify({
        testimonialState: "submitted",
        testimonialUrl: "https://senja.io/test",
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.testimonial_state).toBe("submitted");
    expect(data.testimonial_url).toBe("https://senja.io/test");
    expect(mockUpdate).toHaveBeenCalledWith({
      testimonial_state: "submitted",
      testimonial_url: "https://senja.io/test",
    });
  });
});
