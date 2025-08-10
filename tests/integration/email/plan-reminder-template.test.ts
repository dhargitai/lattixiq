/**
 * Integration tests for plan reminder email template
 * Tests the complete rendering flow and email service integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderPlanReminder } from "@/lib/email/templates/render-plan-reminder";
import { sendEmail } from "@/lib/email/send-email";
import type { Database } from "@/lib/supabase/database.types";

// Mock the send-email module
vi.mock("@/lib/email/send-email", () => ({
  sendEmail: vi.fn(),
  sendEmailWithRetry: vi.fn(),
  sanitizeEmailContent: (content: string) =>
    content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;"),
}));

describe("Plan Reminder Template Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete template rendering flow", () => {
    it("should generate valid HTML for email sending", () => {
      const result = renderPlanReminder({
        planTrigger: "I notice myself getting distracted",
        planAction: "I will use the Pomodoro technique for 25 minutes",
        contentType: "mental-model",
        contentTitle: "Time Boxing",
        userName: "John Doe",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();

      const html = result.html!;

      // Verify HTML structure is complete
      expect(html).toMatch(/^<!DOCTYPE html>/);
      expect(html).toMatch(/<\/html>$/);

      // Verify all required sections are present
      expect(html).toContain("John Doe");
      expect(html).toContain("I notice myself getting distracted");
      expect(html).toContain("I will use the Pomodoro technique for 25 minutes");
      // Note: contentTitle is used for message selection, not displayed in email

      // Verify email client compatibility elements
      expect(html).toContain("mso-table-lspace");
      expect(html).toContain("-ms-interpolation-mode");
    });

    it("should handle real-world plan content with special characters", () => {
      const result = renderPlanReminder({
        planTrigger: "When I'm about to make a decision & feel uncertain",
        planAction: "I'll write down pros/cons, then sleep on it for 24hrs",
        contentType: "cognitive-bias",
        contentTitle: "Confirmation Bias",
        userName: "Jane O'Connor",
      });

      expect(result.success).toBe(true);

      const html = result.html!;

      // Check special characters are properly escaped
      expect(html).toContain("&amp;");
      expect(html).toContain("I&#039;ll");
      expect(html).toContain("O&#039;Connor");

      // Verify content is still readable
      expect(html).toContain("pros/cons");
      expect(html).toContain("24hrs");
    });

    it("should generate different messages for different content types", () => {
      const mentalModelResult = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "mental-model",
        contentTitle: "Test Model",
      });

      const biasResult = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "cognitive-bias",
        contentTitle: "Test Bias",
      });

      const fallacyResult = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "fallacy",
        contentTitle: "Test Fallacy",
      });

      expect(mentalModelResult.html).toMatch(/mental model|toolkit|practice/i);
      expect(biasResult.html).toMatch(/bias|blind spot|awareness/i);
      expect(fallacyResult.html).toMatch(/fallac|reasoning|logical/i);
    });

    it("should handle very long plan content gracefully", () => {
      const longTrigger = `When ${"I notice myself procrastinating ".repeat(20)}`;
      const longAction = `Then ${"I will take a small step forward ".repeat(20)}`;

      const result = renderPlanReminder({
        planTrigger: longTrigger,
        planAction: longAction,
        contentType: "mental-model",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
      expect(result.html!.length).toBeGreaterThan(longTrigger.length + longAction.length);
    });

    it("should handle multiline plan content", () => {
      const multilineTrigger = `When I notice:
- Feeling overwhelmed
- Having too many tasks
- Not knowing where to start`;

      const multilineAction = `I will:
1. Take a deep breath
2. List my top 3 priorities
3. Start with the smallest one`;

      const result = renderPlanReminder({
        planTrigger: multilineTrigger,
        planAction: multilineAction,
        contentType: "mental-model",
        contentTitle: "Priority Management",
      });

      expect(result.success).toBe(true);

      const html = result.html!;

      // Check newlines are converted to <br />
      expect(html).toContain("<br />");
      expect(html).toContain("Feeling overwhelmed");
      expect(html).toContain("Take a deep breath");
      expect(html).toContain("top 3 priorities");
    });
  });

  describe("Email service integration", () => {
    it("should produce HTML suitable for email sending", async () => {
      const result = renderPlanReminder({
        planTrigger: "I catch myself making assumptions",
        planAction: "I will ask clarifying questions",
        contentType: "cognitive-bias",
        contentTitle: "Jumping to Conclusions",
        userName: "Test User",
      });

      expect(result.success).toBe(true);

      // Simulate sending the email
      const mockSendEmail = vi.mocked(sendEmail);
      mockSendEmail.mockResolvedValueOnce({
        success: true,
        messageId: "test-123",
        timestamp: new Date().toISOString(),
      });

      const emailResult = await sendEmail({
        to: "test@example.com",
        subject: "Time to practice your plan",
        html: result.html!,
      });

      expect(emailResult.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Time to practice your plan",
        html: expect.stringContaining("I catch myself making assumptions"),
      });
    });

    it("should validate HTML structure for email compatibility", () => {
      const result = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "mental-model",
      });

      const html = result.html!;

      // Check for proper table-based layout (required for Outlook)
      const tableCount = (html.match(/<table/g) || []).length;
      expect(tableCount).toBeGreaterThan(2);

      // Check for inline styles (required for Gmail)
      expect(html).toContain('style="');

      // Check no external stylesheets
      expect(html).not.toContain('<link rel="stylesheet"');

      // Check no JavaScript
      expect(html).not.toContain("<script");
      expect(html).not.toContain("javascript:");

      // Check proper DOCTYPE for HTML emails
      expect(html).toMatch(/^<!DOCTYPE html>/);
    });

    it("should handle database null values correctly", () => {
      // Simulate data from database with nullable fields
      const dbData: {
        plan_trigger: string | null;
        plan_action: string | null;
        content_type: Database["public"]["Enums"]["knowledge_content_type"] | null;
        title: string | null;
      } = {
        plan_trigger: "database trigger",
        plan_action: "database action",
        content_type: null,
        title: null,
      };

      const result = renderPlanReminder({
        planTrigger: dbData.plan_trigger,
        planAction: dbData.plan_action,
        contentType: dbData.content_type,
        contentTitle: dbData.title,
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
      // Should use default content type
      expect(result.html).toContain("mental model");
    });
  });

  describe("Edge cases and error scenarios", () => {
    it("should handle XSS attempts in all fields", () => {
      const xssAttempt = "<img src=x onerror=alert('XSS')>";

      const result = renderPlanReminder({
        planTrigger: xssAttempt,
        planAction: xssAttempt,
        contentType: "mental-model",
        contentTitle: xssAttempt,
        userName: xssAttempt,
      });

      expect(result.success).toBe(true);

      const html = result.html!;

      // Should not contain any unescaped executable code
      // Note: We check for actual dangerous patterns, not escaped text
      expect(html).not.toMatch(/<img[^>]*src=/i); // No actual img tags with src
      expect(html).not.toMatch(/<script/i); // No script tags
      expect(html).not.toContain("javascript:"); // No javascript: URLs

      // The dangerous content should be escaped (appear as text, not executable)
      // Check that the onerror is within escaped tags
      expect(html).toContain("&lt;img src=x onerror="); // Escaped form is safe

      // Should contain escaped version
      expect(html).toContain("&lt;img");
    });

    it("should handle unicode and emoji in content", () => {
      const result = renderPlanReminder({
        planTrigger: "When I feel 😔 or stressed 🤯",
        planAction: "I'll practice 🧘 meditation → peace ☮️",
        contentType: "mental-model",
        contentTitle: "Mindfulness 🧠",
        userName: "用户",
      });

      expect(result.success).toBe(true);

      const html = result.html!;

      // Should preserve emoji and unicode
      expect(html).toContain("😔");
      expect(html).toContain("🤯");
      expect(html).toContain("🧘");
      expect(html).toContain("☮️");
      expect(html).toContain("用户");
    });

    it("should gracefully handle template rendering errors", () => {
      // Test with invalid inputs that might cause rendering issues
      const result = renderPlanReminder({
        planTrigger: "\x00\x01\x02", // Control characters
        planAction: "normal action",
        contentType: "mental-model",
      });

      // Should either succeed with sanitized content or fail gracefully
      if (result.success) {
        expect(result.html).toBeDefined();
        expect(result.html).not.toContain("\x00");
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("Performance considerations", () => {
    it("should render template quickly for typical content", () => {
      const startTime = performance.now();

      const result = renderPlanReminder({
        planTrigger: "I notice myself overthinking",
        planAction: "I will set a 5-minute timer to make a decision",
        contentType: "cognitive-bias",
        contentTitle: "Analysis Paralysis",
        userName: "Performance Test",
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it("should handle batch rendering efficiently", () => {
      const templates = Array.from({ length: 100 }, (_, i) => ({
        planTrigger: `Trigger ${i}`,
        planAction: `Action ${i}`,
        contentType: "mental-model" as const,
        contentTitle: `Model ${i}`,
        userName: `User ${i}`,
      }));

      const startTime = performance.now();

      const results = templates.map((template) => renderPlanReminder(template));

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(totalTime).toBeLessThan(1000); // 100 templates in less than 1 second
    });
  });
});
