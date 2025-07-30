# **3. Data Models**

This section defines the core data entities for the LattixIQ application. These models will be implemented as tables in our PostgreSQL database (storing all knowledge content and user data), managed by Supabase. The TypeScript interfaces will be shared between the frontend and backend (API Routes) to ensure type safety across the entire application.

## **1. User**

- **Purpose:** Stores user account information provided by Supabase Auth, along with application-specific preferences and state, including the testimonial tracking logic.
- **Key Attributes:**
    - `id` (UUID): Primary key, foreign key from `auth.users`.
    - `email` (Text): The user's email address.
    - `created_at` (Timestamp): Managed by Supabase.
    - `stripe_customer_id` (Text, Nullable): To link the user with their Stripe subscription data.
    - `subscription_status` (Enum: `free`, `premium`): The user's current payment plan.
    - **`testimonial_state` (Enum: `not_asked`, `asked_first`, `dismissed_first`, `submitted`, `asked_second`, `dismissed_second`): Tracks the state of the Senja testimonial request flow.**
    - `notification_prefs` (JSONB): Stores user preferences for notifications (e.g., `{ morning_digest_time: '08:00' }`).
- **TypeScript Interface:**
    
    ```tsx
    interface User {
      id: string;
      email: string;
      createdAt: string;
      stripeCustomerId?: string;
      subscriptionStatus: 'free' | 'premium';
      testimonialState: 'not_asked' | 'asked_first' | 'dismissed_first' | 'submitted' | 'asked_second' | 'dismissed_second';
      notificationPrefs: {
        morningDigestTime?: string;
        // ... other notification settings
      };
    }
    ```
    
- **Relationships:** A User `has many` Roadmaps, `has many` ApplicationLogs.

## **2. Roadmap**

- **Purpose:** Represents a single, personalized learning journey for a user, tied to a specific goal.
- **Key Attributes:**
    - `id` (UUID): Primary key.
    - `user_id` (UUID): Foreign key linking to the `User` table.
    - `goal_description` (Text): The user's stated goal for this roadmap (e.g., "Stop Procrastinating").
    - `status` (Enum: `active`, `completed`): The current state of the roadmap.
    - `created_at` (Timestamp): When the roadmap was generated.
    - `completed_at` (Timestamp, Nullable): When the user finished the last step.
- **TypeScript Interface:**
    
    ```tsx
    interface Roadmap {
      id: string;
      userId: string;
      goalDescription: string;
      status: 'active' | 'completed';
      createdAt: string;
      completedAt?: string;
    }
    ```
    
- **Relationships:** A Roadmap `belongs to` a User, `has many` RoadmapSteps.

## **3. RoadmapStep**

- **Purpose:** Represents a single, ordered step within a Roadmap, linking to a specific Mental Model or Bias. Also stores the user's implementation plan for this step.
- **Key Attributes:**
    - `id` (UUID): Primary key.
    - `roadmap_id` (UUID): Foreign key linking to the `Roadmap` table.
    - `knowledge_content_id` (UUID): Foreign key linking to the `KnowledgeContent` table.
    - `status` (Enum: `locked`, `unlocked`, `completed`): The user's progress on this step.
    - `order` (Integer): The numerical order of the step within the roadmap (e.g., 1, 2, 3...).
    - `plan_situation` (Text, Nullable): The context where the user plans to apply the concept (e.g., "During morning team meetings").
    - `plan_trigger` (Text, Nullable): The specific cue that will prompt the action (e.g., "When I feel the urge to interrupt").
    - `plan_action` (Text, Nullable): The intended response (e.g., "I'll write my thought down and wait for a pause").
    - `plan_created_at` (Timestamp, Nullable): When the plan was created.
- **TypeScript Interface:**
    
    ```tsx
    interface RoadmapStep {
      id: string;
      roadmapId: string;
      knowledgeContentId: string;
      status: 'locked' | 'unlocked' | 'completed';
      order: number;
      planSituation?: string;
      planTrigger?: string;
      planAction?: string;
      planCreatedAt?: string;
    }
    ```
    
