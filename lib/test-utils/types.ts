/**
 * Type-safe testing utilities and mock types
 *
 * Provides proper TypeScript types for common testing scenarios
 * without resorting to 'as any' or disabling linting rules.
 */

import type { NextRouter } from "next/router";
import type { Database } from "@/lib/supabase/database.types";

// Mock router type for Next.js tests
export interface MockNextRouter extends Partial<NextRouter> {
  push: (url: string) => Promise<boolean>;
  replace: (url: string) => Promise<boolean>;
  reload: () => void;
  back: () => void;
  forward: () => void;
  prefetch: (url: string) => Promise<void>;
  pathname: string;
  query: Record<string, string | string[] | undefined>;
  asPath: string;
  isFallback: boolean;
  isReady: boolean;
  isPreview: boolean;
  basePath: string;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
  domainLocales?: Array<{
    domain: string;
    defaultLocale: string;
    http?: true;
  }>;
}

// Mock Supabase client type
export interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<{
      data: { user: Database["public"]["Tables"]["users"]["Row"] | null };
      error: Error | null;
    }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: {
        user: Database["public"]["Tables"]["users"]["Row"] | null;
        session: Record<string, unknown>;
      };
      error: Error | null;
    }>;
    signOut: () => Promise<{ error: Error | null }>;
  };
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown[] | null; error: Error | null }>;
    insert: (
      values: Record<string, unknown>
    ) => Promise<{ data: unknown[] | null; error: Error | null }>;
    update: (
      values: Record<string, unknown>
    ) => Promise<{ data: unknown[] | null; error: Error | null }>;
    delete: () => Promise<{ data: unknown[] | null; error: Error | null }>;
  };
  rpc: (
    functionName: string,
    params?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: Error | null }>;
}

// Factory functions for creating mocks
export function createMockRouter(overrides?: Partial<MockNextRouter>): MockNextRouter {
  return {
    push: async () => true,
    replace: async () => true,
    reload: () => {},
    back: () => {},
    forward: () => {},
    prefetch: async () => {},
    pathname: "/",
    query: {},
    asPath: "/",
    isFallback: false,
    isReady: true,
    isPreview: false,
    basePath: "",
    ...overrides,
  };
}

export function createMockSupabaseClient(
  overrides?: Partial<MockSupabaseClient>
): MockSupabaseClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: {} }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: async () => ({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
    rpc: async () => ({ data: null, error: null }),
    ...overrides,
  };
}

// Type helpers for testing
export type MockFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => ReturnType<T>;

export type MockedModule<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? MockFunction<T[K]> : T[K];
};

// Example usage:
// const mockRouter = createMockRouter({ pathname: '/test' })
// const mockSupabase = createMockSupabaseClient({
//   auth: {
//     getUser: async () => ({
//       data: { user: mockUser },
//       error: null
//     })
//   }
// })
