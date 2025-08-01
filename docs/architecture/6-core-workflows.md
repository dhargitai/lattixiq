# **6. Core Workflows**

This section maps out the step-by-step interactions between our System Components for the most critical user journeys. We will use sequence diagrams to visualize these flows. 1

## **Workflow 1: New User Registration & First Roadmap Creation**

This workflow covers the user's journey from their first visit to seeing their personalized roadmap, which is critical for user activation.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Middleware
    participant SupabaseAuth as Supabase Auth
    participant APIRoutes as Next.js API
    participant AIService as AI Service
    participant SupabaseDB as Supabase DB

    User->>Frontend: Visits site (unauthenticated)
    Frontend->>Middleware: Request to protected route
    Middleware-->>Frontend: Redirect to /login

    User->>Frontend: Enters email for OTP login
    Frontend->>SupabaseAuth: initiateLogin(email)
    SupabaseAuth-->>User: Sends OTP email
    User->>Frontend: Enters OTP code
    Frontend->>SupabaseAuth: verifyOtp(otp)
    SupabaseAuth-->>Frontend: Returns session (JWT)
    Note over SupabaseAuth, SupabaseDB: Trigger creates public.User profile

    Frontend->>APIRoutes: GET /api/users/onboarding-status
    APIRoutes->>SupabaseDB: Query getUserRoadmapCount(userId)
    SupabaseDB-->>APIRoutes: Returns count (0 for new user)
    APIRoutes-->>Frontend: Returns {isNewUser: true}
    Frontend-->>User: Redirect to /new-roadmap

    Frontend->>User: Displays new roadmap creation screen
    Note over Frontend: Shows expanded "How this works" for new users
    Note over Frontend: Category buttons populate starter text
    User->>Frontend: Clicks category or enters custom goal
    Frontend->>Frontend: Validates goal (min 10 chars, real-time feedback)
    User->>Frontend: Submits goal
    Frontend->>APIRoutes: POST /api/roadmaps {goal}

    APIRoutes->>AIService: generateRoadmap(goal)
    AIService->>SupabaseDB: Semantic search on KnowledgeContent vectors
    SupabaseDB-->>AIService: Returns relevant model IDs
    AIService-->>APIRoutes: Returns curated list of steps

    APIRoutes->>SupabaseDB: Creates Roadmap & RoadmapSteps records
    SupabaseDB-->>APIRoutes: Confirms creation
    APIRoutes-->>Frontend: Returns new Roadmap object

    Frontend->>User: Displays personalized roadmap
```

## **Workflow 2: Returning User Creating New Roadmap**

This workflow shows how returning users can create additional roadmaps with a streamlined experience.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant AIService as AI Service
    participant SupabaseDB as Supabase DB

    User->>Frontend: Navigates to /new-roadmap (authenticated)
    Frontend->>APIRoutes: GET /api/users/onboarding-status
    APIRoutes->>SupabaseDB: Query getUserRoadmapCount(userId)
    SupabaseDB-->>APIRoutes: Returns count (> 0 for returning user)
    APIRoutes-->>Frontend: Returns {isNewUser: false}

    Frontend->>User: Displays new roadmap creation screen
    Note over Frontend: Shows collapsed "How this works" for returning users
    Note over Frontend: Question text: "What is your next challenge?"

    User->>Frontend: Clicks category button or enters goal
    Note over Frontend: Category button clears input and populates starter text
    Frontend->>Frontend: Validates goal (min 10 chars, real-time feedback)
    User->>Frontend: Submits goal

    Frontend->>APIRoutes: POST /api/roadmaps {goal}
    APIRoutes->>AIService: generateRoadmap(goal)
    AIService->>SupabaseDB: Semantic search on KnowledgeContent vectors
    SupabaseDB-->>AIService: Returns relevant model IDs
    AIService-->>APIRoutes: Returns curated list of steps

    APIRoutes->>SupabaseDB: Creates new Roadmap & RoadmapSteps records
    SupabaseDB-->>APIRoutes: Confirms creation
    APIRoutes-->>Frontend: Returns new Roadmap object

    Frontend->>User: Displays new personalized roadmap
```

## **Workflow 3: Completing a Roadmap Step**

This workflow details the core engagement loop of the application: learning, planning, and reflecting to make progress.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant SupabaseDB as Supabase DB
    participant AIService as AI Service

    User->>Frontend: Clicks on current roadmap step
    Note over Frontend: Displays Learn & Plan screens (client-side)
    User->>Frontend: Submits reflection from Reflect screen

    Frontend->>APIRoutes: POST /api/logs {reflectionData}
    APIRoutes->>SupabaseDB: Saves new ApplicationLog
    APIRoutes->>SupabaseDB: Updates RoadmapStep status to 'completed' & unlocks next step
    SupabaseDB-->>APIRoutes: Confirms updates

    APIRoutes-->>Frontend: Returns success response (201)
    Frontend->>User: Shows updated roadmap with progress (optimistic UI update)

    par Asynchronous AI Analysis
        APIRoutes->>AIService: analyzeLog(logText)
        AIService->>SupabaseDB: Updates ApplicationLog with sentiment & topics
    end
```
