"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface BottomNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}

const BottomNavigation = React.forwardRef<HTMLDivElement, BottomNavigationProps>(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center justify-around px-4">
        {items.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onItemClick?.(item);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 min-w-[64px] rounded-md transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "text-primary"
              )}
            >
              <div className={cn("transition-all duration-200", isActive && "scale-110")}>
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  )
);
BottomNavigation.displayName = "BottomNavigation";

export { BottomNavigation, type NavItem };
