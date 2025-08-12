import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Login Component - Simplified Interface", () => {
  const mockSupabase = {
    auth: {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockSupabase as ReturnType<typeof createClient>);
  });

  describe("Social Login Elements", () => {
    it("should not render Google social login button", () => {
      render(<LoginPage />);

      const googleButton = screen.queryByText("Continue with Google");
      expect(googleButton).toBeNull();
    });

    it("should not render Apple social login button", () => {
      render(<LoginPage />);

      const appleButton = screen.queryByText("Continue with Apple");
      expect(appleButton).toBeNull();
    });

    it("should not render the 'or' divider section", () => {
      render(<LoginPage />);

      const orDivider = screen.queryByText("or");
      expect(orDivider).toBeNull();
    });
  });

  describe("Email Authentication Flow", () => {
    it("should render email login form without social options", () => {
      render(<LoginPage />);

      expect(screen.getByText("LattixIQ")).toBeInTheDocument();
      expect(screen.getByText("Think Better, Today")).toBeInTheDocument();
      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continue with Email" })).toBeInTheDocument();
    });

    it("should handle email submission correctly", async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const submitButton = screen.getByRole("button", { name: "Continue with Email" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
          email: "test@example.com",
          options: {
            shouldCreateUser: true,
          },
        });
      });
    });

    it("should transition to OTP verification after email submission", async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const submitButton = screen.getByRole("button", { name: "Continue with Email" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("We've sent a 6-digit code to")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });
    });

    it("should handle OTP verification correctly", async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ error: null });
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const submitButton = screen.getByRole("button", { name: "Continue with Email" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });

      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs).toHaveLength(6);

      // Fill in all 6 digits, which should enable the submit button
      otpInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: String(index + 1) } });
      });

      // The button text should be "Log In" when enabled
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Log In|Verifying/i })).toBeInTheDocument();
      });

      // Submit the form
      const form = screen.getByRole("button", { name: /Log In|Verifying/i }).closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSupabase.auth.verifyOtp).toHaveBeenCalled();
        expect(mockSupabase.auth.verifyOtp.mock.calls[0][0]).toMatchObject({
          email: "test@example.com",
          type: "email",
        });
      });
    });

    it("should display error messages when authentication fails", async () => {
      const errorMessage = "Invalid email address";
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const submitButton = screen.getByRole("button", { name: "Continue with Email" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe("Styling and Accessibility", () => {
    it("should maintain proper layout and accessibility", () => {
      const { container } = render(<LoginPage />);

      const loginContainer = container.querySelector(".bg-white");
      expect(loginContainer).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText("your@email.com");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("required");

      const submitButton = screen.getByRole("button", { name: "Continue with Email" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should have proper focus states and transitions", () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("your@email.com");

      expect(emailInput).toHaveClass("transition-all", "duration-300");

      fireEvent.focus(emailInput);
      expect(emailInput).toHaveClass("focus:bg-white", "focus:border-[#4299E1]");
    });
  });

  describe("Code Preservation", () => {
    it("should still have handleSocialLogin function defined but not used", () => {
      render(<LoginPage />);

      const googleButton = screen.queryByRole("button", { name: /google/i });
      const appleButton = screen.queryByRole("button", { name: /apple/i });

      expect(googleButton).toBeNull();
      expect(appleButton).toBeNull();

      expect(mockSupabase.auth.signInWithOAuth).not.toHaveBeenCalled();
    });
  });
});
