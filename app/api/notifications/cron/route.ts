import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldSendReminder } from "@/lib/notifications/timezone-utils";

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron)
// It checks for users with reminders enabled at the current time and sends notifications
export async function GET(request: NextRequest) {
  // Validate CRON_SECRET is configured
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Verify this is an authorized cron request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();

  try {
    // Get all users with reminders enabled
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("reminder_enabled", true)
      .not("reminder_time", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        message: "No users with reminders enabled",
        count: 0,
      });
    }

    // Filter users who should receive reminders based on their timezone
    const usersToNotify = users.filter((user) => {
      if (!user.reminder_time || !user.reminder_timezone) return false;

      return shouldSendReminder(
        user.reminder_time,
        user.reminder_last_sent,
        user.reminder_timezone
      );
    });

    if (usersToNotify.length === 0) {
      return NextResponse.json({
        message: "No users to notify at this time",
        checked: users.length,
        toNotify: 0,
      });
    }

    // Process each user to notify
    const results = await Promise.all(
      usersToNotify.map(async (user) => {
        try {
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
            .eq("roadmap.user_id", user.id)
            .eq("roadmap.status", "active")
            .not("plan_situation", "is", null)
            .not("plan_action", "is", null)
            .eq("status", "unlocked")
            .order("order", { ascending: true })
            .limit(1);

          if (stepsError) {
            console.error(`Error fetching steps for user ${user.id}:`, stepsError);
            return { userId: user.id, status: "error", error: stepsError.message };
          }

          if (!activeSteps || activeSteps.length === 0) {
            return { userId: user.id, status: "no_active_plan" };
          }

          const [activeStep] = activeSteps;

          // TODO: Send actual notification
          // For now, just log the notification
          console.log(`Would send notification to user ${user.id}:`, {
            title: "Time to practice your plan",
            body: `${activeStep.knowledge_content?.title}: ${activeStep.plan_situation} → ${activeStep.plan_action}`,
            stepId: activeStep.id,
          });

          // Update last sent timestamp
          await supabase
            .from("users")
            .update({ reminder_last_sent: now.toISOString() } as Record<string, unknown>)
            .eq("id", user.id);

          return { userId: user.id, status: "sent" };
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error);
          return { userId: user.id, status: "error", error: String(error) };
        }
      })
    );

    const summary = {
      total: results.length,
      sent: results.filter((r) => r.status === "sent").length,
      no_active_plan: results.filter((r) => r.status === "no_active_plan").length,
      errors: results.filter((r) => r.status === "error").length,
    };

    return NextResponse.json({
      message: "Cron job completed",
      timestamp: now.toISOString(),
      summary,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
