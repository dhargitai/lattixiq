export function validateStripeEnv(): void {
  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_MONTHLY_PRODUCT_ID: process.env.STRIPE_MONTHLY_PRODUCT_ID,
    STRIPE_ANNUAL_PRODUCT_ID: process.env.STRIPE_ANNUAL_PRODUCT_ID,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missingVars.join(", ")}`);
  }
}

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  monthlyProductId: process.env.STRIPE_MONTHLY_PRODUCT_ID!,
  annualProductId: process.env.STRIPE_ANNUAL_PRODUCT_ID!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};
