import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => "/settings"),
}));

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
            app_metadata: { provider: "email" },
          },
        },
      })),
      signOut: vi.fn(() => ({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: "test-user-id",
              email: "test@example.com",
              subscription_status: "free",
              reminder_enabled: true,
              reminder_time: "09:00",
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

// Mock user db module
vi.mock("@/lib/db/users", () => ({
  getUserInfo: vi.fn(() => ({
    id: "test-user-id",
    email: "test@example.com",
    subscription_status: "free",
    reminder_enabled: true,
    reminder_time: "09:00",
    created_at: "2024-01-01",
    notification_prefs: null,
    reminder_last_sent: null,
    reminder_timezone: null,
    stripe_customer_id: null,
    testimonial_state: null,
  })),
}));

// Import the component after mocks
const SettingsPage = async () => {
  const { default: Page } = await import("@/app/(app)/settings/page");
  return Page;
};

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings page header", async () => {
    const Page = await SettingsPage();
    const { container } = render(await Page());

    const header = container.querySelector("h1");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Settings");
  });

  it("displays account section with email", async () => {
    const Page = await SettingsPage();
    const { container } = render(await Page());

    // Check for Account section header
    const accountHeader = screen.getByText("ACCOUNT");
    expect(accountHeader).toBeInTheDocument();
    expect(accountHeader).toHaveClass("uppercase");

    // Check for email display
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("displays billing section with free tier badge", async () => {
    const Page = await SettingsPage();
    render(await Page());

    // Check for Billing section header
    const billingHeader = screen.getByText("BILLING");
    expect(billingHeader).toBeInTheDocument();

    // Check for plan badge
    const planBadge = screen.getByText("Free Tier");
    expect(planBadge).toBeInTheDocument();
  });

  it("displays premium badge for premium users", async () => {
    const { getUserInfo } = await import("@/lib/db/users");
    vi.mocked(getUserInfo).mockResolvedValueOnce({
      id: "test-user-id",
      email: "test@example.com",
      subscription_status: "premium",
      reminder_enabled: true,
      reminder_time: "09:00",
      created_at: "2024-01-01",
      notification_prefs: null,
      reminder_last_sent: null,
      reminder_timezone: null,
      stripe_customer_id: "cus_123",
      testimonial_state: null,
    });

    const Page = await SettingsPage();
    render(await Page());

    const premiumBadge = screen.getByText("Premium");
    expect(premiumBadge).toBeInTheDocument();
    expect(premiumBadge).toHaveClass("bg-gradient-to-r");
  });

  it("displays notifications section placeholder", async () => {
    const Page = await SettingsPage();
    render(await Page());

    // Check for Notifications section header
    const notificationsHeader = screen.getByText("NOTIFICATIONS");
    expect(notificationsHeader).toBeInTheDocument();

    // Check for placeholder text
    expect(screen.getByText("Notification settings coming soon")).toBeInTheDocument();
  });

  it("displays logout button", async () => {
    const Page = await SettingsPage();
    const { container } = render(await Page());

    const logoutButton = container.querySelector('button[type="submit"]');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent("Logout");
    expect(logoutButton).toHaveClass("border-[#E53E3E]");
  });

  it("displays Google indicator for Google users", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(() => ({
          data: {
            user: {
              id: "test-user-id",
              email: "test@example.com",
              app_metadata: { provider: "google" },
            },
          },
        })),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "test-user-id",
                email: "test@example.com",
                subscription_status: "free",
              },
              error: null,
            })),
          })),
        })),
      })),
    } as any);

    const Page = await SettingsPage();
    render(await Page());

    expect(screen.getByText("test@example.com (Google)")).toBeInTheDocument();
  });

  it("applies responsive styles", async () => {
    const Page = await SettingsPage();
    const { container } = render(await Page());

    const main = container.querySelector("main");
    expect(main).toHaveClass("max-w-[600px]", "mx-auto");
  });

  it("has proper section animations", async () => {
    const Page = await SettingsPage();
    const { container } = render(await Page());

    const sections = container.querySelectorAll("section");
    expect(sections[0]).toHaveClass("animate-fadeIn");
    expect(sections[1]).toHaveClass("animate-fadeIn", "animation-delay-100");
    expect(sections[2]).toHaveClass("animate-fadeIn", "animation-delay-200");
  });
});
