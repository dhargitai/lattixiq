import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyCheckoutSession } from "@/lib/stripe/utils";

// Force Node.js runtime to avoid Edge Runtime limitations with Stripe/Supabase
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/toolkit?error=missing_session", request.url));
    }

    // Verify the checkout session with Stripe
    const sessionData = await verifyCheckoutSession(sessionId);

    if (!sessionData.userId) {
      console.error("No userId found in session");
      return NextResponse.redirect(new URL("/toolkit?error=invalid_session", request.url));
    }

    // The webhook will handle updating the database with the subscription details
    // We just verify the session is valid and redirect with success
    console.log(`Checkout session verified for user ${sessionData.userId}, redirecting to success`);

    // Redirect to toolkit with success message
    return NextResponse.redirect(new URL("/toolkit?subscription=success", request.url));
  } catch (error) {
    console.error("Checkout callback error:", error);
    return NextResponse.redirect(new URL("/toolkit?error=checkout_failed", request.url));
  }
}
