import { describe, it, expect } from "vitest";
import { shouldShowBottomNav, getNavigationPadding } from "@/lib/navigation/visibility";

describe("Navigation Visibility", () => {
  describe("shouldShowBottomNav", () => {
    it("returns true for regular app routes", () => {
      expect(shouldShowBottomNav("/")).toBe(true);
      expect(shouldShowBottomNav("/toolkit")).toBe(true);
      expect(shouldShowBottomNav("/settings")).toBe(true);
      expect(shouldShowBottomNav("/roadmap")).toBe(true);
    });

    it("returns false for new-roadmap route", () => {
      expect(shouldShowBottomNav("/new-roadmap")).toBe(false);
      expect(shouldShowBottomNav("/new-roadmap/step-1")).toBe(false);
    });

    it("returns false for learn routes", () => {
      expect(shouldShowBottomNav("/learn")).toBe(false);
      expect(shouldShowBottomNav("/learn/123")).toBe(false);
      expect(shouldShowBottomNav("/learn/mental-model-1")).toBe(false);
    });

    it("returns false for plan routes", () => {
      expect(shouldShowBottomNav("/plan")).toBe(false);
      expect(shouldShowBottomNav("/plan/123")).toBe(false);
      expect(shouldShowBottomNav("/plan/step-1")).toBe(false);
    });

    it("returns false for reflect routes", () => {
      expect(shouldShowBottomNav("/reflect")).toBe(false);
      expect(shouldShowBottomNav("/reflect/123")).toBe(false);
      expect(shouldShowBottomNav("/reflect/step-1")).toBe(false);
    });

    it("returns false for auth routes", () => {
      expect(shouldShowBottomNav("/login")).toBe(false);
      expect(shouldShowBottomNav("/login/callback")).toBe(false);
      expect(shouldShowBottomNav("/signup")).toBe(false);
      expect(shouldShowBottomNav("/signup/verify")).toBe(false);
    });

    it("handles nested routes correctly", () => {
      expect(shouldShowBottomNav("/toolkit/roadmaps")).toBe(true);
      expect(shouldShowBottomNav("/settings/profile")).toBe(true);
      expect(shouldShowBottomNav("/roadmap/123/view")).toBe(true);
    });
  });

  describe("getNavigationPadding", () => {
    it("returns padding class when nav should be shown", () => {
      expect(getNavigationPadding("/")).toBe("pb-20");
      expect(getNavigationPadding("/toolkit")).toBe("pb-20");
      expect(getNavigationPadding("/settings")).toBe("pb-20");
    });

    it("returns empty string when nav should be hidden", () => {
      expect(getNavigationPadding("/new-roadmap")).toBe("");
      expect(getNavigationPadding("/learn/123")).toBe("");
      expect(getNavigationPadding("/plan/123")).toBe("");
      expect(getNavigationPadding("/reflect/123")).toBe("");
      expect(getNavigationPadding("/login")).toBe("");
    });
  });
});
