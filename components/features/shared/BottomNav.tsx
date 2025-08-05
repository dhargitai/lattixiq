"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/toolkit",
      label: "My Toolkit",
      icon: Home,
      isActive: pathname === "/toolkit",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-6 py-2 transition-colors relative",
                "hover:text-primary",
                item.isActive && "text-primary"
              )}
            >
              {item.isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-sm" />
              )}
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
