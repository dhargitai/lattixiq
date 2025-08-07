import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase is not configured (e.g., during build)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // During build or when Supabase is not configured, allow all requests
    return NextResponse.next();
  }

  // Dynamically import Supabase SSR to avoid Edge Runtime issues
  const { createServerClient } = await import("@supabase/ssr");

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is accessing protected routes
  if (request.nextUrl.pathname.startsWith("/(app)") && !user) {
    // No user, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check if authenticated user is accessing auth routes
  if (request.nextUrl.pathname.startsWith("/(auth)") && user) {
    // User is logged in, redirect to main app
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Auto-redirect new users (with 0 roadmaps) to /new-roadmap
  if (user) {
    const currentPath = request.nextUrl.pathname;
    // Skip redirect for /new-roadmap and auth routes
    const isNewRoadmapRoute =
      currentPath === "/new-roadmap" || currentPath.startsWith("/(app)/new-roadmap");
    const isAuthRoute = currentPath.startsWith("/(auth)") || currentPath.startsWith("/auth");
    const isApiRoute = currentPath.startsWith("/api");

    if (!isNewRoadmapRoute && !isAuthRoute && !isApiRoute) {
      try {
        const { count } = await supabase
          .from("roadmaps")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const roadmapCount = count || 0;

        // Redirect users with 0 roadmaps to /new-roadmap
        if (roadmapCount === 0) {
          const url = request.nextUrl.clone();
          url.pathname = "/new-roadmap";
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("Error counting user roadmaps:", error);
        // Continue without redirect on error
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
