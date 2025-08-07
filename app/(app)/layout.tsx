"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/features/shared/BottomNav";
import { shouldShowBottomNav, getNavigationPadding } from "@/lib/navigation/visibility";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = shouldShowBottomNav(pathname);
  const navPadding = getNavigationPadding(pathname);

  return (
    <>
      <main className={cn("min-h-screen", navPadding)}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}
