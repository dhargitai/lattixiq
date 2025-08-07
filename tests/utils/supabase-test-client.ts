import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Create a Supabase client with the service role for testing
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY environment variable is required for integration tests. " +
        "For local testing, get this from 'supabase status' command."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to clean up test users
export async function cleanupTestUser(
  supabase: ReturnType<typeof createTestClient>,
  userId: string
) {
  // Delete user data in the correct order to avoid foreign key constraints
  // First get all roadmaps for this user
  const { data: roadmaps } = await supabase.from("roadmaps").select("id").eq("user_id", userId);

  if (roadmaps) {
    // Delete roadmap steps for all user's roadmaps
    for (const roadmap of roadmaps) {
      await supabase.from("roadmap_steps").delete().eq("roadmap_id", roadmap.id);
    }
  }

  await supabase.from("application_logs").delete().eq("user_id", userId);
  await supabase.from("roadmaps").delete().eq("user_id", userId);
  await supabase.from("notification_logs").delete().eq("user_id", userId);
  await supabase.from("users").delete().eq("id", userId);

  // Delete from auth.users
  await supabase.auth.admin.deleteUser(userId);
}
