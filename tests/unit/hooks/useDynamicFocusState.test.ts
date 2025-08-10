import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDynamicFocusState } from "@/lib/hooks/useDynamicFocusState";

describe("useDynamicFocusState", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    expect(result.current.characterCount).toBe(0);
    expect(result.current.focusColorClasses).toBe("focus:border-blue-500 focus:ring-blue-200");
    expect(result.current.displayText).toBe("0 / 50 minimum");
    expect(result.current.isAboveThreshold).toBe(false);
  });

  it("should use custom threshold", () => {
    const { result } = renderHook(() => useDynamicFocusState({ threshold: 100 }));

    expect(result.current.displayText).toBe("0 / 100 minimum");
  });

  it("should update character count when text changes", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    act(() => {
      result.current.updateCharacterCount("Hello world!");
    });

    expect(result.current.characterCount).toBe(12);
    expect(result.current.displayText).toBe("12 / 50 minimum");
    expect(result.current.isAboveThreshold).toBe(false);
  });

  it("should show blue focus state when under threshold", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    act(() => {
      result.current.updateCharacterCount("Short text");
    });

    expect(result.current.focusColorClasses).toBe("focus:border-blue-500 focus:ring-blue-200");
    expect(result.current.isAboveThreshold).toBe(false);
  });

  it("should show green focus state when at threshold", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    // This string is exactly 50 characters
    const fiftyCharString = "12345678901234567890123456789012345678901234567890";
    act(() => {
      result.current.updateCharacterCount(fiftyCharString);
    });

    expect(result.current.characterCount).toBe(50);
    expect(result.current.focusColorClasses).toBe("focus:border-green-500 focus:ring-green-200");
    expect(result.current.displayText).toBe("50 characters");
    expect(result.current.isAboveThreshold).toBe(true);
  });

  it("should show green focus state when above threshold", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    // This string is exactly 84 characters
    const eightyFourCharString =
      "123456789012345678901234567890123456789012345678901234567890123456789012345678901234";
    act(() => {
      result.current.updateCharacterCount(eightyFourCharString);
    });

    expect(result.current.characterCount).toBe(84);
    expect(result.current.focusColorClasses).toBe("focus:border-green-500 focus:ring-green-200");
    expect(result.current.displayText).toBe("84 characters");
    expect(result.current.isAboveThreshold).toBe(true);
  });

  it("should handle empty string", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    act(() => {
      result.current.updateCharacterCount("Some text");
    });

    act(() => {
      result.current.updateCharacterCount("");
    });

    expect(result.current.characterCount).toBe(0);
    expect(result.current.focusColorClasses).toBe("focus:border-blue-500 focus:ring-blue-200");
    expect(result.current.displayText).toBe("0 / 50 minimum");
  });

  it("should transition correctly at boundary conditions", () => {
    const { result } = renderHook(() => useDynamicFocusState());

    // Test at 49 characters (below threshold)
    const fortyNineCharString = "1234567890123456789012345678901234567890123456789";
    act(() => {
      result.current.updateCharacterCount(fortyNineCharString);
    });

    expect(result.current.characterCount).toBe(49);
    expect(result.current.focusColorClasses).toBe("focus:border-blue-500 focus:ring-blue-200");
    expect(result.current.displayText).toBe("49 / 50 minimum");
    expect(result.current.isAboveThreshold).toBe(false);

    // Test at 51 characters (above threshold)
    const fiftyOneCharString = "123456789012345678901234567890123456789012345678901";
    act(() => {
      result.current.updateCharacterCount(fiftyOneCharString);
    });

    expect(result.current.characterCount).toBe(51);
    expect(result.current.focusColorClasses).toBe("focus:border-green-500 focus:ring-green-200");
    expect(result.current.displayText).toBe("51 characters");
    expect(result.current.isAboveThreshold).toBe(true);
  });

  it("should work with custom threshold values", () => {
    const { result } = renderHook(() => useDynamicFocusState({ threshold: 25 }));

    act(() => {
      result.current.updateCharacterCount("This is thirty characters long");
    });

    expect(result.current.characterCount).toBe(30);
    expect(result.current.focusColorClasses).toBe("focus:border-green-500 focus:ring-green-200");
    expect(result.current.displayText).toBe("30 characters");
    expect(result.current.isAboveThreshold).toBe(true);
  });
});
