import { createClient } from "@/lib/supabase/server";

export async function checkCanCreateRoadmap(userId: string): Promise<boolean> {
  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription(userId);
  if (hasSubscription) {
    return true;
  }

  // Check if user has completed their free roadmap
  const hasCompleted = await hasCompletedFreeRoadmap(userId);

  // User can create a roadmap if they haven't completed their free one yet
  return !hasCompleted;
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

  // Check user's subscription status
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

export async function getUserSubscriptionStatus(userId: string): Promise<{
  isSubscribed: boolean;
  status: string;
  canCreateRoadmap: boolean;
  completedFreeRoadmap: boolean;
}> {
  const [isSubscribed, completedFree, canCreate] = await Promise.all([
    hasActiveSubscription(userId),
    hasCompletedFreeRoadmap(userId),
    checkCanCreateRoadmap(userId),
  ]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  return {
    isSubscribed,
    status: data?.subscription_status || "free",
    canCreateRoadmap: canCreate,
    completedFreeRoadmap: completedFree,
  };
}
