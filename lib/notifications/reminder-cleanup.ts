import { createClient } from "@/lib/supabase/client";

/**
 * Logs reminder cleanup when a plan is completed.
 * This doesn't actually stop reminders (they check for active plans),
 * but logs the event for tracking purposes.
 */
export async function logReminderCleanup(stepId: string, userId: string) {
  try {
    const supabase = createClient();

    // Check if the step had a plan (check for plan_situation/plan_action fields)
    const { data: step } = await supabase
      .from("roadmap_steps")
      .select("plan_situation, plan_trigger, plan_action, roadmap_id")
      .eq("id", stepId)
      .single();

    if (!step?.plan_situation && !step?.plan_action) {
      // No plan to clean up
      return;
    }

    // Log the cleanup event
    const { error } = await supabase.from("notification_logs").insert({
      user_id: userId,
      roadmap_step_id: stepId,
      notification_type: "plan_completed",
      title: "Plan completed",
      body: "Reminders for this plan will no longer be sent",
      delivered_at: new Date().toISOString(),
      delivery_status: "plan_completed",
    });

    if (error) {
      console.error("[ReminderCleanup] Failed to log cleanup:", error);
    } else {
      console.log("[ReminderCleanup] Logged reminder cleanup for completed plan");
    }

    // Check if there are any other active plans for this user
    // Status "unlocked" means in progress, "completed" means done
    const { data: activePlans } = await supabase
      .from("roadmap_steps")
      .select("id, plan_situation, plan_action")
      .eq("status", "unlocked")
      .or("plan_situation.not.is.null,plan_action.not.is.null");

    // Filter to only steps that actually have plans
    const plansWithContent =
      activePlans?.filter((plan) => plan.plan_situation || plan.plan_action) || [];

    if (plansWithContent.length === 0) {
      // Log that user has no active plans
      await supabase.from("notification_logs").insert({
        user_id: userId,
        notification_type: "no_active_plans",
        title: "No active plans",
        body: "All plans completed - reminders paused until new plan created",
        delivered_at: new Date().toISOString(),
        delivery_status: "no_active_plan",
      });
    }
  } catch (error) {
    console.error("[ReminderCleanup] Error during cleanup:", error);
    // Don't throw - this is a non-critical operation
  }
}
