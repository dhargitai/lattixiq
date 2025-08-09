import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCustomerSubscriptions } from "@/lib/stripe/utils";
import type { Database } from "@/lib/supabase/database.types";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Validate user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID from user_subscriptions table
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscriptionData?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found for user" }, { status: 404 });
    }

    // Check Stripe for active subscriptions
    const activeSubscriptions = await getCustomerSubscriptions(subscriptionData.stripe_customer_id);

    if (activeSubscriptions.length === 0) {
      return NextResponse.json({ error: "No active subscriptions found" }, { status: 404 });
    }

    // Create service role client for updating subscription data
    const serviceSupabase = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [subscription] = activeSubscriptions;
    const currentPeriodEnd = (subscription as { current_period_end?: number }).current_period_end;

    // Update user_subscriptions table with service role
    const { error: updateError } = await serviceSupabase
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: subscriptionData.stripe_customer_id,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update user_subscriptions:", updateError);
      return NextResponse.json({ error: "Failed to sync subscription data" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription synced successfully",
      subscription: {
        status: subscription.status,
        id: subscription.id,
      },
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return NextResponse.json({ error: "Failed to sync subscription" }, { status: 500 });
  }
}
