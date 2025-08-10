/**
 * Unit tests for Resend client initialization
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getResendClient, validateEmailConfig, resetResendClient } from "@/lib/email/resend-client";
import type { EmailServiceConfig } from "@/lib/email/types";

// Mock the Resend module
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation((apiKey: string) => ({
    apiKey,
    emails: {
      send: vi.fn(),
    },
  })),
}));

describe("resend-client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    // Reset the client instance
    resetResendClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("getResendClient", () => {
    it("should create a client instance when API key is provided", () => {
      process.env.RESEND_API_KEY = "test-api-key";

      const client = getResendClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty("emails");
    });

    it("should throw error when API key is missing", () => {
      delete process.env.RESEND_API_KEY;

      expect(() => getResendClient()).toThrow(
        "RESEND_API_KEY environment variable is required but not configured"
      );
    });

    it("should return the same instance on multiple calls (singleton)", () => {
      process.env.RESEND_API_KEY = "test-api-key";

      const client1 = getResendClient();
      const client2 = getResendClient();

      expect(client1).toBe(client2);
    });

    it("should create new instance after reset", () => {
      process.env.RESEND_API_KEY = "test-api-key";

      const client1 = getResendClient();
      resetResendClient();
      const client2 = getResendClient();

      expect(client1).not.toBe(client2);
    });
  });

  describe("validateEmailConfig", () => {
    it("should validate config with all required fields", () => {
      const config: Partial<EmailServiceConfig> = {
        apiKey: "test-api-key",
        fromEmail: "test@example.com",
      };

      const validated = validateEmailConfig(config);

      expect(validated).toEqual({
        provider: "resend",
        apiKey: "test-api-key",
        fromEmail: "test@example.com",
        retryConfig: undefined,
        isDevelopment: process.env.NODE_ENV === "development",
      });
    });

    it("should use environment variables as fallback", () => {
      process.env.RESEND_API_KEY = "env-api-key";
      process.env.RESEND_FROM_EMAIL = "env@example.com";

      const validated = validateEmailConfig();

      expect(validated.apiKey).toBe("env-api-key");
      expect(validated.fromEmail).toBe("env@example.com");
    });

    it("should throw error for missing API key", () => {
      delete process.env.RESEND_API_KEY;

      expect(() => validateEmailConfig()).toThrow(
        "Email service API key is required but not provided"
      );
    });

    it("should throw error for missing from email", () => {
      process.env.RESEND_API_KEY = "test-api-key";
      delete process.env.RESEND_FROM_EMAIL;

      expect(() => validateEmailConfig()).toThrow(
        "From email address is required but not provided"
      );
    });

    it("should validate email format", () => {
      const invalidEmails = [
        "invalid",
        "@example.com",
        "test@",
        "test @example.com",
        "test@example",
      ];

      invalidEmails.forEach((email) => {
        expect(() =>
          validateEmailConfig({
            apiKey: "test-key",
            fromEmail: email,
          })
        ).toThrow(`Invalid from email address format: ${email}`);
      });
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "noreply@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        const config = validateEmailConfig({
          apiKey: "test-key",
          fromEmail: email,
        });
        expect(config.fromEmail).toBe(email);
      });
    });

    it("should preserve custom retry config", () => {
      const retryConfig = {
        maxRetries: 5,
        initialDelayMs: 2000,
        maxDelayMs: 60000,
        backoffMultiplier: 3,
      };

      const config = validateEmailConfig({
        apiKey: "test-key",
        fromEmail: "test@example.com",
        retryConfig,
      });

      expect(config.retryConfig).toEqual(retryConfig);
    });

    it("should detect development environment", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      vi.stubEnv("NODE_ENV", "development");

      const config = validateEmailConfig({
        apiKey: "test-key",
        fromEmail: "test@example.com",
      });

      expect(config.isDevelopment).toBe(true);
      vi.stubEnv("NODE_ENV", originalNodeEnv);
    });

    it("should detect production environment", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      vi.stubEnv("NODE_ENV", "production");

      const config = validateEmailConfig({
        apiKey: "test-key",
        fromEmail: "test@example.com",
      });

      expect(config.isDevelopment).toBe(false);
      vi.stubEnv("NODE_ENV", originalNodeEnv);
    });
  });

  describe("resetResendClient", () => {
    it("should reset the client instance", () => {
      process.env.RESEND_API_KEY = "test-api-key";

      const client1 = getResendClient();
      resetResendClient();
      const client2 = getResendClient();

      expect(client1).not.toBe(client2);
    });

    it("should not throw when called multiple times", () => {
      expect(() => {
        resetResendClient();
        resetResendClient();
        resetResendClient();
      }).not.toThrow();
    });
  });
});
