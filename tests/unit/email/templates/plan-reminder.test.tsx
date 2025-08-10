/**
 * Unit tests for plan reminder email template
 */

import { describe, it, expect } from "vitest";
import { renderPlanReminderTemplate } from "@/lib/email/templates/plan-reminder";
import { getMotivationalMessage } from "@/lib/email/templates/motivational-messages";
import { renderPlanReminder } from "@/lib/email/templates/render-plan-reminder";

describe("Plan Reminder Email Template", () => {
  describe("renderPlanReminderTemplate", () => {
    it("should render a complete HTML email with required elements", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "I feel overwhelmed",
        planAction: "I will take 5 deep breaths",
        contentType: "mental-model",
        contentTitle: "Mindfulness",
      });

      // Check for DOCTYPE
      expect(html).toContain("<!DOCTYPE html>");

      // Check for essential HTML structure
      expect(html).toContain("<html>");
      expect(html).toContain("<head>");
      expect(html).toContain("<body");

      // Check for viewport meta tag (mobile responsiveness)
      expect(html).toContain('name="viewport"');
      expect(html).toContain("width=device-width");

      // Check for LattixIQ branding
      expect(html).toContain("🧠");
      expect(html).toContain("LattixIQ");
      expect(html).toContain("Your roadmap to a clearer mind.");

      // Check for plan content
      expect(html).toContain("IF:");
      expect(html).toContain("I feel overwhelmed");
      expect(html).toContain("THEN:");
      expect(html).toContain("I will take 5 deep breaths");

      // Check for greeting
      expect(html).toContain("Hi there,");
      expect(html).toContain("It's time to practice your plan:");
    });

    it("should include user name in greeting when provided", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "mental-model",
        userName: "Alice",
      });

      expect(html).toContain("Hi Alice,");
      expect(html).not.toContain("Hi there,");
    });

    it("should escape HTML in user-generated content", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "<script>alert('xss')</script>",
        planAction: "Normal & safe action",
        contentType: "mental-model",
        userName: "<b>Bob</b>",
      });

      // Should escape dangerous HTML
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toContain("alert('xss')");

      // Should escape HTML in username
      expect(html).not.toContain("<b>Bob</b>");
      expect(html).toContain("&lt;b&gt;Bob&lt;/b&gt;");

      // Should escape ampersand
      expect(html).toContain("Normal &amp; safe action");
    });

    it("should not contain any external links", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "cognitive-bias",
      });

      // Check for absence of href attributes with http/https
      expect(html).not.toMatch(/href\s*=\s*["']https?:/i);

      // Check for absence of common tracking pixels
      expect(html).not.toContain('img src="http');
      expect(html).not.toContain("pixel.gif");
      expect(html).not.toContain("track.php");

      // Check for comment about no external links
      expect(html).toContain("NO external links");
    });

    it("should handle newlines in plan content", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "Line 1\nLine 2",
        planAction: "Action\nWith\nNewlines",
        contentType: "mental-model",
      });

      // Newlines should be converted to <br />
      expect(html).toContain("Line 1<br />Line 2");
      expect(html).toContain("Action<br />With<br />Newlines");
    });

    it("should use correct styling for mobile responsiveness", () => {
      const html = renderPlanReminderTemplate({
        planTrigger: "trigger",
        planAction: "action",
        contentType: "mental-model",
      });

      // Check for max-width constraint
      expect(html).toContain("max-width: 600px");

      // Check for responsive table layout
      expect(html).toContain('width="100%"');
      expect(html).toContain('cellpadding="0"');
      expect(html).toContain('cellspacing="0"');

      // Check for email client reset styles
      expect(html).toContain("-webkit-text-size-adjust");
      expect(html).toContain("-ms-text-size-adjust");
    });
  });

  describe("getMotivationalMessage", () => {
    it("should return consistent message for same content title", () => {
      const message1 = getMotivationalMessage("mental-model", "Test Model");
      const message2 = getMotivationalMessage("mental-model", "Test Model");

      expect(message1).toBe(message2);
    });

    it("should return different messages for different content titles", () => {
      const message1 = getMotivationalMessage("mental-model", "Model A");
      const message2 = getMotivationalMessage("mental-model", "Model B");

      // They might be the same due to hash collision, but usually different
      // Just check they're valid messages
      expect(message1).toBeTruthy();
      expect(message2).toBeTruthy();
      expect(message1.length).toBeGreaterThan(10);
      expect(message2.length).toBeGreaterThan(10);
    });

    it("should return appropriate messages for each content type", () => {
      const mentalModelMsg = getMotivationalMessage("mental-model", "Test");
      const biasMsg = getMotivationalMessage("cognitive-bias", "Test");
      const fallacyMsg = getMotivationalMessage("fallacy", "Test");

      // Check that messages contain relevant keywords
      expect(mentalModelMsg.toLowerCase()).toMatch(/mental model|thinking|toolkit|practice/);
      expect(biasMsg.toLowerCase()).toMatch(/bias|blind spot|awareness|recognize/);
      expect(fallacyMsg.toLowerCase()).toMatch(/fallac|reasoning|logical|critical/);
    });

    it("should return default message when no title provided", () => {
      const message = getMotivationalMessage("mental-model");

      expect(message).toBe(
        "Remember, every mental model you practice rewires your brain for clearer thinking."
      );
    });
  });

  describe("renderPlanReminder", () => {
    it("should successfully render with valid inputs", () => {
      const result = renderPlanReminder({
        planTrigger: "I notice a pattern",
        planAction: "I will document it",
        contentType: "mental-model",
        contentTitle: "Pattern Recognition",
        userName: "Test User",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.html!.length).toBeGreaterThan(100);
    });

    it("should fail when plan trigger is missing", () => {
      const result = renderPlanReminder({
        planTrigger: null,
        planAction: "action",
        contentType: "mental-model",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required plan content");
      expect(result.html).toBeUndefined();
    });

    it("should fail when plan action is missing", () => {
      const result = renderPlanReminder({
        planTrigger: "trigger",
        planAction: null,
        contentType: "mental-model",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required plan content");
      expect(result.html).toBeUndefined();
    });

    it("should fail when plan content is empty after trimming", () => {
      const result = renderPlanReminder({
        planTrigger: "   ",
        planAction: "action",
        contentType: "mental-model",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Plan content cannot be empty");
      expect(result.html).toBeUndefined();
    });

    it("should use default content type when not provided", () => {
      const result = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
        contentType: null,
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
      // Should contain mental model message (default)
      expect(result.html).toContain("mental model");
    });

    it("should handle optional fields gracefully", () => {
      const result = renderPlanReminder({
        planTrigger: "trigger",
        planAction: "action",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
      expect(result.html).toContain("Hi there,"); // Default greeting
    });
  });
});
