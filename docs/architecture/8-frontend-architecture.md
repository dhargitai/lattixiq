# **8. Frontend Architecture**

This section provides the detailed technical guide for all frontend development. Adherence to these patterns is crucial for creating a maintainable, scalable, and consistent user interface.

## **Component Architecture**

- **Component Organization:** We will follow a tiered structure within the `/components` directory to ensure a clear separation of concerns.
    
    ```
    /components
    ├── /ui         # Raw, unstyled components from shadcn/ui (Button, Input, etc.)
    ├── /shared     # Application-specific, reusable components built from /ui components
    |   ├── RoadmapCard.tsx
    |   └── SiteHeader.tsx
    └── /features   # Components specific to a single feature or route
        ├── /settings
        |   └── NotificationToggles.tsx
        └── /roadmap
            └── Step.tsx
    ```
    
- **Component Template:** All new React components must follow this standard template for consistency.
    
    ```tsx
    // /features/roadmap/components/Step.tsx
    
    import * as React from 'react';
    import { cn } from '@/lib/utils'; // For combining Tailwind classes
    import { Button } from '@/components/ui/button';
    
    // 1. Define component props with TypeScript
    interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
      stepNumber: number;
      title: string;
      status: 'locked' | 'unlocked' | 'completed';
    }
    
    // 2. Use React.forwardRef to allow for passing refs
    const Step = React.forwardRef<HTMLDivElement, StepProps>(
      ({ className, stepNumber, title, status, ...props }, ref) => {
    
        // 3. Component logic here
        const isLocked = status === 'locked';
    
        // 4. Return JSX
        return (
          <div
            className={cn(
              'flex items-center p-4 rounded-lg border',
              isLocked ? 'bg-muted text-muted-foreground' : 'bg-card',
              className
            )}
            ref={ref}
            {...props}
          >
            {/* Component content */}
            <p>{title}</p>
          </div>
        );
      }
    );
    Step.displayName = 'Step';
    
    export { Step };
    ```
    

## **State Management Architecture**

Our philosophy is to keep client-side state minimal. We will use a hierarchical approach:

1. **URL State:** Use Next.js `useSearchParams` for state that should be bookmarkable (e.g., filters).
2. **Local Component State:** Use `useState` and `useReducer` for state that is not shared.
3. **Global State (Zustand):** Use Zustand for complex global state that needs to be shared across many components, such as the user's profile or the active roadmap data.
- **Zustand Store Structure:** Stores will be created in `/lib/stores` and organized by domain.
    
    ```tsx
    // /lib/stores/user-store.ts
    import { create } from 'zustand';
    import { User } from '@/lib/types'; // Assuming shared types
    
    interface UserState {
      user: User | null;
      setUser: (user: User | null) => void;
      isLoading: boolean;
    }
    
    export const useUserStore = create<UserState>((set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
    }));
    ```
    

## **Routing Architecture**

- **Route Organization:** We will use the Next.js App Router with route groups to organize routes without affecting the URL path.
    - `/(app)`: Contains all protected routes that are part of the main application experience (e.g., `/`, `/toolkit`).
    - `/(auth)`: Contains authentication routes like `/login`.
- **Protected Route Pattern:** Route protection will be handled by a single `middleware.ts` file at the root of the project. This middleware will check for a valid Supabase session and redirect unauthenticated users to the login page.
    
    ```tsx
    // /middleware.ts
    import { createServerClient } from '@supabase/ssr';
    import { NextResponse, type NextRequest } from 'next/server';
    
    export async function middleware(request: NextRequest) {
      // Logic to refresh session cookies
      // ... Supabase middleware boilerplate ...
    
      const { data: { session } } = await supabase.auth.getSession();
    
      // If user is not logged in and is trying to access a protected route
      if (!session && request.nextUrl.pathname.startsWith('/')) {
        // Assuming (app) routes are at root, adjust if needed
        return NextResponse.redirect(new URL('/login', request.url));
      }
    
      return response;
    }
    
    export const config = {
      matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         * - auth (public auth routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|api|auth).*)',
      ],
    };
    ```
    
