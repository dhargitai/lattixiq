/**
 * Integration tests for email sending flow
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { sendEmail, sendEmailWithRetry } from "@/lib/email/send-email";
import { logEmailDelivery, getUserEmailStats } from "@/lib/email/email-logger";
import type { EmailOptions } from "@/lib/email/types";

// Track retry attempts without using global
let retryAttempt = 0;

// Mock Resend to avoid actual API calls in tests
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockImplementation(async (data) => {
        // Simulate various scenarios based on email content
        if (data.subject?.includes("FAIL")) {
          return {
            error: { message: "Simulated failure for testing" },
            data: null,
          };
        }
        if (data.subject?.includes("RETRY")) {
          // Fail first time, succeed second time
          if (!retryAttempt) {
            retryAttempt = 1;
            throw new Error("Network error");
          }
          retryAttempt = 0;
          return {
            data: { id: "msg_retry_success" },
            error: null,
          };
        }
        return {
          data: { id: `msg_${Date.now()}` },
          error: null,
        };
      }),
    },
  })),
}));

// Mock Supabase for logging tests
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({
              data: [
                { delivery_status: "sent", delivered_at: new Date().toISOString() },
                { delivery_status: "sent", delivered_at: new Date().toISOString() },
                { delivery_status: "failed", delivered_at: null },
              ],
              error: null,
            }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ id: "1" }, { id: "2" }],
              error: null,
            }),
          }),
        }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: "test-user-id", email: "test@example.com" },
        },
        error: null,
      }),
    },
  }),
}));

describe("Email Integration Tests", () => {
  beforeAll(() => {
    // Set up environment variables for testing
    process.env.RESEND_API_KEY = "test_api_key";
    process.env.RESEND_FROM_EMAIL = "noreply@test.com";
    vi.stubEnv("NODE_ENV", "test");
  });

  afterAll(() => {
    // Clean up
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    retryAttempt = 0;
  });

  describe("Complete Email Flow", () => {
    it("should send email and log successful delivery", async () => {
      const emailOptions: EmailOptions = {
        to: "recipient@example.com",
        subject: "Integration Test Email",
        html: "<p>This is a test email</p>",
        tags: [{ name: "type", value: "test" }],
      };

      // Send email
      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // Log the delivery
      const logged = await logEmailDelivery(
        "test-user-id",
        emailOptions.subject,
        emailOptions.html || "",
        result,
        { testRun: true }
      );

      expect(logged).toBe(true);
    });

    it("should handle email failure and log error", async () => {
      const emailOptions: EmailOptions = {
        to: "recipient@example.com",
        subject: "FAIL: This will fail",
        text: "This email will fail for testing",
      };

      // Send email (will fail)
      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Simulated failure for testing");

      // Log the failure
      const logged = await logEmailDelivery(
        "test-user-id",
        emailOptions.subject,
        emailOptions.text || "",
        result
      );

      expect(logged).toBe(true);
    });

    it("should retry failed emails with exponential backoff", async () => {
      const emailOptions: EmailOptions = {
        to: "recipient@example.com",
        subject: "RETRY: This will succeed on retry",
        text: "Testing retry mechanism",
      };

      const retryConfig = {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      const startTime = Date.now();
      const result = await sendEmailWithRetry(emailOptions, retryConfig);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_retry_success");
      // Should have some delay due to retry
      expect(duration).toBeGreaterThan(10);
    });

    it("should send emails with different content types", async () => {
      // HTML email
      const htmlEmail: EmailOptions = {
        to: "recipient@example.com",
        subject: "HTML Email Test",
        html: "<h1>HTML Content</h1><p>With formatting</p>",
      };

      const htmlResult = await sendEmail(htmlEmail);
      expect(htmlResult.success).toBe(true);

      // Plain text email
      const textEmail: EmailOptions = {
        to: "recipient@example.com",
        subject: "Plain Text Email Test",
        text: "Plain text content without formatting",
      };

      const textResult = await sendEmail(textEmail);
      expect(textResult.success).toBe(true);

      // Email with both (should prefer HTML)
      const bothEmail: EmailOptions = {
        to: "recipient@example.com",
        subject: "Both Content Types",
        html: "<p>HTML version</p>",
        text: "Text version",
      };

      const bothResult = await sendEmail(bothEmail);
      expect(bothResult.success).toBe(true);
    });

    it("should handle multiple recipients", async () => {
      const emailOptions: EmailOptions = {
        to: ["recipient1@example.com", "recipient2@example.com", "recipient3@example.com"],
        subject: "Multi-recipient Test",
        text: "Sent to multiple recipients",
      };

      const result = await sendEmail(emailOptions);
      expect(result.success).toBe(true);
    });

    it("should include custom headers and metadata", async () => {
      const emailOptions: EmailOptions = {
        to: "recipient@example.com",
        subject: "Email with Metadata",
        html: "<p>Email with custom data</p>",
        from: "custom@test.com",
        replyTo: "reply@test.com",
        tags: [
          { name: "campaign", value: "integration-test" },
          { name: "version", value: "1.0" },
        ],
      };

      const result = await sendEmail(emailOptions);
      expect(result.success).toBe(true);
    });
  });

  describe("Email Statistics", () => {
    it("should retrieve user email statistics", async () => {
      const stats = await getUserEmailStats("test-user-id", 30);

      expect(stats).toBeDefined();
      expect(stats.totalSent).toBe(2);
      expect(stats.totalFailed).toBe(1);
      expect(stats.successRate).toBe(66.67);
      expect(stats.lastSentAt).toBeDefined();
    });

    it("should handle missing user statistics gracefully", async () => {
      // Mock empty response
      const { createClient } = vi.mocked(await import("@/lib/supabase/server"));
      (createClient as any).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const stats = await getUserEmailStats("new-user-id", 30);

      expect(stats.totalSent).toBe(0);
      expect(stats.totalFailed).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.lastSentAt).toBeNull();
    });
  });

  describe("Error Scenarios", () => {
    it("should handle missing environment variables", async () => {
      const originalApiKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      // Reset the client to force re-initialization
      const { resetResendClient } = await import("@/lib/email/resend-client");
      resetResendClient();

      const emailOptions: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test",
        text: "Test",
      };

      // Without API key, the send should fail with an error
      const result = await sendEmail(emailOptions);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore
      process.env.RESEND_API_KEY = originalApiKey;
      resetResendClient();
    });

    it("should validate email addresses before sending", async () => {
      const invalidEmails = ["invalid-email", "@example.com", "user@", "user @example.com"];

      for (const email of invalidEmails) {
        const { isValidEmail } = await import("@/lib/email/send-email");
        expect(isValidEmail(email)).toBe(false);
      }
    });

    it("should sanitize email content", async () => {
      const { sanitizeEmailContent } = await import("@/lib/email/send-email");

      const maliciousContent = `
        <p>Hello</p>
        <script>alert('XSS')</script>
        <img src="x" onerror="alert('XSS')" />
      `;

      const sanitized = sanitizeEmailContent(maliciousContent);

      expect(sanitized).not.toContain("<script");
      expect(sanitized).not.toContain("onerror=");
      expect(sanitized).toContain("<p>Hello</p>");
    });
  });

  describe("Concurrent Email Sending", () => {
    it("should handle multiple concurrent email sends", async () => {
      const emails: EmailOptions[] = Array.from({ length: 10 }, (_, i) => ({
        to: `recipient${i}@example.com`,
        subject: `Concurrent Test ${i}`,
        text: `Email number ${i}`,
      }));

      const results = await Promise.all(emails.map((email) => sendEmail(email)));

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
      });
    });

    it("should handle mixed success and failure in concurrent sends", async () => {
      const emails: EmailOptions[] = [
        { to: "success1@example.com", subject: "Success 1", text: "Will succeed" },
        { to: "fail@example.com", subject: "FAIL: Will fail", text: "Will fail" },
        { to: "success2@example.com", subject: "Success 2", text: "Will succeed" },
      ];

      const results = await Promise.allSettled(emails.map((email) => sendEmail(email)));

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("fulfilled");
      expect(results[2].status).toBe("fulfilled");

      // Check individual results
      if (results[0].status === "fulfilled") {
        expect(results[0].value.success).toBe(true);
      }
      if (results[1].status === "fulfilled") {
        expect(results[1].value.success).toBe(false);
      }
      if (results[2].status === "fulfilled") {
        expect(results[2].value.success).toBe(true);
      }
    });
  });
});
