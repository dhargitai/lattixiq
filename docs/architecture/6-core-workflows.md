# **6. Core Workflows**

This section maps out the step-by-step interactions between our System Components for the most critical user journeys. We will use sequence diagrams to visualize these flows.

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

    APIRoutes->>SupabaseDB: checkCanCreateRoadmap(userId)
    SupabaseDB-->>APIRoutes: Returns true (first free roadmap)

    APIRoutes->>AIService: generateRoadmap(goal)
    AIService->>SupabaseDB: Semantic search on KnowledgeContent vectors
    SupabaseDB-->>AIService: Returns relevant model IDs
    AIService-->>APIRoutes: Returns curated list of steps

    APIRoutes->>SupabaseDB: CALL create_roadmap_with_tracking()
    Note over SupabaseDB: Atomically creates roadmap & updates user counters
    SupabaseDB-->>APIRoutes: Returns roadmap_id
    APIRoutes-->>Frontend: Returns new Roadmap object

    Frontend->>User: Displays personalized roadmap
```

## **Workflow 2: Free User Attempting Second Roadmap (Testimonial Flow)**

This workflow shows how free users can unlock a second roadmap by providing a testimonial.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant SupabaseDB as Supabase DB

    User->>Frontend: Navigates to /new-roadmap (has 1 roadmap)
    Frontend->>APIRoutes: GET /api/user/subscription-status
    APIRoutes->>SupabaseDB: checkCanCreateRoadmap(userId)
    SupabaseDB-->>APIRoutes: Returns false (free limit reached)
    APIRoutes-->>Frontend: {canCreateRoadmap: false, hasTestimonialBonus: false}

    Frontend->>User: Shows testimonial modal
    Note over Frontend: "Share your experience to unlock another roadmap"

    User->>Frontend: Provides testimonial URL
    Frontend->>APIRoutes: POST /api/users/testimonial {testimonialUrl}
    APIRoutes->>SupabaseDB: Updates user.testimonial_url
    SupabaseDB-->>APIRoutes: Confirms update
    APIRoutes-->>Frontend: {success: true, bonusUnlocked: true}

    Frontend->>User: Shows success message
    User->>Frontend: Proceeds to create second roadmap
    Frontend->>APIRoutes: POST /api/roadmaps {goal}

    APIRoutes->>SupabaseDB: checkCanCreateRoadmap(userId)
    SupabaseDB-->>APIRoutes: Returns true (testimonial bonus available)

    APIRoutes->>SupabaseDB: CALL create_roadmap_with_tracking()
    Note over SupabaseDB: Updates testimonial_bonus_used = true
    SupabaseDB-->>APIRoutes: Returns roadmap_id
    APIRoutes-->>Frontend: Returns new Roadmap object
```

## **Workflow 3: Subscription Purchase Flow**

This workflow details how users upgrade to premium via Stripe integration.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant Stripe
    participant Webhook as Webhook Handler
    participant SupabaseDB as Supabase DB

    User->>Frontend: Clicks "Upgrade to Premium"
    Frontend->>APIRoutes: POST /api/checkout {priceId}
    APIRoutes->>Stripe: Create checkout session
    Stripe-->>APIRoutes: Returns session URL
    APIRoutes-->>Frontend: {url: stripeCheckoutUrl}

    Frontend->>User: Redirects to Stripe Checkout
    User->>Stripe: Completes payment
    Stripe-->>Frontend: Redirects to success page

    par Async Webhook Processing
        Stripe->>Webhook: checkout.session.completed event
        Webhook->>Webhook: Verify signature
        Webhook->>SupabaseDB: INSERT/UPDATE user_subscriptions
        Note over SupabaseDB: Only service role can write
        SupabaseDB-->>Webhook: Confirms update
        Webhook-->>Stripe: 200 OK
    end

    Frontend->>APIRoutes: GET /api/user/subscription-status
    APIRoutes->>SupabaseDB: Query user_subscriptions
    SupabaseDB-->>APIRoutes: Returns active subscription
    APIRoutes-->>Frontend: {isSubscribed: true, status: "active"}
    Frontend->>User: Shows premium features unlocked
```

## **Workflow 4: Returning User Creating Additional Roadmap**

This workflow shows how the system enforces limits and handles different user types.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant SupabaseDB as Supabase DB
    participant AIService as AI Service

    User->>Frontend: Navigates to /new-roadmap
    Frontend->>APIRoutes: GET /api/user/subscription-status

    APIRoutes->>SupabaseDB: Query user_subscriptions
    APIRoutes->>SupabaseDB: Query users (roadmap_count, testimonial_url)
    SupabaseDB-->>APIRoutes: Returns subscription & limit data

    alt Has Active Subscription
        APIRoutes-->>Frontend: {canCreateRoadmap: true, isSubscribed: true}
        Frontend->>User: Shows roadmap creation form
    else Free User - Limit Not Reached
        APIRoutes-->>Frontend: {canCreateRoadmap: true, isSubscribed: false}
        Frontend->>User: Shows roadmap creation form
    else Free User - Limit Reached
        APIRoutes-->>Frontend: {canCreateRoadmap: false, hasTestimonialBonus: boolean}
        alt Testimonial Bonus Available
            Frontend->>User: Shows testimonial modal
        else No Options Left
            Frontend->>User: Shows upgrade to premium modal
        end
    end

    User->>Frontend: Submits goal (if allowed)
    Frontend->>APIRoutes: POST /api/roadmaps {goal}

    APIRoutes->>SupabaseDB: CALL create_roadmap_with_tracking()
    Note over SupabaseDB: Function enforces all limits
    SupabaseDB-->>APIRoutes: Returns roadmap_id or error

    alt Success
        APIRoutes-->>Frontend: Returns new Roadmap
        Frontend->>User: Displays roadmap
    else Limit Exceeded
        APIRoutes-->>Frontend: 403 Forbidden
        Frontend->>User: Shows appropriate upgrade prompt
    end
```

