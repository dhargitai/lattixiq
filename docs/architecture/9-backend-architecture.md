# **9. Backend Architecture**

This section details the patterns for all server-side logic, which will be implemented as Next.js API Routes and deployed as Vercel Serverless Functions.

## **Service Architecture (Serverless)**

- **Function Organization:** We will follow a RESTful, resource-based structure within the `/app/api/` directory. Each resource will have its own folder, and different HTTP methods (GET, POST, PATCH, etc.) will be handled by exported functions within the `route.ts` file for that resource.
    
    ```
    /app
    └── /api
        ├── /roadmaps
        |   └── route.ts  // Handles POST to create, GET to list
        ├── /logs
        |   └── route.ts  // Handles POST to create
        └── /user
            └── /me
                └── route.ts // Handles PATCH to update user
    ```
    
- **API Route (Function) Template:** All new API routes must adhere to this template to ensure consistency in authentication, error handling, and response formatting.
    
    ```tsx
    // /app/api/roadmaps/route.ts
    import { type NextRequest, NextResponse } from 'next/server';
    import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    import { z } from 'zod'; // For input validation
    
    // 1. Define input schema for validation
    const postSchema = z.object({
      goalDescription: z.string().min(10),
    });
    
    // 2. Handle POST requests
    export async function POST(request: NextRequest) {
      const supabase = createRouteHandlerClient({ cookies });
    
      try {
        // 3. Authenticate the user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return new NextResponse('Unauthorized', { status: 401 });
        }
    
        // 4. Validate the request body
        const body = await request.json();
        const validatedBody = postSchema.parse(body);
    
        // 5. Core business logic (e.g., call AI service, save to DB)
        // const newRoadmap = await createRoadmapForUser(session.user.id, validatedBody.goalDescription);
    
        // 6. Return a typed, consistent response
        return NextResponse.json({ data: newRoadmap }, { status: 201 });
    
      } catch (error) {
        // 7. Use a standardized error handler
        // is zod error, return 400, otherwise 500
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }
    ```
    

## **Database Architecture**

- **Schema Design:** The PostgreSQL schema is defined in Section 7 of this document. All schema changes must be managed via Supabase CLI migrations, which will be stored in the `/supabase/migrations` directory.
- **Data Access Layer:** API Routes **must not** contain raw database queries. All database interactions will be abstracted into a dedicated data access layer located in `/lib/db/`. This centralizes our data logic, makes it reusable, and simplifies testing.
    
    ```tsx
    // /lib/db/roadmaps.ts
    import { createServerClient } from '@supabase/ssr'; // Or other server client
    import { Roadmap } from '@/lib/types';
    
    // A function that encapsulates the logic for creating a roadmap
    export async function createRoadmap(
        supabase: ReturnType<typeof createServerClient>,
        userId: string,
        goal: string
    ): Promise<Roadmap> {
        const { data, error } = await supabase
            .from('roadmaps')
            .insert({ user_id: userId, goal_description: goal })
            .select()
            .single();
    
        if (error) {
            throw new Error('Failed to create roadmap in DB.');
        }
    
        return data;
    }
    ```
    

## **Authentication and Authorization**

- **Authentication Flow:** As detailed in the Core Workflows, authentication is handled by the Supabase client library and validated server-side in our middleware and API routes.
- **Authorization:** Authorization is enforced at two levels:
    1. **API Route Level:** Every API Route will check for a valid session to ensure a user is logged in.
    2. **Database Level:** PostgreSQL's Row-Level Security (RLS) provides the ultimate layer of protection, ensuring that even if an API bug were to exist, a user could never query or modify data that doesn't belong to them. The full RLS policies are detailed in Section 7.
