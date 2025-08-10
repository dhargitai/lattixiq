/**
 * Plan reminder email template component
 * Based on existing OTP email styling from Supabase Auth
 * Following functional programming patterns - pure functions with immutable data
 */

import type { PlanReminderTemplateProps } from "./types";
import { getMotivationalMessage } from "./motivational-messages";

/**
 * Generate HTML email template for plan reminders
 * Pure function - no side effects, returns HTML string
 * All styles are inline for maximum email client compatibility
 * NO EXTERNAL LINKS per requirement
 */
export function renderPlanReminderTemplate(props: PlanReminderTemplateProps): string {
  const { planTrigger, planAction, contentType = "mental-model", contentTitle, userName } = props;

  // Get appropriate motivational message based on content type
  const motivationalMessage = getMotivationalMessage(contentType, contentTitle);

  // Sanitize user-generated content to prevent XSS
  const safePlanTrigger = sanitizeHtmlContent(planTrigger);
  const safePlanAction = sanitizeHtmlContent(planAction);
  const greeting = userName ? `Hi ${sanitizeHtmlContent(userName)},` : "Hi there,";

  // Generate HTML with inline styles matching OTP email template
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time to Practice Your Plan</title>
    <style>
        /* Email client reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
    <!-- Main container table for Outlook compatibility -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Content container with max-width for desktop -->
                <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Header section with LattixIQ branding -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <!-- Brain emoji logo -->
                                        <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                                        <!-- LattixIQ brand name -->
                                        <h1 style="color: #1a202c; font-size: 24px; font-weight: 600; margin: 0;">LattixIQ</h1>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Greeting -->
                            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                ${greeting}
                            </p>
                            
                            <!-- Main message -->
                            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                It's time to practice your plan:
                            </p>
                            
                            <!-- Plan container with IF/THEN statements -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                                        <div style="color: #2d3748; font-size: 16px; line-height: 1.8;">
                                            <strong style="color: #6d3a9c;">IF:</strong> ${safePlanTrigger}<br />
                                            <strong style="color: #6d3a9c; margin-top: 10px; display: inline-block;">THEN:</strong> ${safePlanAction}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Motivational message -->
                            <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px; font-style: italic;">
                                ${motivationalMessage}
                            </p>
                            
                            <!-- Footer with tagline -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #718096; font-size: 14px; margin: 0;">
                                            Your roadmap to a clearer mind.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Hidden comment about no external links requirement -->
                            <!-- IMPORTANT: This email template contains NO external links per security requirements -->
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Helper function to escape HTML entities and remove control characters
 * Pure function - no side effects
 */
function sanitizeHtmlContent(content: string): string {
  if (!content) return "";

  // Remove control characters (except newline, tab, carriage return)
  const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return cleanContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");
}
