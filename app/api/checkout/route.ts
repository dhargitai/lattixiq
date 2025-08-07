import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe/utils";
import { stripeConfig } from "@/lib/stripe/env-validation";
import { z } from "zod";

const checkoutSchema = z.object({
  priceId: z.enum([stripeConfig.monthlyProductId, stripeConfig.annualProductId]),
});

export async function POST(request: NextRequest) {
  try {
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

    // Get user email for checkout
    const { data: userData } = await supabase
      .from("users")
      .select("email, stripe_customer_id, subscription_status")
      .eq("id", user.id)
      .single();

    // Check if user already has an active subscription
    if (userData?.subscription_status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession(
      user.id,
      result.data.priceId,
      userData?.email || user.email
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
