import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { constructWebhookEvent, handleWebhookEvent } from "@/lib/stripe/utils";
import { stripeConfig } from "@/lib/stripe/env-validation";
import type { Database } from "@/lib/supabase/database.types";

// Create Supabase client with service role for webhook processing
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("No stripe-signature header found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    // Verify webhook signature
    const event = constructWebhookEvent(body, signature, stripeConfig.webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event
    const supabase = createServiceClient();
    await handleWebhookEvent(event, supabase);

    // Return success response quickly to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Webhook error: ${error.message}`);
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    console.error("Unknown webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
