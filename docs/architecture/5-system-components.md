# **5. System Components**

This architecture is composed of several distinct, interacting logical components. 1

## **1. Frontend Client**

- **Responsibility:** To provide a responsive, intuitive, and "Serene Minimalist" user interface. It handles all user interactions, manages client-side state, and communicates with the backend via the API.
- **Key Interfaces:** Interacts with the user's browser. Makes HTTP requests to the Next.js API Routes.
- **Dependencies:** Next.js API Routes.
- **Technology Stack:** Next.js (App Router), React, TypeScript, shadcn/ui, Tailwind CSS, Zustand.

## **2. Next.js API Routes (Backend Logic)**

- **Responsibility:** To act as the secure backend for the application. It handles all business logic, validates user requests, orchestrates calls to other services (Supabase, AI, Stripe), and returns data to the client.
- **Key Interfaces:** Provides a RESTful API for the Frontend Client.
- **Dependencies:** Supabase Service, AI Service, Payment Service, Notification Service.
- **Technology Stack:** Next.js (API Routes), TypeScript.

## **3. Supabase Service**

- **Responsibility:** To provide core backend-as-a-service functionality. This includes secure user authentication (social & OTP), a managed PostgreSQL database with Row-Level Security, and the `pgvector` extension for semantic search.
- **Key Interfaces:** Supabase Client SDK (for client-side auth), Supabase Server-side SDK (for data access from API Routes).
- **Dependencies:** None.
- **Technology Stack:** Supabase, PostgreSQL, pgvector.

## **4. AI Service**

- **Responsibility:** To handle all interactions with Large Language Models. This includes generating vector embeddings for our knowledge base and analyzing user journal entries for sentiment and topics.
- **Key Interfaces:** Vercel AI SDK.
- **Dependencies:** A vector-enabled database (our Supabase `pgvector` instance).
- **Technology Stack:** Vercel AI SDK, Supabase Edge Functions (for embedding generation).

## **5. Payment Service**

- **Responsibility:** To manage all subscription and payment-related tasks securely.
- **Key Interfaces:** Stripe API, Stripe Webhooks.
- **Dependencies:** Next.js API Routes (to handle webhook events).
- **Technology Stack:** Stripe SDK.

## **6. Notification Service**

- **Responsibility:** To send all application-related notifications (e.g., morning plan digests). This component is an abstraction layer to avoid vendor lock-in.
- **Key Interfaces:** A simple, internal `sendEmail` or `sendPush` function.
- **Dependencies:** A third-party email/push provider (e.g., Resend, Twilio).
- **Technology Stack:** To be determined (e.g., Resend SDK).

## **Component Interaction Diagram**

This diagram shows how these logical components interact to deliver the application's features.

```mermaid
graph TD
    UserInterface[Frontend Client] -- API Calls --> APILayer[Next.js API Routes]
    
    APILayer -- Auth & DB Queries --> SupabaseService[Supabase Service]
    APILayer -- AI Tasks --> AIService[AI Service]
    APILayer -- Payment Processing --> PaymentService[Payment Service]
    APILayer -- Send Notifications --> NotificationService[Notification Service]

    style UserInterface fill:#D6EAF8
    style APILayer fill:#D1F2EB
```
