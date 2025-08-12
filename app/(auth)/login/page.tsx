"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/ui/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
        startResendTimer();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const otpString = otp.join("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: "email",
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newOtp.every((digit) => digit)) {
      const form = document.getElementById("otp-form") as HTMLFormElement;
      form?.requestSubmit();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("");

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6 && /^\d$/.test(digit)) {
        newOtp[i] = digit;
      }
    });

    setOtp(newOtp);

    // Focus next empty or last input
    const nextEmpty = newOtp.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    const input = document.getElementById(`otp-${focusIndex}`);
    input?.focus();
  };

  const startResendTimer = () => {
    setResendCountdown(30);
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        firstInput?.focus();
      }
    } catch {
      setError("Failed to resend code");
    }
  };

  // SOCIAL_LOGIN_TEMPORARILY_DISABLED - Start
  // Preserving social login functionality for potential future re-enabling
  // Story 4.1: Simplified Login Interface - Focus on email-only authentication for MVP
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSocialLogin = async (provider: "google" | "apple") => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "apple" ? "apple" : "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Failed to connect with provider");
    }
  };
  // SOCIAL_LOGIN_TEMPORARILY_DISABLED - End

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7FAFC] to-[#EDF2F7] p-5 overflow-x-hidden">
      <div className="relative w-full max-w-[420px]">
        {/* Decorative background element */}
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative bg-white rounded-[20px] p-12 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          {/* Logo and branding */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Mark className="w-14 h-14 fill-[#6d3a9c] animate-pulse" />
            </div>
            <h1 className="text-[32px] font-bold text-[#1A202C] mb-2 tracking-tight">LattixIQ</h1>
            <p className="text-lg text-[#718096]">Think Better, Today</p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === "email" ? (
            <div>
              {/* SOCIAL_LOGIN_TEMPORARILY_DISABLED - Start */}
              {/* Social login buttons - Temporarily disabled for MVP (Story 4.1) */}
              {/* 
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => handleSocialLogin("google")}
                  className={cn(
                    "w-full py-3.5 px-5 border-2 border-[#E2E8F0] rounded-xl",
                    "font-medium bg-white text-[#2D3748]",
                    "flex items-center justify-center gap-3",
                    "transition-all duration-300",
                    "hover:border-[#CBD5E0] hover:shadow-md hover:-translate-y-0.5",
                    "active:translate-y-0 active:shadow-sm"
                  )}
                >
                  <span className="text-xl">G</span>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSocialLogin("apple")}
                  className={cn(
                    "w-full py-3.5 px-5 border-2 border-[#E2E8F0] rounded-xl",
                    "font-medium bg-white text-[#2D3748]",
                    "flex items-center justify-center gap-3",
                    "transition-all duration-300",
                    "hover:border-[#CBD5E0] hover:shadow-md hover:-translate-y-0.5",
                    "active:translate-y-0 active:shadow-sm"
                  )}
                >
                  <span className="text-xl">🍎</span>
                  <span>Continue with Apple</span>
                </button>
              </div>
              */}

              {/* Divider - Temporarily disabled with social login */}
              {/*
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />
                <span className="text-sm font-medium text-[#A0AEC0]">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />
              </div>
              */}
              {/* SOCIAL_LOGIN_TEMPORARILY_DISABLED - End */}

              {/* Email form */}
              <form onSubmit={handleSendOTP}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#4A5568] mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className={cn(
                      "w-full px-4 py-3 text-base",
                      "border-2 border-[#E2E8F0] rounded-[10px]",
                      "bg-[#FAFBFC] transition-all duration-300",
                      "placeholder:text-[#A0AEC0]",
                      "focus:bg-white focus:border-[#4299E1]",
                      "focus:shadow-[0_0_0_3px_rgba(66,153,225,0.1)]",
                      "disabled:opacity-50"
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className={cn(
                    "w-full py-3.5 text-base font-semibold",
                    "bg-gradient-to-r from-[#4299E1] to-[#3182CE]",
                    "hover:shadow-[0_6px_20px_rgba(66,153,225,0.4)]",
                    "hover:-translate-y-0.5 active:translate-y-0",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "disabled:hover:shadow-none disabled:hover:translate-y-0"
                  )}
                >
                  {loading ? "Sending code..." : "Continue with Email"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
              <p className="text-center text-[#4A5568] mb-2">We&apos;ve sent a 6-digit code to</p>
              <p className="text-center font-semibold text-[#2D3748] mb-2">{email}</p>
              <button
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                  setError(null);
                }}
                className="block mx-auto text-sm text-[#4299E1] hover:text-[#3182CE] hover:underline transition-colors mb-8"
              >
                (Change email)
              </button>

              <form id="otp-form" onSubmit={handleVerifyOTP}>
                <div className="flex justify-center gap-2 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      disabled={loading}
                      className={cn(
                        "w-12 h-14 text-2xl font-semibold text-center",
                        "border-2 border-[#E2E8F0] rounded-[10px]",
                        "bg-[#FAFBFC] transition-all duration-300",
                        "focus:bg-white focus:border-[#4299E1]",
                        "focus:shadow-[0_0_0_3px_rgba(66,153,225,0.1)]",
                        "focus:scale-105",
                        digit && "border-[#48BB78] bg-[#F0FFF4]",
                        "disabled:opacity-50"
                      )}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0}
                  className={cn(
                    "block mx-auto mb-6 text-sm font-medium",
                    resendCountdown > 0
                      ? "text-[#A0AEC0] cursor-not-allowed"
                      : "text-[#4299E1] hover:text-[#3182CE] hover:underline cursor-pointer"
                  )}
                >
                  {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : "Resend code"}
                </button>

                <Button
                  type="submit"
                  disabled={loading || otp.some((d) => !d)}
                  className={cn(
                    "w-full py-3.5 text-base font-semibold",
                    "bg-gradient-to-r from-[#4299E1] to-[#3182CE]",
                    "hover:shadow-[0_6px_20px_rgba(66,153,225,0.4)]",
                    "hover:-translate-y-0.5 active:translate-y-0",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "disabled:hover:shadow-none disabled:hover:translate-y-0"
                  )}
                >
                  {loading ? "Verifying..." : "Log In"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
