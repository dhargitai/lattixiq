# **Product Requirements Document for "LattixIQ" App**

Version: 1.0

Author: Paul, Product Manager

Date: July 28, 2025

## 1. **Introduction & Executive Summary**

LattixIQ is a personalized mental models learning app that helps you "Think Better, Today." The app creates custom roadmaps of the most relevant mental models for your current goal or problem, providing practical, easy-to-consume learning materials with personalized examples. Built-in scientifically proven methods like spaced repetition, IF-THEN planning, and reflection analysis help you learn faster and retain longer, while uncovering patterns in your thinking and behavior.

Based on Charlie Munger's "Latticework of Mental Models" approach, LattixIQ transforms users from scattered, overwhelmed thinkers into clear, strategic thinkers with automatic recall of the right mental model at the right time.

## 2. **Product Goal & Vision**

- **Goal (V1):** Help users master 5-7 mental models specifically relevant to their current challenge, with automatic retention through spaced repetition and IF-THEN application planning.
- **Vision (Long-Term):** Build an evolving, personalized thinking toolkit that adapts as user goals change, enabling automatic recall of the right mental model at the right time for any situation.

## 3. **User Persona**

- **"The Mental Models Collector" (Primary):**
  - **Current State:** Collects mental models like bookmarks but defaults to same old thinking patterns when decisions matter. Vaguely aware of mental models but never quite applies them when needed.
  - **Pain Points:**
    - Forgets concepts after reading about them
    - Overwhelmed by too many models without knowing which to use when
    - No system for practical application or retention
    - Blind to recurring patterns in their own thinking
  - **Desired Outcome:** Instinctively reaches for the right mental model at the right time, with continuous improvement through reflection and pattern recognition.

## **4. User Flow & Features**

LattixIQ transforms users through a personalized mental models learning system. Users progress through goal-specific roadmaps with custom-fit learning, instant application through IF-THEN planning, and automatic retention via spaced repetition. The "My Toolkit" hub serves as their evolving thinking toolkit library.

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
     - _Example:_ `IF Topic = 'Self-Doubt' AND Sentiment = 'Negative' for >2 entries in a week, THEN suggest a new roadmap on 'Building Confidence' featuring models like 'Excessive Self-Regard Tendency' [cite: 2039-2041] as a learning module.`

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
