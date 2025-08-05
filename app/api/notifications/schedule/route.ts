import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// TODO: Fix TypeScript recognition of notification_logs table
// The table exists in the database but TypeScript isn't picking it up
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: "Notification scheduling is temporarily disabled",
    },
    { status: 503 }
  );
}

// Original implementation commented out due to TypeScript issues
/*
export async function POST_DISABLED(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { stepId } = body;

  if (!stepId || typeof stepId !== "string") {
    return NextResponse.json({ error: "Invalid step ID" }, { status: 400 });
  }

  // Get user's reminder settings
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Cast to get reminder fields
  const userWithReminders = userData as any;

  if (!userWithReminders.reminder_enabled) {
    return NextResponse.json({ 
      message: "Reminders are not enabled for this user" 
    }, { status: 200 });
  }

  // Get the step and plan details
  const { data: stepData, error: stepError } = await supabase
    .from("roadmap_steps")
    .select(`
      *,
      knowledge_content (
        title,
        type
      )
    `)
    .eq("id", stepId)
    .single();

  if (stepError || !stepData) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  // Check if step has an active plan
  if (!stepData.plan_situation || !stepData.plan_action) {
    return NextResponse.json({ 
      message: "No active plan for this step" 
    }, { status: 200 });
  }

  // Calculate scheduled time based on user's preference
  const now = new Date();
  const [hours, minutes] = userWithReminders.reminder_time.split(':');
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
    notification_type: "daily_reminder",
    title: "Time to practice your plan",
    body: `${stepData.knowledge_content?.title}: ${stepData.plan_situation} → ${stepData.plan_action}`,
    scheduled_for: scheduledFor.toISOString(),
    delivery_status: "scheduled"
  };

  const { error: logError } = await supabase
    .from("notification_logs")
    .insert(notificationLog as any);

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true,
    scheduledFor: scheduledFor.toISOString()
  });
}
*/
