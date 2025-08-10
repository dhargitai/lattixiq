/**
 * Email service type definitions
 * Following functional programming patterns - all types are immutable
 */

export interface EmailOptions {
  readonly to: string | string[];
  readonly subject: string;
  readonly html?: string;
  readonly text?: string;
  readonly from?: string;
  readonly replyTo?: string;
  readonly tags?: readonly EmailTag[];
}

export interface EmailTag {
  readonly name: string;
  readonly value: string;
}

export interface EmailResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
  readonly timestamp: string;
}

export interface EmailRetryConfig {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
}

export interface EmailLogEntry {
  readonly userId?: string;
  readonly notificationType: "email" | "daily_reminder" | "test";
  readonly title: string;
  readonly body: string;
  readonly deliveryStatus: "sent" | "failed" | "retry";
  readonly errorMessage?: string;
  readonly deliveredAt?: string;
  readonly metadata?: Record<string, unknown>;
}

export const DEFAULT_RETRY_CONFIG: EmailRetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
} as const;

export type EmailProvider = "resend" | "sendgrid" | "ses";

export interface EmailServiceConfig {
  readonly provider: EmailProvider;
  readonly apiKey?: string;
  readonly fromEmail: string;
  readonly retryConfig?: EmailRetryConfig;
  readonly isDevelopment?: boolean;
}
