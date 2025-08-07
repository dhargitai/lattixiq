/**
 * Navigation visibility helper
 * Determines if bottom navigation should be shown based on current route
 */

export function shouldShowBottomNav(pathname: string): boolean {
  // Routes where navigation should be hidden
  const hiddenRoutes = ["/new-roadmap", "/learn", "/plan", "/reflect"];

  // Check if current path starts with any hidden route
  const isHidden = hiddenRoutes.some((route) => pathname.startsWith(route));

  // Also hide on auth routes
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  return !isHidden && !isAuthRoute;
}

/**
 * Get navigation padding for layouts when bottom nav is visible
 */
export function getNavigationPadding(pathname: string): string {
  return shouldShowBottomNav(pathname) ? "pb-20" : "";
}
