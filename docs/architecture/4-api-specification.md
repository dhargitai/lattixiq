# **4. API Specification**

This section defines the API contract for LattixIQ. We use **Next.js API Routes** to create RESTful serverless endpoints. This approach is tightly integrated with our chosen tech stack, providing end-to-end type safety when used with our shared TypeScript interfaces.

All endpoints are protected by Supabase's server-side authentication helpers, ensuring that users can only access their own data.

## **Authentication**

Authentication itself (social login, OTP) is handled client-side by the Supabase Auth library. Our API will not have `/login` or `/register` endpoints. Instead, authenticated requests will include a Supabase JWT, which our API middleware will validate.

## **Resource: Roadmaps (`/api/roadmaps`)**

### **`POST /`**

- **Description:** Creates a new, personalized roadmap for the authenticated user. This endpoint triggers sophisticated AI-powered roadmap generation using semantic search, spaced repetition algorithms, and advanced curation. Uses the `create_roadmap_with_tracking` database function to enforce free limits.
- **Request Body:** `{ "goalDescription": "string" }` (minimum 10 characters, validated for specificity)
- **Response (200):** The newly created roadmap with detailed steps:

```json
{
  "goalDescription": "string",
  "totalSteps": number,
  "estimatedDuration": "string",
  "learningMixSummary": {
    "newConcepts": number,
    "reinforcementConcepts": number,
    "expansionPercentage": number
  },
  "steps": [
    {
      "order": number,
      "knowledgeContentId": "string",
      "title": "string",
      "type": "mental-model" | "cognitive-bias" | "fallacy",
      "category": "string",
      "relevanceScore": number,
      "learningStatus": "new" | "reinforcement",
      "reinforcementContext": {
        "lastAppliedDaysAgo": number,
        "effectivenessRating": number,
        "spacedInterval": "string"
      },
      "rationaleForInclusion": "string",
      "suggestedFocus": "string"
    }
  ],
  "roadmapId": "string"
}
```

- **Error Responses:**
  - **400:** Goal validation failed, multiple goals detected, or active roadmap exists
  - **403:** User has exceeded free roadmap limit
  - **404:** Insufficient relevant content found for goal
  - **503:** AI service temporarily unavailable
  - **500:** Roadmap generation or validation failed

### **`GET /`**

- **Description:** Fetches the user's currently active roadmap with full step details and knowledge content.
- **Request Body:** None.
- **Response (200):**

```json
{
  "roadmap": {
    "id": "string",
    "goal_description": "string",
    "status": "active",
    "created_at": "string",
    "roadmap_steps": [
      {
        "id": "string",
        "order": number,
        "status": "string",
        "plan_trigger": "string",
        "plan_action": "string",
        "completed_at": "string | null",
        "knowledge_content": {
          "id": "string",
          "title": "string",
          "type": "string",
          "category": "string",
          "summary": "string",
          "description": "string",
          "application": "string"
        }
      }
    ]
  }
}
```

- **Response (200):** `{ "roadmap": null }` if no active roadmap exists

## **Resource: Roadmap Steps (`/api/roadmap-steps`)**

### **`PATCH /:id/plan`**

- **Description:** Updates or creates the implementation plan for a roadmap step.
- **Request Body:** `{ "trigger": "string", "action": "string" }`
- **Response (200):** The updated `RoadmapStep` object with the new plan.

## **Resource: Application Logs (`/api/logs`)**

### **`POST /`**

- **Description:** Submits a new journal reflection for a roadmap step. This action will trigger two backend processes: 1) Unlocking the next `RoadmapStep`. 2) Asynchronously sending the text content to the Vercel AI SDK for analysis (sentiment, topics).
- **Request Body:** `{ "roadmapStepId": "string", "situationText": "string", "learningText": "string", "effectivenessRating": number }`
- **Response (201):** The newly created `ApplicationLog` object.

### **`GET /`**

- **Description:** Fetches all of the user's application logs.
- **Request Body:** None.
- **Response (200):** An array of `ApplicationLog` objects.

## **Resource: Knowledge Content (`/api/knowledge`)**

### **`GET /:id`**

- **Description:** Fetches the detailed content for a single mental model or bias.
- **Request Body:** None.
- **Response (200):** A `KnowledgeContent` object, including an array of its associated `GoalExample` objects.

## **Resource: Content Blocks (`/api/content-blocks`)**

### **`GET /:contentId`**

- **Description:** Fetches a specific content block by its content_id slug.
- **Request Body:** None.
- **Response (200):** The content block with markdown content.
- **Response (404):** Content block not found or not published.

## **Resource: User (`/api/user`)**

### **`PATCH /me`**

- **Description:** Updates the authenticated user's preferences or state.
- **Request Body:** `{ "notificationPrefs"?: object, "testimonialState"?: "dismissed_first" | "submitted" | ... }`
- **Response (200):** The updated `User` object.

### **`GET /subscription-status`**

- **Description:** Gets the user's current subscription and roadmap creation eligibility.
- **Response (200):**

