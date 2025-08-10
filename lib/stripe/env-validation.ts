export function validateStripeEnv(): void {
  // Skip validation during build time when Stripe isn't actually needed
  if (process.env.NODE_ENV === "production" && process.env.CI === "true") {
    console.log("Skipping Stripe env validation in CI build environment");
    return;
  }

  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_MONTHLY_PRODUCT_ID: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_ANNUAL_PRODUCT_ID: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRODUCT_ID,
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
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  monthlyProductId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRODUCT_ID || "",
  annualProductId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRODUCT_ID || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};
