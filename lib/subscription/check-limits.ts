import { createClient } from "@/lib/supabase/server";

export async function checkCanCreateRoadmap(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // 1. Check user_subscriptions table for active subscription
  // Using type assertion until types are regenerated
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("subscription_status, subscription_current_period_end")
    .eq("user_id", userId)
    .single();

  if (
    subscription?.subscription_status === "active" ||
    subscription?.subscription_status === "trialing"
  ) {
    // Check if subscription is not expired
    if (subscription.subscription_current_period_end) {
      const periodEnd = new Date(subscription.subscription_current_period_end);
      if (periodEnd > new Date()) {
        return true;
      }
    } else {
      return true; // No expiry set means active
    }
  }

  // 2. Check users table for free/testimonial limits
  const { data: user } = await supabase
    .from("users")
    .select("roadmap_count, free_roadmaps_used, testimonial_bonus_used, testimonial_url")
    .eq("id", userId)
    .single();

  if (!user) {
    return false;
  }

  // Allow first free roadmap
  if (!user.free_roadmaps_used) {
    return true;
  }

  // Allow second roadmap if testimonial exists and bonus not used
  if (user.testimonial_url && !user.testimonial_bonus_used) {
    return true;
  }

  return false;
}

export async function hasCompletedFreeRoadmap(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if user has any completed roadmaps
  const { data, error } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);

  if (error) {
    console.error("Error checking completed roadmaps:", error);
    return false;
  }

  return data && data.length > 0;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check user_subscriptions table first
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("subscription_status, subscription_current_period_end")
    .eq("user_id", userId)
    .single();

  if (subscription) {
    // Check if subscription is active and not expired
    if (
      subscription.subscription_status === "active" ||
      subscription.subscription_status === "trialing"
    ) {
      // If there's a period end date, check if it's in the future
      if (subscription.subscription_current_period_end) {
        const periodEnd = new Date(subscription.subscription_current_period_end);
        return periodEnd > new Date();
      }
      return true;
    }
    return false;
  }

  // Fallback to users table for backward compatibility
  const { data, error } = await supabase
    .from("users")
    .select("subscription_status, subscription_current_period_end")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }

  if (!data) {
    return false;
  }

  // Check if subscription is active and not expired
  if (data.subscription_status === "active" || data.subscription_status === "trialing") {
    // If there's a period end date, check if it's in the future
    if (data.subscription_current_period_end) {
      const periodEnd = new Date(data.subscription_current_period_end);
      return periodEnd > new Date();
    }
    return true;
  }

  return false;
}

export async function getTestimonialBonus(userId: string): Promise<boolean> {
  // Placeholder for future implementation
  // Will check if user has provided testimonial and not used bonus yet
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("testimonial_bonus_used")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  // For now, return false as testimonial bonus is not yet implemented
  return false;
}

export async function getUserSubscriptionStatus(userId: string): Promise<{
  isSubscribed: boolean;
  status: string;
  canCreateRoadmap: boolean;
  completedFreeRoadmap: boolean;
  hasTestimonialBonus: boolean;
}> {
  const [isSubscribed, completedFree, canCreate, testimonialBonus] = await Promise.all([
    hasActiveSubscription(userId),
    hasCompletedFreeRoadmap(userId),
    checkCanCreateRoadmap(userId),
    getTestimonialBonus(userId),
  ]);

  const supabase = await createClient();

  // Check user_subscriptions table first
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("subscription_status")
    .eq("user_id", userId)
    .single();

  let status = "free";

  if (subscription) {
    status = subscription.subscription_status || "free";
  } else {
    // Fallback to users table
    const { data } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", userId)
      .single();
    status = data?.subscription_status || "free";
  }

  return {
    isSubscribed,
    status,
    canCreateRoadmap: canCreate,
    completedFreeRoadmap: completedFree,
    hasTestimonialBonus: testimonialBonus,
  };
}
