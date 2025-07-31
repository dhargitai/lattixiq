import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  // --- Happy Path ---
  it("should merge class names correctly", () => {
    const result = cn("px-4", "py-2", "bg-blue-500");
    expect(result).toBe("px-4 py-2 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should merge conflicting Tailwind classes correctly", () => {
    const result = cn("px-2 px-4", "py-1 py-3");
    expect(result).toBe("px-4 py-3");
  });

  // --- Unhappy Paths ---
  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle null and undefined values", () => {
    const result = cn("valid-class", null, undefined, "another-class");
    expect(result).toBe("valid-class another-class");
  });

  it("should handle falsy values", () => {
    const showHidden = false;
    const count = 0;
    const emptyString = "";
    const result = cn("base", showHidden && "hidden", count && "zero", emptyString && "empty");
    expect(result).toBe("base");
  });
});
