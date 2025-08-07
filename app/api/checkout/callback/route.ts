import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCheckoutSession, updateUserSubscription } from "@/lib/stripe/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/toolkit?error=missing_session", request.url));
    }

    const supabase = await createClient();

    // Verify the checkout session with Stripe
    const sessionData = await verifyCheckoutSession(sessionId);

    if (!sessionData.userId) {
      console.error("No userId found in session");
      return NextResponse.redirect(new URL("/toolkit?error=invalid_session", request.url));
    }

    // Update user subscription status in database
    await updateUserSubscription(
      supabase,
      sessionData.userId,
      sessionData.customerId,
      sessionData.subscriptionId,
      sessionData.status,
      undefined // Period end will be updated via webhook
    );

    // Redirect to toolkit with success message
    return NextResponse.redirect(new URL("/toolkit?subscription=success", request.url));
  } catch (error) {
    console.error("Checkout callback error:", error);
    return NextResponse.redirect(new URL("/toolkit?error=checkout_failed", request.url));
  }
}
