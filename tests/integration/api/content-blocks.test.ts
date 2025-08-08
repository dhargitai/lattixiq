import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/content-blocks/[contentId]/route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Content Blocks API", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };

    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it("should return content for valid content_id", async () => {
    const mockContent = {
      content: "## Test Content\n\nThis is test content",
      metadata: { version: "1.0" },
    };

    mockSupabase.single.mockResolvedValue({
      data: mockContent,
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/api/content-blocks/test-content");
    const params = Promise.resolve({ contentId: "test-content" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockContent);
    expect(mockSupabase.from).toHaveBeenCalledWith("content_blocks");
    expect(mockSupabase.eq).toHaveBeenCalledWith("content_id", "test-content");
    expect(mockSupabase.eq).toHaveBeenCalledWith("published", true);
  });

  it("should return 404 for non-existent content_id", async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    const request = new NextRequest("http://localhost:3000/api/content-blocks/non-existent");
    const params = Promise.resolve({ contentId: "non-existent" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "Content not found" });
  });

  it("should return 400 for invalid content_id", async () => {
    const request = new NextRequest("http://localhost:3000/api/content-blocks/");
    const params = Promise.resolve({ contentId: "" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid content ID" });
  });

  it("should return 500 for database errors", async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: "42P01", message: "Database error" },
    });

    const request = new NextRequest("http://localhost:3000/api/content-blocks/test-content");
    const params = Promise.resolve({ contentId: "test-content" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch content" });
  });

  it("should use cache for repeated requests", async () => {
    const mockContent = {
      content: "## Cached Content",
      metadata: { cached: true },
    };

    mockSupabase.single.mockResolvedValue({
      data: mockContent,
      error: null,
    });

    const request1 = new NextRequest("http://localhost:3000/api/content-blocks/cached-content");
    const params1 = Promise.resolve({ contentId: "cached-content" });

    const response1 = await GET(request1, { params: params1 });
    const data1 = await response1.json();

    // Second request should use cache
    const request2 = new NextRequest("http://localhost:3000/api/content-blocks/cached-content");
    const params2 = Promise.resolve({ contentId: "cached-content" });

    const response2 = await GET(request2, { params: params2 });
    const data2 = await response2.json();

    expect(data1).toEqual(mockContent);
    expect(data2).toEqual(mockContent);
    // Database should only be called once due to caching
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);
  });
});
