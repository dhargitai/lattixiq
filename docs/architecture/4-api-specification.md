# **4. API Specification**

This section defines the API contract for LattixIQ. We will use **Next.js API Routes** to create RESTful serverless endpoints. This approach is tightly integrated with our chosen tech stack, providing end-to-end type safety when used with our shared TypeScript interfaces.

All endpoints will be protected by Supabase's server-side authentication helpers, ensuring that users can only access their own data.

## **Authentication**

Authentication itself (social login, OTP) is handled client-side by the Supabase Auth library. Our API will not have `/login` or `/register` endpoints. Instead, authenticated requests will include a Supabase JWT, which our API middleware will validate.

## **Resource: Roadmaps (`/api/roadmaps`)**

- **`POST /`**
  - **Description:** Creates a new, personalized roadmap for the authenticated user. This endpoint triggers sophisticated AI-powered roadmap generation using semantic search, spaced repetition algorithms, and advanced curation. Includes comprehensive validation and error handling.
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
        "type": "mental-model" | "cognitive-bias" | "logical-fallacy",
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
    - **404:** Insufficient relevant content found for goal
    - **503:** AI service temporarily unavailable
    - **500:** Roadmap generation or validation failed
- **`GET /`**
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
          "plan_situation": "string",
          "plan_trigger": "string",
          "plan_action": "string",
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

- **`PATCH /:id/plan`**
  - **Description:** Updates or creates the implementation plan for a roadmap step.
  - **Request Body:** `{ "situation"?: "string", "trigger": "string", "action": "string" }`
  - **Response (200):** The updated `RoadmapStep` object with the new plan.

## **Resource: Application Logs (`/api/logs`)**

- **`POST /`**
  - **Description:** Submits a new journal reflection for a roadmap step. This action will trigger two backend processes: 1) Unlocking the next `RoadmapStep`. 2) Asynchronously sending the text content to the Vercel AI SDK for analysis (sentiment, topics).
  - **Request Body:** `{ "roadmapStepId": "string", "situationText": "string", "learningText": "string", "effectivenessRating": number }`
  - **Response (201):** The newly created `ApplicationLog` object.
- **`GET /`**
  - **Description:** Fetches all of the user's application logs.
  - **Request Body:** None.
  - **Response (200):** An array of `ApplicationLog` objects.

## **Resource: Knowledge Content (`/api/knowledge`)**

- **`GET /:id`**
  - **Description:** Fetches the detailed content for a single mental model or bias.
  - **Request Body:** None.
  - **Response (200):** A `KnowledgeContent` object, including an array of its associated `GoalExample` objects.

## **Resource: User (`/api/user`)**

- **`PATCH /me`**
  - **Description:** Updates the authenticated user's preferences or state.
  - **Request Body:** `{ "notificationPrefs"?: object, "testimonialState"?: "dismissed_first" | "submitted" | ... }`
  - **Response (200):** The updated `User` object.

## **Resource: Payments (`/api/payments`)**

- **`POST /create-checkout-session`**
  - **Description:** Creates a Stripe checkout session for a new subscription.
  - **Request Body:** `{ "priceId": "string" }`
  - **Response (200):** `{ "url": "string" }` (The URL to redirect the user to Stripe Checkout).
- **`POST /create-portal-session`**
  - **Description:** Creates a Stripe Customer Portal session for managing an existing subscription.
  - **Request Body:** None.
  - **Response (200):** `{ "url": "string" }` (The URL to redirect the user to the Stripe Portal).
