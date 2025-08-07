import Stripe from "stripe";
import { validateStripeEnv, stripeConfig } from "./env-validation";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    validateStripeEnv();
    stripeClient = new Stripe(stripeConfig.secretKey, {
      apiVersion: "2025-07-30.basil",
      typescript: true,
    });
  }
  return stripeClient;
}
