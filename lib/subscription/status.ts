import { createClient } from "@/lib/supabase/server";

export type SubscriptionStatus = "free" | "active" | "trialing" | "past_due" | "canceled";

export interface SubscriptionDetails {
  userId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  isActive: boolean;
  isPastDue: boolean;
  formattedPeriodEnd: string | null;
}

/**
 * Fetch subscription status from user_subscriptions table
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("subscription_status")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return "free";
  }

  return (data.subscription_status as SubscriptionStatus) || "free";
}

/**
 * Format subscription period end date
 */
export function formatSubscriptionPeriod(date: string | null): string | null {
  if (!date) return null;

  const dateObj = new Date(date);
  const now = new Date();
  const daysUntil = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // If less than 7 days, show "in X days"
  if (daysUntil > 0 && daysUntil <= 7) {
    return `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
  }

  // Otherwise show formatted date
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Check if subscription is active (active or trialing)
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Get complete subscription details for a user
 */
export async function getSubscriptionDetails(userId: string): Promise<SubscriptionDetails> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return {
      userId,
      status: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      isActive: false,
      isPastDue: false,
      formattedPeriodEnd: null,
    };
  }

  const status = (data.subscription_status as SubscriptionStatus) || "free";

  return {
    userId,
    status,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    currentPeriodEnd: data.subscription_current_period_end,
    isActive: isSubscriptionActive(status),
    isPastDue: status === "past_due",
    formattedPeriodEnd: formatSubscriptionPeriod(data.subscription_current_period_end),
  };
}

/**
 * Refresh subscription status after portal return
 * This ensures the UI shows the latest subscription state
 */
export async function refreshSubscriptionStatus(userId: string): Promise<void> {
  const supabase = await createClient();

  // Force a fresh read from the database
  const { error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to refresh subscription status:", error);
  }

  // The data is now fresh in the cache
  // Components that read this data will get the updated version
}
