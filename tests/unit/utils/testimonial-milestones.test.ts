import { describe, it, expect } from "vitest";
import {
  hasCompletedFirstRoadmap,
  hasSustainedSuccess,
  getTestimonialMilestone,
} from "@/lib/utils/testimonial-milestones";

describe("testimonial-milestones", () => {
  describe("hasCompletedFirstRoadmap", () => {
    it("returns true for exactly 1 completed roadmap", () => {
      expect(hasCompletedFirstRoadmap(1)).toBe(true);
    });

    it("returns false for 0 completed roadmaps", () => {
      expect(hasCompletedFirstRoadmap(0)).toBe(false);
    });

    it("returns false for more than 1 completed roadmap", () => {
      expect(hasCompletedFirstRoadmap(2)).toBe(false);
      expect(hasCompletedFirstRoadmap(5)).toBe(false);
    });
  });

  describe("hasSustainedSuccess", () => {
    it("returns true for 3 or more completed roadmaps", () => {
      expect(hasSustainedSuccess(3)).toBe(true);
      expect(hasSustainedSuccess(5)).toBe(true);
      expect(hasSustainedSuccess(10)).toBe(true);
    });

    it("returns false for less than 3 completed roadmaps", () => {
      expect(hasSustainedSuccess(0)).toBe(false);
      expect(hasSustainedSuccess(1)).toBe(false);
      expect(hasSustainedSuccess(2)).toBe(false);
    });

    it("considers effectiveness rating when provided", () => {
      // High effectiveness (>= 4) with enough roadmaps
      expect(hasSustainedSuccess(3, 4.0)).toBe(true);
      expect(hasSustainedSuccess(3, 4.5)).toBe(true);
      expect(hasSustainedSuccess(3, 5.0)).toBe(true);

      // Low effectiveness (< 4) even with enough roadmaps
      expect(hasSustainedSuccess(3, 3.9)).toBe(false);
      expect(hasSustainedSuccess(3, 3.0)).toBe(false);
      expect(hasSustainedSuccess(5, 2.5)).toBe(false);
    });

    it("returns false if not enough roadmaps regardless of effectiveness", () => {
      expect(hasSustainedSuccess(2, 5.0)).toBe(false);
      expect(hasSustainedSuccess(1, 4.5)).toBe(false);
    });
  });

  describe("getTestimonialMilestone", () => {
    it("shows first roadmap prompt when conditions are met", () => {
      const result = getTestimonialMilestone("not_asked", 1);
      expect(result).toEqual({
        type: "first_roadmap",
        shouldShow: true,
      });
    });

    it("does not show first roadmap prompt if already asked", () => {
      const result = getTestimonialMilestone("asked_first", 1);
      expect(result).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("shows sustained success prompt when conditions are met", () => {
      const result = getTestimonialMilestone("asked_first", 3);
      expect(result).toEqual({
        type: "sustained_success",
        shouldShow: true,
      });
    });

    it("does not show sustained success if not asked first", () => {
      const result = getTestimonialMilestone("not_asked", 3);
      expect(result).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("never shows if already submitted", () => {
      const result1 = getTestimonialMilestone("submitted", 1);
      expect(result1).toEqual({
        type: null,
        shouldShow: false,
      });

      const result2 = getTestimonialMilestone("submitted", 3);
      expect(result2).toEqual({
        type: null,
        shouldShow: false,
      });

      const result3 = getTestimonialMilestone("submitted", 10);
      expect(result3).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("does not show if dismissed first and only 1 roadmap", () => {
      const result = getTestimonialMilestone("dismissed_first", 1);
      expect(result).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("can show sustained success after dismissing first", () => {
      const result = getTestimonialMilestone("dismissed_first", 3);
      expect(result).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("does not show if dismissed second", () => {
      const result = getTestimonialMilestone("dismissed_second", 5);
      expect(result).toEqual({
        type: null,
        shouldShow: false,
      });
    });

    it("handles null testimonial state as not_asked", () => {
      const result = getTestimonialMilestone(null, 1);
      expect(result).toEqual({
        type: "first_roadmap",
        shouldShow: true,
      });
    });

    it("considers effectiveness rating for sustained success", () => {
      // High effectiveness
      const result1 = getTestimonialMilestone("asked_first", 3, 4.5);
      expect(result1).toEqual({
        type: "sustained_success",
        shouldShow: true,
      });

      // Low effectiveness
      const result2 = getTestimonialMilestone("asked_first", 3, 3.5);
      expect(result2).toEqual({
        type: null,
        shouldShow: false,
      });
    });
  });
});