- **Relationships:** A RoadmapStep `belongs to` a Roadmap, `has one` KnowledgeContent item, `has many` ApplicationLogs.

## **4. ApplicationLog**

- **Purpose:** Stores the user's journal reflections from the "Reflect" screen. This is the core data for personalization.
- **Key Attributes:**
    - `id` (UUID): Primary key.
    - `user_id` (UUID): Foreign key to the `User`.
    - `roadmap_step_id` (UUID): Foreign key to the specific `RoadmapStep` this log is for.
    - `situation_text` (Text): The user's description of what happened.
    - `learning_text` (Text): The user's reflection on what they learned.
    - `effectiveness_rating` (Integer): The user's self-rated score from 1-5.
    - `ai_sentiment` (Enum, Nullable: `positive`, `negative`, `neutral`): Populated by our AI analysis.
    - `ai_topics` (Array of Text, Nullable): Populated by our AI analysis (e.g., `['career', 'self-doubt']`).
    - `created_at` (Timestamp).
- **TypeScript Interface:**
    
    ```tsx
    interface ApplicationLog {
      id: string;
      userId: string;
      roadmapStepId: string;
      situationText: string;
      learningText: string;
      effectivenessRating: number; // 1-5
      aiSentiment?: 'positive' | 'negative' | 'neutral';
      aiTopics?: string[];
      createdAt: string;
    }
    ```
    
- **Relationships:** An ApplicationLog `belongs to` a User and `belongs to` a RoadmapStep.

## **5. KnowledgeContent**

- **Purpose:** To be the single source of truth for all mental models, cognitive biases, and fallacies. This allows for dynamic content management.
- **Key Attributes:**
    - `id` (UUID): Primary key.
    - `title` (Text): The name of the model (e.g., "Inversion").
    - `category` (Text): The discipline (e.g., "Psychology").
    - `type` (Enum: `mental-model`, `cognitive-bias`, `fallacy`).
    - `summary` (Text): A brief, one-sentence explanation.
    - `description` (Text): The detailed explanation of the concept.
    - `application` (Text): General guidance on how to apply or spot the concept.
    - `keywords` (Array of Text): For filtering and search.
    - `embedding` (Vector): The vector embedding for semantic search, managed by `pgvector`.
- **TypeScript Interface:**
    
    ```tsx
    interface KnowledgeContent {
      id: string;
      title: string;
      category: string;
      type: 'mental-model' | 'cognitive-bias' | 'fallacy';
      summary: string;
      description: string;
      application: string;
      keywords: string[];
      // embedding is handled server-side
    }
    ```
    
- **Relationships:** `has many` GoalExamples, `has many` RoadmapSteps.

## **6. GoalExample**

- **Purpose:** To store personalized examples for applying knowledge to a specific goal. Normalizing this into a separate table is efficient.
- **Key Attributes:**
    - `id` (UUID): Primary key.
    - `knowledge_content_id` (UUID): Foreign key to the `KnowledgeContent` table.
    - `goal` (Text): The user goal category this example applies to (e.g., "Procrastination").
    - `if_then_example` (Text, Nullable): Example for a mental model.
    - `spotting_mission_example` (Text, Nullable): Example for a cognitive bias.
- **TypeScript Interface:**
    
    ```tsx
    interface GoalExample {
      id: string;
      knowledgeContentId: string;
      goal: string;
      ifThenExample?: string;
      spottingMissionExample?: string;
    }
    ```
    
- **Relationships:** `belongs to` one KnowledgeContent item.


## **Vector Database Integration**

We will leverage Supabase's built-in `pgvector` extension to handle semantic search, which keeps our architecture lean.

- **Workflow:**
    1. When a `KnowledgeContent` item is created or updated in our Postgres database, a Supabase Edge Function will automatically be triggered.
    2. This function will take the text fields (`title`, `description`, `application`), use the Vercel AI SDK to generate a vector embedding from them, and save the resulting embedding into the `embedding` column of that item.
    3. When a user sets a goal, the app's backend will perform a semantic search by comparing the user's vectorized goal against the `embedding` column directly in the database to find the most relevant content for their roadmap.
