/**
 * Rendering utility for plan reminder email template
 * Following functional programming patterns - pure functions with error handling
 */

import type { Database } from "@/lib/supabase/database.types";
import { renderPlanReminderTemplate } from "./plan-reminder";
import type { PlanReminderTemplateProps } from "./types";

type ContentType = Database["public"]["Enums"]["knowledge_content_type"];

/**
 * Parameters for rendering a plan reminder email
 */
export interface RenderPlanReminderParams {
  readonly planTrigger: string | null;
  readonly planAction: string | null;
  readonly contentType?: ContentType | null;
  readonly contentTitle?: string | null;
  readonly userName?: string | null;
}

/**
 * Result of rendering attempt
 */
export interface RenderResult {
  readonly success: boolean;
  readonly html?: string;
  readonly error?: string;
}

/**
 * Render plan reminder email HTML with validation and error handling
 * Pure function - no side effects
 */
export function renderPlanReminder(params: RenderPlanReminderParams): RenderResult {
  try {
    // Validate required fields
    if (!params.planTrigger || !params.planAction) {
      return {
        success: false,
        error: "Missing required plan content (trigger or action)",
      };
    }

    // Validate plan content is not empty
    const trimmedTrigger = params.planTrigger.trim();
    const trimmedAction = params.planAction.trim();

    if (!trimmedTrigger || !trimmedAction) {
      return {
        success: false,
        error: "Plan content cannot be empty",
      };
    }

    // Prepare template props with defaults
    const templateProps: PlanReminderTemplateProps = {
      planTrigger: trimmedTrigger,
      planAction: trimmedAction,
      contentType: params.contentType || "mental-model",
      contentTitle: params.contentTitle || undefined,
      userName: params.userName || undefined,
    };

    // Render the template
    const html = renderPlanReminderTemplate(templateProps);

    // Validate output
    if (!html || html.length < 100) {
      return {
        success: false,
        error: "Failed to generate valid HTML content",
      };
    }

    return {
      success: true,
      html,
    };
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error("Error rendering plan reminder email:", error);

    return {
      success: false,
      error: "Failed to render email template",
    };
  }
}

/**
 * Helper function to preview email template (for development/testing)
 * Pure function - returns HTML string
 */
export function generatePreviewHtml(
  planTrigger: string = "I notice myself procrastinating on an important task",
  planAction: string = "I will use the 2-minute rule and start with the smallest possible action",
  contentType: ContentType = "mental-model",
  contentTitle: string = "The 2-Minute Rule"
): string {
  const result = renderPlanReminder({
    planTrigger,
    planAction,
    contentType,
    contentTitle,
    userName: "Test User",
  });

  if (result.success && result.html) {
    return result.html;
  }

  return `<html><body><h1>Error: ${result.error || "Unknown error"}</h1></body></html>`;
}
