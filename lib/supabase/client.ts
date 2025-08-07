import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

function createMockClient() {
  // Lazy load the mock client only when needed
  try {
    // This uses a synchronous require which is acceptable in test environments
    // We can't use import() here as it's async and would change the function signature
    const authMocks = eval("require")("@/tests/utils/auth-mocks");
    return authMocks.createMockSupabaseClient(authMocks.mockUsers.authenticated);
  } catch {
    console.warn("Mock Supabase client not available, falling back to real client");
    return null;
  }
}

export function createClient() {
  // E2E test mode - use mock client
  if (process.env.NEXT_PUBLIC_E2E_TEST === "true") {
    console.log("E2E test mode - using mock Supabase client");
    const mockClient = createMockClient();
    if (mockClient) return mockClient;
  }

  // Integration test mode - use mock client
  if (process.env.INTEGRATION_TEST === "true" || process.env.NODE_ENV === "test") {
    console.log("Integration test mode - using mock Supabase client");
    const mockClient = createMockClient();
    if (mockClient) return mockClient;
  }

  // Production/development mode - use real client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are not set (e.g., during build), return a mock client
  if (!url || !key) {
    console.warn("Supabase environment variables not set, using mock client");
    const mockClient = createMockClient();
    if (mockClient) return mockClient;

    // Fallback: create with placeholder values to prevent build errors
    return createBrowserClient<Database>("https://placeholder.supabase.co", "placeholder-key");
  }

  return createBrowserClient<Database>(url, key);
}
