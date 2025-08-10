/**
 * Unit tests for email sending functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  sendEmail,
  sendEmailWithRetry,
  isValidEmail,
  sanitizeEmailContent,
} from "@/lib/email/send-email";
import type { EmailOptions, EmailRetryConfig } from "@/lib/email/types";

// Mock the resend-client module
vi.mock("@/lib/email/resend-client", () => ({
  getResendClient: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
  validateEmailConfig: vi.fn(() => ({
    provider: "resend",
    apiKey: "test-key",
    fromEmail: "noreply@example.com",
    isDevelopment: true,
  })),
}));

describe("send-email", () => {
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Setup mock for Resend client
    const { getResendClient } = vi.mocked(await import("@/lib/email/resend-client"));
    mockSend = vi.fn();
    (getResendClient as ReturnType<typeof vi.fn>).mockReturnValue({
      emails: {
        send: mockSend,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      mockSend.mockResolvedValue({
        data: { id: "msg_123" },
        error: null,
      });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_123");
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user@example.com"],
          subject: "Test Email",
          html: "<p>Test content</p>",
        })
      );
    });

    it("should handle multiple recipients", async () => {
      mockSend.mockResolvedValue({
        data: { id: "msg_456" },
        error: null,
      });

      const options: EmailOptions = {
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test Email",
        text: "Plain text content",
      };

      await sendEmail(options);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user1@example.com", "user2@example.com"],
          subject: "Test Email",
          text: "Plain text content",
        })
      );
    });

    it("should use custom from email when provided", async () => {
      mockSend.mockResolvedValue({
        data: { id: "msg_789" },
        error: null,
      });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
        from: "custom@example.com",
      };

      await sendEmail(options);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "custom@example.com",
        })
      );
    });

    it("should handle Resend API errors", async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: "API key invalid" },
      });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("API key invalid");
    });

    it("should handle exceptions gracefully", async () => {
      mockSend.mockRejectedValue(new Error("Network error"));

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error"); // Network errors are now identified as retryable
    });

    it("should include tags when provided", async () => {
      mockSend.mockResolvedValue({
        data: { id: "msg_tag" },
        error: null,
      });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
        tags: [
          { name: "type", value: "reminder" },
          { name: "env", value: "test" },
        ],
      };

      await sendEmail(options);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [
            { name: "type", value: "reminder" },
            { name: "env", value: "test" },
          ],
        })
      );
    });
  });

  describe("sendEmailWithRetry", () => {
    it("should retry on retryable errors", async () => {
      mockSend
        .mockRejectedValueOnce({ statusCode: 500, message: "Server error" })
        .mockRejectedValueOnce({ statusCode: 503, message: "Service unavailable" })
        .mockResolvedValueOnce({ data: { id: "msg_retry" }, error: null });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
      };

      const retryConfig: EmailRetryConfig = {
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      const result = await sendEmailWithRetry(options, retryConfig);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_retry");
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it("should not retry on non-retryable errors", async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { statusCode: 400, message: "Bad request" },
      });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
      };

      const retryConfig: EmailRetryConfig = {
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      const result = await sendEmailWithRetry(options, retryConfig);

      expect(result.success).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should respect max retries", async () => {
      mockSend.mockRejectedValue({ statusCode: 500, message: "Server error" });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
      };

      const retryConfig: EmailRetryConfig = {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      const result = await sendEmailWithRetry(options, retryConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed after 3 attempts");
      expect(mockSend).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should retry on rate limit errors", async () => {
      mockSend
        .mockRejectedValueOnce({ statusCode: 429, message: "Rate limit exceeded" })
        .mockResolvedValueOnce({ data: { id: "msg_rate" }, error: null });

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test",
        text: "Content",
      };

      const retryConfig: EmailRetryConfig = {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      const result = await sendEmailWithRetry(options, retryConfig);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user_name@subdomain.example.com",
        "123@example.com",
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid",
        "@example.com",
        "user@",
        "user @example.com",
        "user@example",
        "user@@example.com",
        "",
        " ",
        "user@.com",
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe("sanitizeEmailContent", () => {
    it("should remove script tags", () => {
      const content = `
        <p>Hello</p>
        <script>alert("XSS")</script>
        <p>World</p>
      `;

      const sanitized = sanitizeEmailContent(content);

      expect(sanitized).not.toContain("<script");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).toContain("<p>Hello</p>");
      expect(sanitized).toContain("<p>World</p>");
    });

    it("should remove javascript: URLs", () => {
      const content = `
        <a href="javascript:alert('XSS')">Click me</a>
        <a href="http://example.com">Safe link</a>
      `;

      const sanitized = sanitizeEmailContent(content);

      expect(sanitized).not.toContain("javascript:");
      expect(sanitized).toContain("http://example.com");
    });

    it("should remove event handlers", () => {
      const content = `
        <div onclick="alert('XSS')">Click</div>
        <img src="image.jpg" onerror="alert('XSS')" />
        <button onmouseover="alert('XSS')">Hover</button>
      `;

      const sanitized = sanitizeEmailContent(content);

      expect(sanitized).not.toContain("onclick=");
      expect(sanitized).not.toContain("onerror=");
      expect(sanitized).not.toContain("onmouseover=");
      expect(sanitized).toContain("<div");
      expect(sanitized).toContain("<img");
      expect(sanitized).toContain("<button");
    });

    it("should handle nested script tags", () => {
      const content = `
        <script><script>alert("XSS")</script></script>
      `;

      const sanitized = sanitizeEmailContent(content);

      expect(sanitized).not.toContain("<script");
      expect(sanitized).not.toContain("</script>");
    });

    it("should preserve safe HTML", () => {
      const content = `
        <h1>Welcome</h1>
        <p>This is a <strong>safe</strong> email.</p>
        <a href="https://example.com">Visit our site</a>
      `;

      const sanitized = sanitizeEmailContent(content);

      expect(sanitized).toBe(content);
    });
  });
});
