import { vi } from "vitest";

/**
 * Mock data store for tracking operations and returning data
 */
interface MockDataStore {
  [table: string]: {
    data: unknown[];
    operations: Array<{
      type: "select" | "update" | "insert" | "delete";
      filters: Record<string, unknown>;
      data?: unknown;
    }>;
  };
}

/**
 * Creates a proper Supabase mock that handles chained method calls
 */
export function createSupabaseMock() {
  const dataStore: MockDataStore = {};

  // Track operation chains
  let currentTable: string | null = null;
  let currentOperation: "select" | "update" | "insert" | "delete" | null = null;
  let currentFilters: Record<string, unknown> = {};
  let currentData: unknown = null;
  let currentOptions: Record<string, unknown> = {};

  // Helper to reset current operation state
  const resetOperation = () => {
    currentTable = null;
    currentOperation = null;
    currentFilters = {};
    currentData = null;
    currentOptions = {};
  };

  // Create chainable query builder
  const createQueryBuilder = () => {
    const builder = {
      select: vi.fn((columns?: string) => {
        currentOperation = "select";
        currentOptions.columns = columns;
        return builder;
      }),

      update: vi.fn((data: unknown) => {
        currentOperation = "update";
        currentData = data;
        return builder;
      }),

      insert: vi.fn((data: unknown) => {
        currentOperation = "insert";
        currentData = data;
        return builder;
      }),

      delete: vi.fn(() => {
        currentOperation = "delete";
        return builder;
      }),

      eq: vi.fn((column: string, value: unknown) => {
        currentFilters[column] = value;
        return builder;
      }),

      neq: vi.fn((column: string, value: unknown) => {
        currentFilters[`${column}_neq`] = value;
        return builder;
      }),

      gt: vi.fn((column: string, value: unknown) => {
        currentFilters[`${column}_gt`] = value;
        return builder;
      }),

      gte: vi.fn((column: string, value: unknown) => {
        currentFilters[`${column}_gte`] = value;
        return builder;
      }),

      lt: vi.fn((column: string, value: unknown) => {
        currentFilters[`${column}_lt`] = value;
        return builder;
      }),

      lte: vi.fn((column: string, value: unknown) => {
        currentFilters[`${column}_lte`] = value;
        return builder;
      }),

      order: vi.fn((column: string, options?: { ascending?: boolean }) => {
        currentOptions.order = { column, ascending: options?.ascending ?? true };
        return builder;
      }),

      limit: vi.fn((count: number) => {
        currentOptions.limit = count;
        return builder;
      }),

      single: vi.fn(() => {
        currentOptions.single = true;
        return builder;
      }),

      // Terminal methods that return promises
      then: vi.fn((resolve: (value: unknown) => void, reject?: (error: unknown) => void) => {
        const result = executeOperation();
        resetOperation();

        if (result.error && reject) {
          return reject(result.error);
        }
        return resolve(result);
      }),

      // Allow await directly on builder
      [Symbol.toStringTag]: "Promise",
    };

    // Make the builder a thenable for async/await support
    Object.defineProperty(builder, "constructor", {
      value: Promise,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    return builder;
  };

  // Execute the built operation
  const executeOperation = () => {
    if (!currentTable || !currentOperation) {
      return { data: null, error: new Error("No operation specified") };
    }

    // Initialize table if not exists
    if (!dataStore[currentTable]) {
      dataStore[currentTable] = { data: [], operations: [] };
    }

    // Record the operation
    dataStore[currentTable].operations.push({
      type: currentOperation,
      filters: { ...currentFilters },
      data: currentData ? { ...currentData } : undefined,
    });

    // Return mock response based on operation type
    switch (currentOperation) {
      case "select":
        return { data: currentOptions.single ? {} : [], error: null };
      case "update":
      case "insert":
      case "delete":
        return { data: null, error: null };
      default:
        return { data: null, error: new Error("Unknown operation") };
    }
  };

  // Create the main mock object
  const mock = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },

    from: vi.fn((table: string) => {
      currentTable = table;
      return createQueryBuilder();
    }),

    rpc: vi.fn((functionName: string, params?: Record<string, unknown>) => {
      // Handle the complete_step_and_unlock_next RPC function
      if (functionName === "complete_step_and_unlock_next") {
        return Promise.resolve({
          data: {
            completed_step_id: params?.p_step_id || "step-1",
            unlocked_step_id: "step-2",
            all_steps_completed: false,
            roadmap_completed: false,
          },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),

    // Helper methods for testing
    __getOperations: (table: string) => dataStore[table]?.operations || [],
    __setMockData: (table: string, data: unknown[]) => {
      if (!dataStore[table]) {
        dataStore[table] = { data: [], operations: [] };
      }
      dataStore[table].data = data;
    },
    __setMockError: (_table: string, _operation: string, _error: unknown) => {
      // This can be extended to return specific errors for specific operations
    },
    __reset: () => {
      Object.keys(dataStore).forEach((key) => delete dataStore[key]);
      resetOperation();
    },
  };

  return mock;
}

/**
 * Create a mock that returns specific data for queries
 */
export function createSupabaseMockWithData(mockData: Record<string, unknown>) {
  const mock = createSupabaseMock();

  // Override the from method to return specific data
  const originalFrom = mock.from;
  mock.from = vi.fn((table: string) => {
    const builder = originalFrom(table);

    // Override the then method to return mock data
    const originalThen = builder.then;
    builder.then = vi.fn((resolve: (value: unknown) => void, reject?: (error: unknown) => void) => {
      const mockResponse = mockData[table] as { data?: { steps?: unknown[] } };
      if (mockResponse) {
        // Ensure roadmaps always have steps property for Roadmap type compatibility
        if (table === "roadmaps" && mockResponse.data && !mockResponse.data.steps) {
          mockResponse.data.steps = [];
        }
        return resolve(mockResponse);
      }
      return originalThen(resolve as (value: unknown) => void, reject);
    });

    return builder;
  });

  return mock;
}

/**
 * Create a mock for testing specific scenarios
 */
export function createSupabaseMockScenario(scenario: "success" | "error" | "race-condition") {
  const mock = createSupabaseMock();

  switch (scenario) {
    case "success":
      // Default behavior is success
      break;

    case "error":
      mock.from = vi.fn(() => {
        const builder = {
          select: vi.fn(() => builder),
          update: vi.fn(() => builder),
          insert: vi.fn(() => builder),
          delete: vi.fn(() => builder),
          eq: vi.fn(() => builder),
          neq: vi.fn(() => builder),
          gt: vi.fn(() => builder),
          gte: vi.fn(() => builder),
          lt: vi.fn(() => builder),
          lte: vi.fn(() => builder),
          order: vi.fn(() => builder),
          limit: vi.fn(() => builder),
          single: vi.fn(() => builder),
          then: vi.fn((resolve: (value: unknown) => void) => {
            resolve({ data: null, error: new Error("Database error") });
          }),
          [Symbol.toStringTag]: "Promise" as const,
        };
        return builder;
      });
      break;

    case "race-condition":
      // Simulate delays for race condition testing
      let callCount = 0;
      const originalFrom = mock.from;
      mock.from = vi.fn((table: string) => {
        const builder = originalFrom(table);
        const originalThen = builder.then;
        builder.then = vi.fn(
          (resolve: (value: unknown) => void, reject?: (error: unknown) => void) => {
            callCount++;
            // First call (mark complete) is fast, second call (unlock) is slow
            const delay = callCount === 1 ? 10 : 100;
            setTimeout(() => originalThen(resolve as (value: unknown) => void, reject), delay);
          }
        );
        return builder;
      });
      break;
  }

  return mock;
}
