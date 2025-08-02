import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  // Allow bypassing auth in e2e tests
  if (process.env.NEXT_PUBLIC_E2E_TEST === "true") {
    console.log("E2E test mode - bypassing auth");
    return {
      id: "test-user-id",
      email: "test@example.com",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
}
