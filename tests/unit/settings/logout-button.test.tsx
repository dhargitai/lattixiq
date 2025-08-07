import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "@/components/settings/LogoutButton";
import { vi, describe, it, beforeEach, expect, type MockedFunction } from "vitest";

// Simple mock setup
global.fetch = vi.fn() as MockedFunction<typeof fetch>;

// Mock window APIs
Object.defineProperty(window, "localStorage", {
  value: {
    clear: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
});

Object.defineProperty(window, "sessionStorage", {
  value: {
    clear: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
});

Object.defineProperty(window, "caches", {
  value: {
    keys: vi.fn(),
    delete: vi.fn(),
  },
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock sonner - use a simple mock
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as MockedFunction<typeof fetch>).mockClear();
    (window.localStorage.clear as MockedFunction<typeof window.localStorage.clear>).mockClear();
    (window.sessionStorage.clear as MockedFunction<typeof window.sessionStorage.clear>).mockClear();
    (window.caches.keys as MockedFunction<typeof window.caches.keys>).mockClear();
    (window.caches.delete as MockedFunction<typeof window.caches.delete>).mockClear();
  });

  it("should render logout button with correct styling", () => {
    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-white", "text-[#E53E3E]", "border-2", "border-[#E53E3E]");
  });

  it("should open confirmation dialog when logout button is clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(screen.getByText("Are you sure you want to logout?")).toBeInTheDocument();
  });

  it("should close dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByText("Logout"));
    expect(screen.getByText("Are you sure you want to logout?")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByText("Are you sure you want to logout?")).not.toBeInTheDocument();
    });
  });

  it("should have confirm button in dialog", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByText("Logout"));

    const confirmButtons = screen.getAllByText("Logout");
    expect(confirmButtons).toHaveLength(2); // One trigger button, one confirm button
  });
});
