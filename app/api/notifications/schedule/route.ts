import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

interface NotificationRequestBody {
  stepId: string;
}

interface UserWithReminders {
  id: string;
  reminder_enabled: boolean;
  reminder_time: string;
}

interface StepWithContent {
  id: string;
  plan_situation?: string;
  plan_action?: string;
  knowledge_content?: {
    title?: string;
    type?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: NotificationRequestBody = await request.json();
    const { stepId } = body;

    if (!stepId || typeof stepId !== "string") {
      return NextResponse.json({ error: "Invalid step ID" }, { status: 400 });
    }

    // Get user's reminder settings
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, reminder_enabled, reminder_time")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userWithReminders = userData as UserWithReminders;

    if (!userWithReminders.reminder_enabled) {
      return NextResponse.json(
        {
          message: "Reminders are not enabled for this user",
        },
        { status: 200 }
      );
    }

    // Get the step and plan details
    const { data: stepData, error: stepError } = await supabase
      .from("roadmap_steps")
      .select(
        `
        *,
        knowledge_content (
          title,
          type
        )
      `
      )
      .eq("id", stepId)
      .single();

    if (stepError || !stepData) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    const stepWithContent = stepData as StepWithContent;

    // Check if step has an active plan
    if (!stepWithContent.plan_situation || !stepWithContent.plan_action) {
      return NextResponse.json(
        {
          message: "No active plan for this step",
        },
        { status: 200 }
      );
    }

    // Calculate scheduled time based on user's preference
    const now = new Date();
    const [hours, minutes] = userWithReminders.reminder_time.split(":");
    const scheduledFor = new Date();
    scheduledFor.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledFor <= now) {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
    }

    // Create notification log entry
    const notificationLog = {
      user_id: user.id,
      roadmap_step_id: stepId,
      notification_type: "daily_reminder" as const,
      title: "Time to practice your plan",
      body: `${stepWithContent.knowledge_content?.title || "Your mental model"}: ${stepWithContent.plan_situation} → ${stepWithContent.plan_action}`,
      scheduled_for: scheduledFor.toISOString(),
      delivery_status: "scheduled" as const,
    };

    const { error: logError } = await supabase.from("notification_logs").insert(notificationLog);

    if (logError) {
      console.error("Error creating notification log:", logError);
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scheduledFor: scheduledFor.toISOString(),
    });
  } catch (error) {
    console.error("Error in notification scheduling:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
