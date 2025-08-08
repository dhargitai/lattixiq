import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { LRUCache } from "lru-cache";

// Cache configuration - 15 minutes TTL, max 100 items
const cache = new LRUCache<string, { content: string; metadata?: unknown }>({
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
});

// Input validation schema
const paramsSchema = z.object({
  contentId: z.string().min(1).max(255),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    // Await the params to get the contentId
    const resolvedParams = await params;

    // Validate contentId
    const result = paramsSchema.safeParse({ contentId: resolvedParams.contentId });
    if (!result.success) {
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 });
    }

    const { contentId } = result.data;

    // Check cache first
    const cached = cache.get(contentId);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get content from database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("content, metadata")
      .eq("content_id", contentId)
      .eq("published", true)
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }
      console.error("Error fetching content block:", error);
      return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }

    // Cache the result
    cache.set(contentId, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Content blocks API error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
