/**
 * Resend client initialization module
 * Following functional programming patterns - no side effects, pure functions
 */

import { Resend } from "resend";
import type { EmailServiceConfig } from "./types";

let resendClient: Resend | null = null;

/**
 * Get or create a Resend client instance
 * Pure function that ensures single instance (singleton pattern)
 */
export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY environment variable is required but not configured. " +
          "Please add it to your .env.local file."
      );
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

/**
 * Validate email service configuration
 * Pure function - no side effects
 */
export function validateEmailConfig(config?: Partial<EmailServiceConfig>): EmailServiceConfig {
  const apiKey = config?.apiKey ?? process.env.RESEND_API_KEY;
  const fromEmail = config?.fromEmail ?? process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("Email service API key is required but not provided");
  }

  if (!fromEmail) {
    throw new Error("From email address is required but not provided");
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fromEmail)) {
    throw new Error(`Invalid from email address format: ${fromEmail}`);
  }

  return {
    provider: "resend",
    apiKey,
    fromEmail,
    retryConfig: config?.retryConfig,
    isDevelopment: config?.isDevelopment ?? process.env.NODE_ENV === "development",
  };
}

/**
 * Reset the client instance (useful for testing)
 * This is the only function with a side effect, used only for testing
 */
export function resetResendClient(): void {
  resendClient = null;
}
