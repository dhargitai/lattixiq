import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ContentBlock = Database["public"]["Tables"]["content_blocks"]["Row"];
type ContentBlockInsert = Database["public"]["Tables"]["content_blocks"]["Insert"];
type ContentBlockUpdate = Database["public"]["Tables"]["content_blocks"]["Update"];

/**
 * Fetches a content block by its content_id
 * @param contentId - The unique identifier for the content block
 * @returns The content block or null if not found/unpublished
 */
export async function getContentBlock(contentId: string): Promise<ContentBlock | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("content_id", contentId)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Error fetching content block:", error);
    return null;
  }

  return data;
}

/**
 * Updates a content block (for admin purposes)
 * @param contentId - The unique identifier for the content block
 * @param updates - The fields to update
 * @returns The updated content block or null if failed
 */
export async function updateContentBlock(
  contentId: string,
  updates: ContentBlockUpdate
): Promise<ContentBlock | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_blocks")
    .update(updates)
    .eq("content_id", contentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating content block:", error);
    return null;
  }

  return data;
}

/**
 * Lists all content blocks with optional filtering
 * @param publishedOnly - Whether to only return published blocks (default: true)
 * @returns Array of content blocks
 */
export async function listContentBlocks(publishedOnly = true): Promise<ContentBlock[]> {
  const supabase = await createClient();

  let query = supabase.from("content_blocks").select("*");

  if (publishedOnly) {
    query = query.eq("published", true);
  }

  const { data, error } = await query.order("content_id", { ascending: true });

  if (error) {
    console.error("Error listing content blocks:", error);
    return [];
  }

  return data || [];
}

/**
 * Creates a new content block (for admin purposes)
 * @param block - The content block to create
 * @returns The created content block or null if failed
 */
export async function createContentBlock(block: ContentBlockInsert): Promise<ContentBlock | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("content_blocks").insert(block).select().single();

  if (error) {
    console.error("Error creating content block:", error);
    return null;
  }

  return data;
}

/**
 * Fetches content for the premium benefits modal
 * @returns The premium benefits content or default content if not found
 */
export async function getPremiumBenefitsContent(): Promise<string> {
  const block = await getContentBlock("premium-benefits-modal");

  if (!block || !block.content) {
    // Return default content if database content not found
    return `## Unlock Your Full Potential with Premium

### What You Get:
- Unlimited Roadmaps
- Priority AI Processing
- Advanced Analytics
- Export Your Data
- Early Access to New Features

### Your Investment:
**$29/month** - Start your premium journey today!`;
  }

  return block.content;
}
