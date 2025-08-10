/**
 * Email logging and monitoring utilities
 * Following functional programming patterns - pure functions with no side effects
 */

import type { EmailLogEntry, EmailResult } from "./types";
import { createClient } from "@/lib/supabase/server";

/**
 * Log email delivery to the notification_logs table
 * Returns true if logging was successful, false otherwise
 */
export async function logEmailDelivery(
  userId: string | null,
  emailSubject: string,
  emailBody: string,
  result: EmailResult,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const logEntry = {
      user_id: userId,
      notification_type: "email",
      title: emailSubject,
      body: emailBody.substring(0, 1000), // Truncate to prevent overflow
      delivery_status: result.success ? "sent" : "failed",
      error_message: result.error,
      delivered_at: result.timestamp,
      scheduled_for: new Date().toISOString(), // For immediate sends
    };

    const { error } = await supabase.from("notification_logs").insert(logEntry);

    if (error) {
      console.error("Failed to log email delivery:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in logEmailDelivery:", error);
    return false;
  }
}

/**
 * Get email delivery statistics for a user
 * Pure function that returns statistics
 */
export async function getUserEmailStats(
  userId: string,
  days: number = 30
): Promise<{
  totalSent: number;
  totalFailed: number;
  successRate: number;
  lastSentAt: string | null;
}> {
  try {
    const supabase = await createClient();
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabase
      .from("notification_logs")
      .select("delivery_status, delivered_at")
      .eq("user_id", userId)
      .eq("notification_type", "email")
      .gte("created_at", sinceDate.toISOString());

    if (error || !data) {
      console.error("Failed to fetch email stats:", error);
      return {
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        lastSentAt: null,
      };
    }

    const totalSent = data.filter((log) => log.delivery_status === "sent").length;
    const totalFailed = data.filter((log) => log.delivery_status === "failed").length;
    const total = totalSent + totalFailed;
    const successRate = total > 0 ? (totalSent / total) * 100 : 0;

    // Find the most recent successful send
    const lastSent = data
      .filter((log) => log.delivery_status === "sent" && log.delivered_at)
      .sort((a, b) => new Date(b.delivered_at!).getTime() - new Date(a.delivered_at!).getTime())[0];

    return {
      totalSent,
      totalFailed,
      successRate: Math.round(successRate * 100) / 100,
      lastSentAt: lastSent?.delivered_at || null,
    };
  } catch (error) {
    console.error("Error in getUserEmailStats:", error);
    return {
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      lastSentAt: null,
    };
  }
}

/**
 * Get system-wide email delivery metrics
 * For admin monitoring purposes
 */
export async function getSystemEmailMetrics(hours: number = 24): Promise<{
  totalEmails: number;
  successCount: number;
  failureCount: number;
  averageDeliveryTime: number;
  failureReasons: Record<string, number>;
}> {
  try {
    const supabase = await createClient();
    const sinceDate = new Date();
    sinceDate.setHours(sinceDate.getHours() - hours);

    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("notification_type", "email")
      .gte("created_at", sinceDate.toISOString());

    if (error || !data) {
      console.error("Failed to fetch system metrics:", error);
      return {
        totalEmails: 0,
        successCount: 0,
        failureCount: 0,
        averageDeliveryTime: 0,
        failureReasons: {},
      };
    }

    const successCount = data.filter((log) => log.delivery_status === "sent").length;
    const failureCount = data.filter((log) => log.delivery_status === "failed").length;

    // Calculate average delivery time (difference between scheduled and delivered)
    const deliveryTimes = data
      .filter((log) => log.delivery_status === "sent" && log.scheduled_for && log.delivered_at)
      .map((log) => {
        const scheduled = new Date(log.scheduled_for!).getTime();
        const delivered = new Date(log.delivered_at!).getTime();
        return delivered - scheduled;
      });

    const averageDeliveryTime =
      deliveryTimes.length > 0
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        : 0;

    // Group failure reasons
    const failureReasons: Record<string, number> = {};
    data
      .filter((log) => log.delivery_status === "failed" && log.error_message)
      .forEach((log) => {
        const reason = log.error_message || "Unknown";
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      });

    return {
      totalEmails: data.length,
      successCount,
      failureCount,
      averageDeliveryTime: Math.round(averageDeliveryTime / 1000), // Convert to seconds
      failureReasons,
    };
  } catch (error) {
    console.error("Error in getSystemEmailMetrics:", error);
    return {
      totalEmails: 0,
      successCount: 0,
      failureCount: 0,
      averageDeliveryTime: 0,
      failureReasons: {},
    };
  }
}

/**
 * Clean up old email logs (data retention policy)
 * Removes logs older than specified days
 */
export async function cleanupOldEmailLogs(
  retentionDays: number = 90
): Promise<{ deleted: number; error?: string }> {
  try {
    const supabase = await createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data, error } = await supabase
      .from("notification_logs")
      .delete()
      .eq("notification_type", "email")
      .lt("created_at", cutoffDate.toISOString())
      .select();

    if (error) {
      console.error("Failed to cleanup old logs:", error);
      return { deleted: 0, error: error.message };
    }

    return { deleted: data?.length || 0 };
  } catch (error) {
    console.error("Error in cleanupOldEmailLogs:", error);
    return { deleted: 0, error: String(error) };
  }
}
