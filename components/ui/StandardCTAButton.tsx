"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface StandardCTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const StandardCTAButton = React.forwardRef<HTMLButtonElement, StandardCTAButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Base styles for all variants
      "font-semibold rounded-xl transition-all duration-300",
      "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
      "inline-flex items-center justify-center gap-2",
      // Full width option
      fullWidth && "w-full",
      // Size variants
      {
        "px-6 py-3 text-sm": size === "sm",
        "px-10 py-6 text-lg": size === "md",
        "px-12 py-7 text-xl": size === "lg",
      },
      // Color variants
      variant === "primary" && [
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
        "hover:from-blue-600 hover:to-blue-700",
        "shadow-blue-500/25 hover:shadow-blue-500/30",
      ],
      variant === "secondary" && [
        "bg-gradient-to-r from-green-500 to-green-600 text-white",
        "hover:from-green-600 hover:to-green-700",
        "shadow-green-500/25 hover:shadow-green-500/30",
      ]
    );

    return (
      <Button
        className={cn(baseStyles, className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!loading && icon && icon}
        {children}
      </Button>
    );
  }
);

StandardCTAButton.displayName = "StandardCTAButton";

export { StandardCTAButton };
