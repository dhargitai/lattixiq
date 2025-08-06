import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface NotificationPreferences {
  enabled: boolean;
  dailyReminderTime: string;
  timezone?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notifications } = body;

    if (!notifications || typeof notifications !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const prefs = notifications as NotificationPreferences;

    // Build the update object
    const updateData: Record<string, boolean | string> = {
      reminder_enabled: prefs.enabled,
      reminder_time: prefs.dailyReminderTime,
    };

    // Include timezone if provided
    if (prefs.timezone) {
      updateData.reminder_timezone = prefs.timezone;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    const preferences: NotificationPreferences = {
      enabled: data.reminder_enabled ?? true,
      dailyReminderTime: data.reminder_time ?? "09:00",
      timezone: data.reminder_timezone ?? "UTC",
    };

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("reminder_enabled, reminder_time")
      .eq("id", user.id)
      .single();

    const preferences: NotificationPreferences = {
      enabled: userData?.reminder_enabled ?? true,
      dailyReminderTime: userData?.reminder_time ?? "09:00",
    };

    return NextResponse.json({
      preferences,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
