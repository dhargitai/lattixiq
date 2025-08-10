import { describe, it, expect, vi, beforeEach } from "vitest";
import { redirect } from "next/navigation";
import Home from "@/app/page";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Homepage Redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Happy path
  it("should redirect to /toolkit immediately", () => {
    // Call the Home component function
    Home();

    // Verify redirect was called with correct path
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/toolkit");
  });

  // Edge cases
  it("should not create redirect loops", () => {
    // The redirect happens once per render
    Home();

    // Even if called multiple times, it should only redirect once per call
    expect(redirect).toHaveBeenCalledTimes(1);

    // Call again to simulate another render
    Home();

    // Should be called twice total (once per render)
    expect(redirect).toHaveBeenCalledTimes(2);

    // But always to the same location
    expect(redirect).toHaveBeenNthCalledWith(1, "/toolkit");
    expect(redirect).toHaveBeenNthCalledWith(2, "/toolkit");
  });

  it("should handle server-side rendering correctly", () => {
    // The redirect function should work in SSR context
    // This is implicitly tested by the fact that redirect() is called
    // without any client-side checks
    Home();

    expect(redirect).toHaveBeenCalled();
  });

  it("should not render any content before redirecting", () => {
    // The Home component should not return any JSX
    // It should only call redirect
    const result = Home();

    // redirect() doesn't return a value in the actual implementation
    // but throws internally to stop execution
    expect(result).toBeUndefined();
    expect(redirect).toHaveBeenCalled();
  });
});
