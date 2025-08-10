import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Force this API route to run in Node.js runtime (not Edge Runtime)
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve stripe_customer_id from user_subscriptions table
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscription) {
      console.error("Error fetching subscription:", subscriptionError);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please upgrade to Premium first." },
        { status: 400 }
      );
    }

    // Create Stripe billing portal session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/settings`;

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: returnUrl,
      });

      // Return portal URL for redirect
      return NextResponse.json({ url: session.url });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      return NextResponse.json(
        { error: "Failed to create billing portal session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
