/**
 * Type definitions for email templates
 * Following functional programming patterns - all types are immutable
 */

import type { Database } from "@/lib/supabase/database.types";

export interface PlanReminderTemplateProps {
  readonly planTrigger: string;
  readonly planAction: string;
  readonly contentType: Database["public"]["Enums"]["knowledge_content_type"];
  readonly contentTitle?: string;
  readonly userName?: string;
}
