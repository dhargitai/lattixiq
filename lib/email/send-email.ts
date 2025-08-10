/**
 * Main email sending module with retry logic and error handling
 * Following functional programming patterns - pure functions with no side effects
 */

import type { EmailOptions, EmailResult, EmailRetryConfig } from "./types";
import { DEFAULT_RETRY_CONFIG } from "./types";
import { getResendClient, validateEmailConfig } from "./resend-client";

/**
 * Sleep function for retry delays
 * Pure function that returns a promise
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * Pure function - no side effects
 */
function calculateBackoffDelay(attempt: number, config: EmailRetryConfig): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Check if an error is retryable
 * Pure function - no side effects
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Check statusCode property
  if (typeof error.statusCode === "number") {
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  // Check message for network errors
  const message = String(error.message || error || "").toLowerCase();
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("rate limit")
  );
}

/**
 * Send email with automatic retry on failure
 * Pure function that returns a promise
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  retryConfig: EmailRetryConfig = DEFAULT_RETRY_CONFIG
): Promise<EmailResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await sendEmailInternal(options);

      if (result.success) {
        return result;
      }

      // If not successful but no error, treat as non-retryable
      if (!result.error) {
        return result;
      }

      lastError = new Error(result.error);

      // Check if error is retryable based on the error message
      if (
        !isRetryableError({ message: result.error }) &&
        !result.error.toLowerCase().includes("server error") &&
        !result.error.toLowerCase().includes("network error") &&
        !result.error.toLowerCase().includes("rate limit")
      ) {
        return result;
      }

      // If this is not the last attempt, wait before retrying
      if (attempt < retryConfig.maxRetries) {
        const delay = calculateBackoffDelay(attempt, retryConfig);
        console.log(`Email send attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!isRetryableError(error)) {
        return {
          success: false,
          error: lastError.message,
          timestamp: new Date().toISOString(),
        };
      }

      // If this is not the last attempt, wait before retrying
      if (attempt < retryConfig.maxRetries) {
        const delay = calculateBackoffDelay(attempt, retryConfig);
        console.log(
          `Email send attempt ${attempt + 1} failed with error, retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  const finalError = lastError?.message || "Unknown error";
  return {
    success: false,
    error: `Failed after ${retryConfig.maxRetries + 1} attempts: ${finalError}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Internal email sending function
 * Handles the actual API call to Resend
 */
async function sendEmailInternal(options: EmailOptions): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    const client = getResendClient();

    // Prepare email data - Resend requires either html or text
    const emailData: any = {
      from: options.from || config.fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      reply_to: options.replyTo,
      tags: options.tags?.map((tag) => ({
        name: tag.name,
        value: tag.value,
      })),
    };

    // Resend requires either html or text, not both
    if (options.html) {
      emailData.html = options.html;
    } else if (options.text) {
      emailData.text = options.text;
    } else {
      // Default to text if neither is provided
      emailData.text = "";
    }

    // Send email via Resend
    const response = await client.emails.send(emailData);

    if (response.error) {
      return {
        success: false,
        error: response.error.message || "Unknown error from Resend",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error("Error sending email:", error);

    // Check if this is a retryable error and pass it through if so
    if (isRetryableError(error)) {
      // For retryable errors, include enough info to determine retry behavior
      const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
      return {
        success: false,
        error: errorMessage.includes("rate limit")
          ? "Rate limit exceeded"
          : errorMessage.includes("network")
            ? "Network error"
            : errorMessage.includes("timeout")
              ? "Request timeout"
              : "Server error",
        timestamp: new Date().toISOString(),
      };
    }

    // Return sanitized error (no sensitive information)
    return {
      success: false,
      error: "Failed to send email. Please try again later.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send email without retry (for cases where retry is not desired)
 * Pure function that returns a promise
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  return sendEmailInternal(options);
}

/**
 * Validate email address format
 * Pure function - no side effects
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email content to prevent injection attacks
 * Pure function - no side effects
 */
export function sanitizeEmailContent(content: string): string {
  let sanitized = content;

  // Remove all script tags (opening and closing) in multiple passes
  let previousLength;
  do {
    previousLength = sanitized.length;
    // Remove complete script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // Remove any remaining opening script tags
    sanitized = sanitized.replace(/<script\b[^>]*>/gi, "");
    // Remove any remaining closing script tags
    sanitized = sanitized.replace(/<\/script>/gi, "");
  } while (sanitized.length !== previousLength);

  // Remove javascript: URLs and event handlers
  sanitized = sanitized.replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "");

  return sanitized;
}