## **Workflow 5: Completing a Roadmap Step**

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

    User->>Frontend: Updates plan (trigger & action)
    Frontend->>APIRoutes: PATCH /api/roadmap-steps/:id/plan
    APIRoutes->>SupabaseDB: Updates plan fields
    SupabaseDB-->>APIRoutes: Confirms update
    APIRoutes-->>Frontend: Returns updated step

    User->>Frontend: Submits reflection from Reflect screen
    Frontend->>APIRoutes: POST /api/logs {reflectionData}
    APIRoutes->>SupabaseDB: Saves new ApplicationLog

    APIRoutes->>SupabaseDB: CALL complete_step_and_unlock_next()
    Note over SupabaseDB: Marks current step completed, unlocks next
    SupabaseDB-->>APIRoutes: Returns completion status

    APIRoutes-->>Frontend: Returns success response (201)
    Frontend->>User: Shows updated roadmap with progress

    par Asynchronous AI Analysis
        APIRoutes->>AIService: analyzeLog(logText)
        AIService->>SupabaseDB: Updates ApplicationLog with sentiment & topics
    end
```

## **Workflow 6: Content Block Loading**

This workflow shows how dynamic content is fetched for UI elements.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant SupabaseDB as Supabase DB

    User->>Frontend: Triggers action requiring help text
    Note over Frontend: e.g., Opens testimonial modal

    Frontend->>APIRoutes: GET /api/content-blocks/testimonial-help
    APIRoutes->>SupabaseDB: Query content_blocks
    Note over SupabaseDB: WHERE content_id = 'testimonial-help' AND published = true
    SupabaseDB-->>APIRoutes: Returns content block
    APIRoutes-->>Frontend: Returns markdown content

    Frontend->>Frontend: Renders markdown
    Frontend->>User: Displays formatted content
```

## **Workflow 7: Push Notification Scheduling**

This workflow details how reminders are scheduled and delivered.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ServiceWorker as Service Worker
    participant APIRoutes as Next.js API
    participant SupabaseDB as Supabase DB
    participant CronJob as Cron Service

    User->>Frontend: Enables notifications
    Frontend->>ServiceWorker: Request permission
    ServiceWorker-->>Frontend: Permission granted
    Frontend->>ServiceWorker: Subscribe to push
    ServiceWorker-->>Frontend: Returns subscription

    Frontend->>APIRoutes: POST /api/notifications/preferences
    APIRoutes->>SupabaseDB: Updates user preferences
    SupabaseDB-->>APIRoutes: Confirms update
    APIRoutes-->>Frontend: Success

    par Daily Cron Processing
        CronJob->>APIRoutes: GET /api/notifications/cron
        APIRoutes->>SupabaseDB: Query users with reminders enabled
        loop For each user
            APIRoutes->>SupabaseDB: Create notification_log entry
            APIRoutes->>ServiceWorker: Send push notification
            ServiceWorker->>User: Displays notification
            APIRoutes->>SupabaseDB: Update delivery status
        end
        APIRoutes-->>CronJob: Processing complete
    end
```

## **Workflow 8: Subscription Management via Billing Portal**

This workflow shows how users manage their existing subscriptions.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoutes as Next.js API
    participant Stripe
    participant Webhook as Webhook Handler
    participant SupabaseDB as Supabase DB

    User->>Frontend: Clicks "Manage Subscription"
    Frontend->>APIRoutes: POST /api/billing-portal
    APIRoutes->>SupabaseDB: Get user's stripe_customer_id
    SupabaseDB-->>APIRoutes: Returns customer_id

    APIRoutes->>Stripe: Create portal session
    Stripe-->>APIRoutes: Returns portal URL
    APIRoutes-->>Frontend: {url: portalUrl}

    Frontend->>User: Redirects to Stripe Portal
    User->>Stripe: Makes changes (cancel, update, etc.)
    Stripe-->>Frontend: Redirects back to app

    par Async Webhook Processing
        Stripe->>Webhook: subscription.updated/deleted event
        Webhook->>Webhook: Verify signature
        Webhook->>SupabaseDB: UPDATE user_subscriptions
        Note over SupabaseDB: Service role updates status
        SupabaseDB-->>Webhook: Confirms update
        Webhook-->>Stripe: 200 OK
    end

    Frontend->>APIRoutes: GET /api/user/subscription-status
    APIRoutes->>SupabaseDB: Query updated status
    SupabaseDB-->>APIRoutes: Returns new status
    APIRoutes-->>Frontend: Updated subscription info
    Frontend->>User: Shows current status
```

## **Security Considerations in Workflows**

### **Free Limit Enforcement**

- All roadmap creation flows use `create_roadmap_with_tracking` database function
- Function atomically updates counters preventing race conditions
- No client-side limit checking - all enforcement server-side

### **Subscription Security**

- Only Stripe webhooks (service role) can modify `user_subscriptions` table
- Users can only read their own subscription status
- All subscription checks happen server-side before allowing actions

### **Data Isolation**

- RLS policies ensure users only access their own data
- No DELETE operations allowed on roadmaps/steps
- Service role required for administrative operations

### **Content Management**

- Content blocks only visible when published
- Service role required to modify content
- Client caches content to reduce database queries