```json
{
  "isSubscribed": boolean,
  "status": "free" | "active" | "canceled" | ...,
  "canCreateRoadmap": boolean,
  "completedFreeRoadmap": boolean,
  "hasTestimonialBonus": boolean
}
```

### **`GET /preferences`**

- **Description:** Fetches user preferences including reminder settings.
- **Response (200):** User preferences object.

### **`PATCH /preferences`**

- **Description:** Updates user preferences including reminder settings.
- **Request Body:** Preference fields to update.
- **Response (200):** Updated preferences.

## **Resource: Testimonial (`/api/users/testimonial`)**

### **`POST /`**

- **Description:** Submits a user testimonial URL and unlocks bonus roadmap.
- **Request Body:** `{ "testimonialUrl": "string" }`
- **Response (200):** `{ "success": true, "bonusUnlocked": boolean }`
- **Response (400):** Invalid URL or testimonial already submitted.

## **Resource: Notifications (`/api/notifications`)**

### **`POST /preferences`**

- **Description:** Updates notification preferences and subscription.
- **Request Body:** `{ "enabled": boolean, "subscription"?: PushSubscription }`
- **Response (200):** Updated preferences.

### **`POST /test`**

- **Description:** Sends a test notification to verify setup.
- **Response (200):** `{ "success": true }`
- **Response (400):** No subscription found.

### **`POST /schedule`**

- **Description:** Schedules a notification for a specific time.
- **Request Body:** `{ "title": "string", "body": "string", "scheduledFor": "ISO 8601 timestamp" }`
- **Response (200):** Scheduled notification details.

### **`GET /cron`**

- **Description:** Cron endpoint for processing scheduled notifications.
- **Headers:** Must include valid cron secret.
- **Response (200):** Processing results.

## **Resource: Payments (`/api/checkout`)**

### **`POST /`**

- **Description:** Creates a Stripe checkout session for a new subscription.
- **Request Body:** `{ "priceId": "string" }`
- **Response (200):** `{ "url": "string" }` (The URL to redirect the user to Stripe Checkout).
- **Response (400):** Invalid price ID or user already subscribed.

### **`GET /callback`**

- **Description:** Handles return from Stripe checkout (success/cancel).
- **Query Params:** `session_id`, `success`
- **Response:** Redirects to appropriate app page.

## **Resource: Billing Portal (`/api/billing-portal`)**

### **`POST /`**

- **Description:** Creates a Stripe Customer Portal session for managing an existing subscription.
- **Request Body:** None.
- **Response (200):** `{ "url": "string" }` (The URL to redirect the user to the Stripe Portal).
- **Response (400):** No Stripe customer found.

## **Resource: Webhooks (`/api/webhooks`)**

### **`POST /stripe`**

- **Description:** Handles Stripe webhook events for subscription updates.
- **Headers:** Must include valid Stripe signature.
- **Events Handled:**
  - `checkout.session.completed`: New subscription created
  - `customer.subscription.updated`: Subscription status changed
  - `customer.subscription.deleted`: Subscription canceled
  - `invoice.payment_succeeded`: Payment received
  - `invoice.payment_failed`: Payment failed
- **Response (200):** Event processed successfully.
- **Response (400):** Invalid signature or event processing failed.

## **Resource: Subscription (`/api/subscription`)**

### **`POST /sync`**

- **Description:** Manually syncs subscription status from Stripe (admin/debug endpoint).
- **Response (200):** Sync results.
- **Response (403):** Insufficient permissions.

## **Resource: Authentication (`/api/auth`)**

### **`POST /logout`**

- **Description:** Logs out the current user by clearing session cookies.
- **Response (200):** `{ "success": true }`

## **Resource: Test Email (`/api/test-email`)**

### **`POST /`**

- **Description:** Sends a test email (development/testing only).
- **Request Body:** Email configuration.
- **Response (200):** Email sent successfully.
- **Note:** This endpoint is typically disabled in production.

## **Error Response Format**

All error responses follow a consistent format:

```json
{
  "error": {
    "message": "string",
    "code": "string (optional)",
    "details": "object (optional)"
  }
}
```

## **Rate Limiting**

- **Roadmap Creation:** Limited by free tier (1 roadmap, +1 with testimonial) or subscription status
- **AI Operations:** Rate limited to prevent abuse (10 requests per minute)
- **Notification Sending:** Limited to 100 per day per user
- **Webhook Processing:** No rate limit (trusted source)

## **Security Considerations**

1. **Authentication Required:** All endpoints except webhooks require valid Supabase JWT
2. **Row-Level Security:** Database RLS policies ensure users can only access their own data
3. **Webhook Validation:** Stripe webhooks validated using signature verification
4. **Service Role Protection:** Sensitive operations use service role for elevated privileges
5. **Input Validation:** All user inputs sanitized and validated before processing
6. **CORS Configuration:** Properly configured for production domain only

## **Common Response Headers**

```
Content-Type: application/json
Cache-Control: no-store, must-revalidate
X-Request-Id: <unique-request-id>
```

## **Pagination**

For endpoints returning lists (future implementation):

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
