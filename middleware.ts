// Auth middleware placeholder - to be implemented in authentication story
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Placeholder - auth logic will be implemented in authentication story
  return NextResponse.next();
}

export const config = {
  matcher: ["/(app)/:path*"],
};
