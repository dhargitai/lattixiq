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

  // Check user_subscriptions table
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("subscription_status, subscription_current_period_end")
    .eq("user_id", userId)
    .single();

  if (error) {
    // If no subscription record exists, user has no subscription
    if (error.code === "PGRST116") {
      return false;
    }
    console.error("Error checking subscription status:", error);
    return false;
  }

  if (!subscription) {
    return false;
  }

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

export async function getTestimonialBonus(userId: string): Promise<boolean> {
  // Check if user has provided testimonial and not used bonus yet
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("testimonial_url, testimonial_bonus_used")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  // User has testimonial bonus if they have a testimonial URL and haven't used the bonus
  return !!(data.testimonial_url && !data.testimonial_bonus_used);
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

  // Check user_subscriptions table
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("subscription_status")
    .eq("user_id", userId)
    .single();

  const status = subscription?.subscription_status || "free";

  return {
    isSubscribed,
    status,
    canCreateRoadmap: canCreate,
    completedFreeRoadmap: completedFree,
    hasTestimonialBonus: testimonialBonus,
  };
}
