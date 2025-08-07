"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardVisibility } from "@/lib/hooks/useKeyboardVisibility";

type BottomNavProps = React.HTMLAttributes<HTMLElement>;

const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(({ className, ...props }, ref) => {
  const pathname = usePathname();
  const isKeyboardVisible = useKeyboardVisibility();

  const navItems = [
    {
      href: "/toolkit",
      label: "My Toolkit",
      icon: Home,
      isActive: pathname === "/toolkit" || pathname.startsWith("/toolkit/"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ];

  return (
    <nav
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "shadow-[0_-2px_10px_rgba(0,0,0,0.04)]",
        "safe-area-bottom",
        "transition-transform duration-300 ease-out",
        isKeyboardVisible && "translate-y-full",
        className
      )}
      aria-hidden={isKeyboardVisible}
      {...props}
    >
      <div className="flex justify-around py-2 md:max-w-2xl md:mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-6 py-2 transition-all duration-200 relative group",
                "text-muted-foreground hover:text-primary",
                item.isActive && "text-primary"
              )}
            >
              {item.isActive && (
                <div
                  className={cn(
                    "absolute -top-[10px] left-1/2 -translate-x-1/2",
                    "w-8 h-[3px] bg-primary rounded-b-sm",
                    "transition-all duration-300 ease-out"
                  )}
                />
              )}
              <Icon className="h-6 w-6 mb-1 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
BottomNav.displayName = "BottomNav";

export { BottomNav };
export default BottomNav;
