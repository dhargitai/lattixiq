# **Product Requirements Document for "LattixIQ" App**

Version: 1.0

Author: Paul, Product Manager

Date: July 28, 2025

## 1. **Introduction & Executive Summary**

The "LattixIQ" is a mobile-accessible web application designed to solve the critical "knowing-doing gap" in personal development. The app provides users with a structured, action-oriented system to internalize powerful mental models and overcome cognitive biases. By creating personalized learning journeys tied to real-world goals, the app transforms passive knowledge into applied wisdom, serving as a comprehensive "Rationality Toolkit" for mastering one's own thinking.

## 2. **Product Goal & Vision**

- **Goal (V1):** To provide users with a tangible "win" by helping them solve one specific, self-identified problem through a guided, AI-curated learning path of 5-7 mental models or cognitive biases.
- **Vision (Long-Term):** To become an indispensable lifelong thinking partner that helps users build a comprehensive "latticework of mental models". We aim to fundamentally upgrade our users' thinking processes, enabling them to navigate life's complexities with greater wisdom, rationality, and resilience.

## 3. **User Persona**

- **"The Stagnant Achiever" (Primary):**
    - **Characteristics:** Intellectually curious and motivated for self-improvement, but often struggles with implementing the knowledge they acquire. They experience frustration from the gap between their intentions and their actions, often feeling "stuck."
    - **Needs:** A structured, actionable system that demands application, provides a clear path forward, and helps them understand their own thought patterns.

## **4. User Flow & Features**

The LattixIQ application is built around a simple, powerful user flow designed to close the "knowing-doing gap". The user's journey is a cycle through a core learning loop, with the "My Toolkit" screen acting as the central hub for their long-term growth.

### **Key Screens & Features**

- **Onboarding / Goal Selection:** A guided flow where a user defines a challenge or growth goal. The app uses this input to generate a personalized learning path.
- **The Roadmap View:** A visual, step-by-step representation of the user's learning path. This screen is the primary focus while a user is on an active journey.
- **The "My Toolkit" Hub:** The permanent home screen for returning users. It provides access to their active roadmap, a library of their learned models, their history of completed roadmaps, and their full Application Log.
- **Core Loop Screens (Learn, Plan, Reflect):** A set of three focused screens that guide the user through understanding a concept, creating an application plan, and reflecting on the outcome.
- **The Application Log:** The user's complete journal of all past reflections, accessible from the "My Toolkit" hub.

### **Epic 1: The First Win (Onboarding & First Roadmap)**

- **User Story:** As a new user, I want to define my primary growth goal so that the app can create a highly relevant, personalized learning path for me to follow.
- **Functional Requirements:**
    1. **Goal Input:** The user will be prompted to define a goal via a simple UI. They can select from categories (e.g., "Stop Procrastinating," "Think More Clearly") or describe their goal in a free-text field.
    2. **AI-Powered Roadmap Generation:**
        - **Semantic Analysis:** The user's free-text input will be converted into a semantic vector embedding.
        - **Content Vectorization:** All 100 mental models and the lists of cognitive biases/fallacies from the provided documents will be pre-processed into their own semantic vector embeddings. 2
        - **Semantic Matching:** The system will use cosine similarity to find the mental models and biases most conceptually relevant to the user's stated goal, ensuring a much more nuanced and accurate match than simple keywords.
        - **Roadmap Curation:** An algorithm will select the top 5-7 most relevant items to create a logical "Growth Roadmap," prioritizing foundational concepts first.
    3. **Roadmap Visualization:** The app will display the personalized roadmap visually in the `Roadmap View`, with later steps blurred or locked to create a sense of progression and encourage completion. Upon generation, the user is taken **directly** to this screen to see their new path.

### **Epic 2: The Core Learning Loop**

