import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { User, UserUpdate } from "@/lib/supabase/types";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Cast to User type which includes reminder fields
  const typedUser = userData as User | null;

  return NextResponse.json({
    enabled: typedUser?.reminder_enabled ?? false,
    time: typedUser?.reminder_time ?? "09:00",
    timezone: typedUser?.reminder_timezone ?? "UTC",
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { enabled, time, timezone } = body;

  if (typeof enabled !== "boolean" || typeof time !== "string" || typeof timezone !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Cast the update object to UserUpdate type
  const updateData: UserUpdate = {
    reminder_enabled: enabled,
    reminder_time: time,
    reminder_timezone: timezone,
  };

  const { error } = await supabase.from("users").update(updateData).eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
