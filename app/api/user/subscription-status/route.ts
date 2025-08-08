import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/lib/subscription/check-limits";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription status
    const status = await getUserSubscriptionStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 });
  }
}