- **User Story:** As a learner, I want a simple, repeatable process to learn, apply, and reflect on new concepts so I can make steady progress on my roadmap.
- **Functional Requirements:**
    1. **Learn Screen:** Provides a concise, actionable summary of the current mental model or cognitive bias.
    2. **Plan Screen:** A structured form for creating an **Implementation Intention** (for mental models) or a **Spotting Mission** (for biases).
    3. **Integrated Reminder System:** On the Plan screen, the user can enable a global daily reminder and set a preferred time. If a plan is active, a notification will be sent at that time to prompt them.
    4. **Reflect Screen:** To unlock the next step on their roadmap, the user must complete a structured journal entry describing their experience and rating the model's effectiveness.
    5. **Smart Navigation:**
        - If a user has saved a plan but not yet reflected, returning to that step will take them directly to the `Reflect Screen`.
        - From the `Reflect Screen`, the user can navigate back to the `Learn Screen` to recap the concept before completing their journal entry.

### **Epic 3: Building the Toolkit (Long-Term Engagement)**

- **User Story:** As a returning user, I want a central hub where I can see my progress, review everything I've learned, and decide what to tackle next.
- **Functional Requirements:**
    1. **"My Toolkit" Hub:** This screen will serve as the primary landing page for all returning users.
    2. **Active Roadmap Display:** The "My Toolkit" screen will prominently feature a link to the user's current roadmap, if one is active.
    3. **Learned Content Library:** The hub will provide access to lists of "My Learned Models" and "My Completed Roadmaps".
    4. **Application Log Access:** The hub will provide the primary entry point to the full, chronological `Application Log`.
    5. **Testimonial Collection:** At key moments of success (e.g., completing the first roadmap), a component will appear in the Toolkit to request a user testimonial.

### **Epic 4: AI-Powered Journal Analysis & Personalization (Premium)**

- **User Story:** As an engaged user, I want the app to provide intelligent insights based on my journal entries to help me understand my patterns and guide my continued growth.
- **Functional Requirements:**
    1. **Data Storage:** Each "Application Log" entry will be stored in a structured format with associated metadata.
    2. **AI Analysis of Entries:** Each text entry will be processed by an AI model to extract sentiment, topics/themes, and key concepts.
        - **Sentiment:** `Positive`, `Negative`, `Neutral`.
        - **Topics/Themes:** `Career`, `Self-Doubt`, `Productivity`, etc.
        - **Key Concepts:** `Imposter Syndrome`, `perfectionism`, `decision paralysis`.
    3. **Personalized Alerts & Recommendations:** A rule-based engine will use the structured AI analysis to provide proactive guidance, such as suggesting a new, relevant roadmap based on recurring negative themes in a user's journal.
        - *Example:* `IF Topic = 'Self-Doubt' AND Sentiment = 'Negative' for >2 entries in a week, THEN suggest a new roadmap on 'Building Confidence' featuring models like 'Excessive Self-Regard Tendency' [cite: 2039-2041] as a learning module.`

## 5. **Monetization & Premium Features**

A **Freemium Subscription Model** will be used to maximize user acquisition and long-term value.

- **Free Tier:**
    - Full access to the Onboarding and the user's **first** complete LattixIQ Roadmap.
- **Premium Tier (Monthly/Annual Subscription):**
    - **Mental Model & Bias Library:** Unlocks the full library of content. 5
    - **Unlimited Roadmaps:** Create custom roadmaps or choose from advanced pre-built ones (e.g., "Roadmap for Effective Leadership").
    - **The "Decision Helper":** The hybrid model we discussed. It recommends models from the user's learned "Toolkit" and offers to unlock new, highly relevant models via mini-roadmaps.
    - **Advanced Personal Insights:** A dashboard visualizing trends, patterns, and recurring themes from the user's Application Log.

## 6. **Success Metrics**

- **Activation Rate:** % of new users who generate their first roadmap.
- **Retention Rate:** Day 30 and Month 5 retention of active users.
- **Conversion Rate:** % of free users who upgrade to Premium after completing their first roadmap.
- **Engagement:** Average number of "Reflect" logs completed per user per month.

## 7. **Future Considerations (V2 and Beyond)**

- **Argument Checker:** The feature we discussed for analyzing text and identifying potential Logical Fallacies 6 will be a primary candidate for a future release.
- **Community Features:** Opt-in, anonymized sharing of successful applications of mental models.