import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client with service role privileges.
 * This client bypasses Row Level Security and should only be used
 * for server-side operations that require full database access.
 *
 * Use cases:
 * - Cron jobs and scheduled functions
 * - Webhook handlers
 * - Admin operations
 *
 * IMPORTANT: Never expose this client to the frontend or use it
 * for regular user requests. Always validate authorization before
 * using this client.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
