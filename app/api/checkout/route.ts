import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, getCustomerSubscriptions } from "@/lib/stripe/utils";
import { stripeConfig, validateStripeEnv } from "@/lib/stripe/env-validation";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe environment variables are present
    validateStripeEnv();

    // Define schema inside the function to ensure env vars are loaded
    const checkoutSchema = z.object({
      priceId: z
        .string()
        .refine(
          (val) => val === stripeConfig.monthlyProductId || val === stripeConfig.annualProductId,
          { message: "Invalid price ID" }
        ),
    });

    const supabase = await createClient();

    // Validate user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Get user email from users table
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    // Get subscription data from user_subscriptions table
    const { data: subscriptionData } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id, subscription_status, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    // Check if user already has an active subscription in database
    if (subscriptionData?.subscription_status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // If user has a Stripe customer ID, check their actual Stripe subscription status
    if (subscriptionData?.stripe_customer_id) {
      try {
        const activeSubscriptions = await getCustomerSubscriptions(
          subscriptionData.stripe_customer_id
        );

        if (activeSubscriptions.length > 0) {
          // User has an active Stripe subscription but database is out of sync
          // Return a special response that tells the frontend to sync
          return NextResponse.json(
            {
              error:
                "You have an active subscription but it needs to be synced. Please wait while we update your account.",
              requiresSync: true,
              customerId: subscriptionData.stripe_customer_id,
            },
            { status: 409 } // Conflict status code
          );
        }
      } catch (stripeError) {
        // If we can't check Stripe, continue with checkout
        console.error("Error checking Stripe subscriptions:", stripeError);
      }
    }

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession(
      user.id,
      result.data.priceId,
      userData?.email || user.email,
      subscriptionData?.stripe_customer_id || undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
