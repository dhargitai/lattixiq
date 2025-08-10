/**
 * Test endpoint for email functionality (development only)
 * This endpoint should only be available in development environment
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendEmailWithRetry, isValidEmail } from "@/lib/email/send-email";
import { createClient } from "@/lib/supabase/server";
import type { EmailOptions, EmailLogEntry } from "@/lib/email/types";

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { to, subject, html, text, testType = "basic" } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json({ error: "Recipient email address is required" }, { status: 400 });
    }

    if (!isValidEmail(to)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Prepare email options based on test type
    let emailOptions: EmailOptions;

    switch (testType) {
      case "reminder":
        emailOptions = {
          to,
          subject: subject || "🎯 Time to practice your mental model",
          html: html || generateReminderEmailHtml(),
          tags: [
            { name: "type", value: "reminder" },
            { name: "environment", value: "development" },
          ],
        };
        break;

      case "welcome":
        emailOptions = {
          to,
          subject: subject || "Welcome to LattixIQ! 🚀",
          html: html || generateWelcomeEmailHtml(),
          tags: [
            { name: "type", value: "welcome" },
            { name: "environment", value: "development" },
          ],
        };
        break;

      case "plain":
        emailOptions = {
          to,
          subject: subject || "Test Email from LattixIQ",
          text: text || "This is a plain text test email from LattixIQ.",
          tags: [
            { name: "type", value: "plain" },
            { name: "environment", value: "development" },
          ],
        };
        break;

      default:
        emailOptions = {
          to,
          subject: subject || "Test Email from LattixIQ",
          html: html || text || generateBasicTestEmailHtml(),
          tags: [
            { name: "type", value: "test" },
            { name: "environment", value: "development" },
          ],
        };
    }

    // Send the email
    const result = await sendEmailWithRetry(emailOptions);

    // Log to notification_logs table for monitoring
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const logEntry: EmailLogEntry = {
        userId: user.id,
        notificationType: "test",
        title: emailOptions.subject,
        body: emailOptions.html || emailOptions.text || "",
        deliveryStatus: result.success ? "sent" : "failed",
        errorMessage: result.error,
        deliveredAt: result.timestamp,
        metadata: {
          messageId: result.messageId,
          testType,
          to,
        },
      };

      // Insert log entry (ignoring errors as this is non-critical)
      const { error: logError } = await supabase.from("notification_logs").insert({
        user_id: logEntry.userId,
        notification_type: logEntry.notificationType,
        title: logEntry.title,
        body: logEntry.body.substring(0, 1000), // Truncate body to prevent overflow
        delivery_status: logEntry.deliveryStatus,
        error_message: logEntry.errorMessage,
        delivered_at: logEntry.deliveredAt,
      });

      if (logError) {
        console.error("Failed to log email delivery:", logError);
      }
    }

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId,
        timestamp: result.timestamp,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test email",
          timestamp: result.timestamp,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Email template generators
function generateBasicTestEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Email</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Test Email from LattixIQ</h1>
          </div>
          <div class="content">
            <p>This is a test email to verify that the email service is working correctly.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Environment: Development</p>
          </div>
          <div class="footer">
            <p>This is a development test email</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateReminderEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Practice Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .plan-box { background: #f9fafb; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Time to Practice!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>It's time to practice your mental model. Here's your plan for today:</p>
            <div class="plan-box">
              <strong>Confirmation Bias</strong><br>
              <p style="margin-top: 10px;">
                <strong>IF</strong> I'm researching a topic<br>
                <strong>THEN</strong> I'll actively seek opposing viewpoints
              </p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/toolkit" class="button">Open LattixIQ</a>
            <p style="margin-top: 30px; color: #6b7280;">
              Remember: Small, consistent actions lead to lasting change.
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because you enabled reminders in LattixIQ</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #6366f1;">Manage preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateWelcomeEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to LattixIQ</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .feature { margin: 20px 0; padding-left: 30px; position: relative; }
          .feature:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LattixIQ! 🚀</h1>
            <p style="margin-top: 10px; opacity: 0.9;">Your journey to applied wisdom starts here</p>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>Welcome to LattixIQ - your personal rationality toolkit designed to bridge the knowing-doing gap.</p>
            <h3>What you can do with LattixIQ:</h3>
            <div class="feature">Create personalized learning roadmaps</div>
            <div class="feature">Learn powerful mental models</div>
            <div class="feature">Plan real-world applications</div>
            <div class="feature">Track your progress with reflections</div>
            <div class="feature">Build your toolkit of applied wisdom</div>
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/new-roadmap" class="button">Create Your First Roadmap</a>
            </center>
            <p style="margin-top: 30px;">
              Ready to transform knowledge into action? Let's get started!
            </p>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email and we'll help you out.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// GET endpoint to show available test types
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Email test endpoint is ready",
    availableTestTypes: ["basic", "reminder", "welcome", "plain"],
    usage: {
      method: "POST",
      body: {
        to: "recipient@example.com",
        testType: "basic | reminder | welcome | plain",
        subject: "(optional) Custom subject",
        html: "(optional) Custom HTML content",
        text: "(optional) Custom plain text content",
      },
    },
  });
}
