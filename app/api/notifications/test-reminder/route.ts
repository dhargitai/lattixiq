import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldSendReminder } from "@/lib/notifications/timezone-utils";

/**
 * Test endpoint to check if a user would receive a reminder right now
 * GET /api/notifications/test-reminder?userId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Get user's reminder settings
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, reminder_enabled, reminder_time, reminder_timezone, reminder_last_sent")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // Check basic requirements
    const checks = {
      userId: user.id,
      email: user.email,
      reminderEnabled: user.reminder_enabled,
      reminderTime: user.reminder_time,
      reminderTimezone: user.reminder_timezone,
      reminderLastSent: user.reminder_last_sent,
    };

    // Check if user has an active plan
    const { data: activeSteps, error: stepsError } = await supabase
      .from("roadmap_steps")
      .select(
        `
        *,
        roadmap:roadmaps!inner(
          status,
          user_id
        ),
        knowledge_content(
          title
        )
      `
      )
      .eq("roadmap.user_id", userId)
      .eq("roadmap.status", "active")
      .not("plan_trigger", "is", null)
      .not("plan_action", "is", null)
      .eq("status", "unlocked")
      .order("order", { ascending: true })
      .limit(1);

    const hasActivePlan = activeSteps && activeSteps.length > 0;
    const activePlanDetails = hasActivePlan
      ? {
          stepId: activeSteps[0].id,
          title: activeSteps[0].knowledge_content?.title,
          planTrigger: activeSteps[0].plan_trigger,
          planAction: activeSteps[0].plan_action,
        }
      : null;

    // Check if reminder should be sent
    let shouldSend = false;
    let reason = "";

    if (!user.reminder_enabled) {
      reason = "Reminders are disabled for this user";
    } else if (!user.reminder_time) {
      reason = "No reminder time set";
    } else if (!user.reminder_timezone) {
      reason = "No timezone set";
    } else if (!hasActivePlan) {
      reason = "No active plan with trigger and action";
    } else {
      shouldSend = shouldSendReminder(
        user.reminder_time,
        user.reminder_last_sent,
        user.reminder_timezone
      );

      if (!shouldSend) {
        const now = new Date();
        const currentTimeInTz = now.toLocaleString("en-US", {
          timeZone: user.reminder_timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        reason = `Not within 5-minute window of ${user.reminder_time} (current time in ${user.reminder_timezone}: ${currentTimeInTz})`;

        if (user.reminder_last_sent) {
          const lastSentDate = new Date(user.reminder_last_sent);
          const lastSentInTz = lastSentDate.toLocaleString("en-US", {
            timeZone: user.reminder_timezone,
            dateStyle: "short",
            timeStyle: "short",
          });
          reason += ` or already sent today (last sent: ${lastSentInTz})`;
        }
      } else {
        reason = "✅ Reminder would be sent!";
      }
    }

    // Get current time info
    const now = new Date();
    const timeInfo = {
      utc: now.toISOString(),
      userTimezone: user.reminder_timezone || "Not set",
      currentTimeInUserTz: user.reminder_timezone
        ? now.toLocaleString("en-US", {
            timeZone: user.reminder_timezone,
            dateStyle: "short",
            timeStyle: "medium",
            hour12: false,
          })
        : "N/A",
      reminderTime: user.reminder_time || "Not set",
    };

    return NextResponse.json({
      wouldSendReminder: shouldSend,
      reason,
      userSettings: checks,
      activePlan: activePlanDetails,
      timeInfo,
      stepsError: stepsError?.message,
    });
  } catch (error) {
    console.error("Test reminder error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
