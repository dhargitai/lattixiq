import { beforeAll, beforeEach, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Console output management
interface ConsoleCapture {
  log: unknown[][];
  warn: unknown[][];
  error: unknown[][];
}

let originalConsole: {
  log: typeof console.log;
  warn: typeof console.warn;
  error: typeof console.error;
};

let capturedOutput: ConsoleCapture;

// Setup console capturing before each test
beforeEach(() => {
  // Store original console methods
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  // Initialize capture arrays
  capturedOutput = {
    log: [],
    warn: [],
    error: [],
  };

  // Spy on console methods to capture output without displaying it
  console.log = vi.fn((...args) => {
    capturedOutput.log.push(args);
  });

  console.warn = vi.fn((...args) => {
    capturedOutput.warn.push(args);
  });

  console.error = vi.fn((...args) => {
    capturedOutput.error.push(args);
  });
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach((context) => {
  cleanup();

  // If test failed, output captured console messages for debugging
  const testFailed = context.task?.result?.state === "fail";

  if (testFailed && capturedOutput) {
    // Restore original console temporarily to output debug info
    const tempConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Output captured messages
    if (capturedOutput.error.length > 0) {
      console.error("\n=== Captured Error Output ===");
      capturedOutput.error.forEach((args) => console.error(...args));
    }

    if (capturedOutput.warn.length > 0) {
      console.warn("\n=== Captured Warning Output ===");
      capturedOutput.warn.forEach((args) => console.warn(...args));
    }

    if (capturedOutput.log.length > 0 && process.env.VERBOSE_TEST_LOGS) {
      console.log("\n=== Captured Log Output ===");
      capturedOutput.log.forEach((args) => console.log(...args));
    }

    // Restore the spies
    console.log = tempConsole.log;
    console.warn = tempConsole.warn;
    console.error = tempConsole.error;
  }

  // Restore original console methods
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Mock Next.js router and browser APIs
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Clean up environment variables after all tests
afterAll(() => {
  // Clean up any test-specific environment variables
  delete process.env.INTEGRATION_TEST;
});

// Export helper for tests that need to verify console output
export function getCapturedConsoleOutput(): ConsoleCapture {
  return capturedOutput;
}

// Helper to temporarily restore console for specific tests
export function withOriginalConsole(callback: () => void) {
  const temp = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;

  try {
    callback();
  } finally {
    console.log = temp.log;
    console.warn = temp.warn;
    console.error = temp.error;
  }
}
