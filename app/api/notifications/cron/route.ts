import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldSendReminder } from "@/lib/notifications/timezone-utils";
import { sendEmailWithRetry } from "@/lib/email/send-email";
import { logEmailDelivery } from "@/lib/email/email-logger";
import type { EmailOptions } from "@/lib/email/types";

// Generate HTML email template for reminders
function generateReminderEmailHtml(
  modelTitle: string,
  planTrigger: string,
  planAction: string,
  stepId: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Practice Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .plan-box { background: #f9fafb; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .if-then { margin: 10px 0; line-height: 1.6; }
          .label { font-weight: 600; color: #4b5563; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .footer a { color: #6366f1; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎯 Time to Practice!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your daily reminder to apply your mental model</p>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>It's time to practice <strong>${modelTitle}</strong>. Here's your plan for today:</p>
            <div class="plan-box">
              <div class="if-then">
                <span class="label">IF</span> ${planTrigger}
              </div>
              <div class="if-then">
                <span class="label">THEN</span> ${planAction}
              </div>
            </div>
            <p>Take a moment today to look for opportunities to apply this plan. Remember, small consistent actions lead to lasting change.</p>
            <center>
              <a href="${appUrl}/reflect/${stepId}" class="button">Record Your Reflection</a>
            </center>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              💡 <em>Tip: The more specific your trigger, the easier it is to remember and apply your plan.</em>
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because you enabled daily reminders in LattixIQ</p>
            <p><a href="${appUrl}/settings">Manage your notification preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

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
            .not("plan_trigger", "is", null)
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

          // Prepare email content
          const emailSubject = "🎯 Time to practice your mental model";
          const emailBody = generateReminderEmailHtml(
            activeStep.knowledge_content?.title || "Your mental model",
            activeStep.plan_trigger || "",
            activeStep.plan_action || "",
            activeStep.id
          );

          // Send email notification
          const emailOptions: EmailOptions = {
            to: user.email || "",
            subject: emailSubject,
            html: emailBody,
            tags: [
              { name: "type", value: "daily_reminder" },
              { name: "user_id", value: user.id },
              { name: "step_id", value: activeStep.id },
            ],
          };

          const emailResult = await sendEmailWithRetry(emailOptions);

          // Log email delivery
          await logEmailDelivery(user.id, emailSubject, emailBody, emailResult, {
            stepId: activeStep.id,
            stepTitle: activeStep.knowledge_content?.title,
          });

          // Update last sent timestamp if email was successful
          if (emailResult.success) {
            await supabase
              .from("users")
              .update({ reminder_last_sent: now.toISOString() } as Record<string, unknown>)
              .eq("id", user.id);
          }

          return {
            userId: user.id,
            status: emailResult.success ? "sent" : "failed",
            error: emailResult.error,
          };
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
