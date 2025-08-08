import { getStripeClient } from "./client";
import type { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type Stripe from "stripe";

const stripe = getStripeClient();

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail?: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/toolkit?canceled=true`,
    customer_email: customerEmail,
    client_reference_id: userId,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

export async function verifyCheckoutSession(sessionId: string): Promise<{
  customerId: string;
  subscriptionId: string;
  userId: string;
  status: string;
}> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });

  if (!session.customer || typeof session.customer === "string") {
    throw new Error("Customer not found in session");
  }

  if (!session.subscription || typeof session.subscription === "string") {
    throw new Error("Subscription not found in session");
  }

  const subscription = session.subscription as Stripe.Subscription;

  return {
    customerId: session.customer.id,
    subscriptionId: subscription.id,
    userId: session.client_reference_id || session.metadata?.userId || "",
    status: subscription.status,
  };
}

export async function updateUserSubscription(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  subscriptionStatus: string,
  currentPeriodEnd?: Date
): Promise<void> {
  // Try to update user_subscriptions table first (service role only)
  // Using type assertion until types are regenerated after migration
  const { error: subscriptionError } = await (supabase as any)
    .from("user_subscriptions")
    .upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: subscriptionStatus,
      subscription_current_period_end: currentPeriodEnd?.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (subscriptionError) {
    // If user_subscriptions doesn't exist yet, fall back to users table
    if (
      subscriptionError.code === "42P01" ||
      subscriptionError.message?.includes("user_subscriptions")
    ) {
      console.log("user_subscriptions table not available, updating users table");
      // Fallback to users table for backward compatibility
      const { error: userError } = await supabase
        .from("users")
        .update({
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          subscription_status: subscriptionStatus,
          subscription_current_period_end: currentPeriodEnd?.toISOString(),
        })
        .eq("id", userId);

      if (userError) {
        throw new Error(`Failed to update user subscription: ${userError.message}`);
      }
    } else {
      throw new Error(`Failed to update user subscription: ${subscriptionError.message}`);
    }
  }
}

export async function handleWebhookEvent(
  event: Stripe.Event,
  supabase: ReturnType<typeof createClient<Database>>
): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      // Type assertion needed as Stripe types don't include all webhook properties
      const subscription = event.data.object as Stripe.Subscription & {
        current_period_end?: number;
      };
      const userId = subscription.metadata?.userId;

      if (!userId) {
        console.warn("No userId found in subscription metadata");
        return;
      }

      await updateUserSubscription(
        supabase,
        userId,
        subscription.customer as string,
        subscription.id,
        subscription.status,
        subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (!userId) {
        console.warn("No userId found in subscription metadata");
        return;
      }

      await updateUserSubscription(
        supabase,
        userId,
        subscription.customer as string,
        "",
        "free",
        undefined
      );
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
