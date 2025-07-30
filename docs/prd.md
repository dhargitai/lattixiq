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

## 4. **User Flow & Features**

### **Epic 1: Onboarding & AI-Powered Roadmap Generation**

- **User Story:** As a new user, I want to define my primary growth goal so that the app can create a highly relevant, personalized learning path for me.
- **Functional Requirements:**
    1. **Goal Input:** The user will be prompted to define a goal via a simple UI. They can select from categories (e.g., "Stop Procrastinating," "Think More Clearly") or describe their goal in a free-text field.
    2. **AI-Powered Roadmap Generation:**
        - **Semantic Analysis:** The user's free-text input will be converted into a semantic vector embedding.
        - 
            
            **Content Vectorization:** All 100 mental models and the lists of cognitive biases/fallacies from the provided documents will be pre-processed into their own semantic vector embeddings. 2
            
        - **Semantic Matching:** The system will use cosine similarity to find the mental models and biases most conceptually relevant to the user's stated goal, ensuring a much more nuanced and accurate match than simple keywords.
        - **Roadmap Curation:** An algorithm will select the top 5-7 most relevant items to create a logical "LattixIQ Roadmap," prioritizing foundational concepts first.
    3. **Roadmap Visualization:** The app will display the personalized roadmap visually, with later steps blurred or locked to create a sense of progression and encourage completion.

### **Epic 2: The Core "Learn, Plan, Act, Reflect" Loop**

- **User Story:** As a learner, I want to understand a concept, create a concrete plan to apply it, and reflect on my experience to solidify my learning and unlock the next step.
- **Functional Requirements:**
    1. **Learn Screen:** Provides a concise, actionable summary of the current mental model or cognitive bias, with content sourced from the provided documents. 3 The focus is on practical application.
        
    2. **Plan Screen:**
        - For **Mental Models**, this is a structured "If-Then" form to create an **Implementation Intention**.
        - For **Cognitive Biases**, this is a "Spotting Mission" prompt (e.g., "Your mission is to observe and identify one instance of **Confirmation Bias** 4 in your own thinking or in the media today.").
            
    3. **Reflect Screen (The Application Log):** To unlock the next step, the user must complete a structured journal entry, which includes a text description of their application/observation, what they learned, and a self-rated effectiveness score (1-5).

### **Epic 3: AI-Powered Journal Analysis & Personalization (Premium)**

- **User Story:** As an engaged user, I want the app to provide intelligent insights based on my journal entries to help me understand my patterns and guide my continued growth.
- **Functional Requirements:**
    1. **Data Storage:** Each "Application Log" entry will be stored in a structured format with associated metadata.
    2. **AI Analysis of Entries:** Each text entry will be processed by an AI model to extract:
        - **Sentiment:** `Positive`, `Negative`, `Neutral`.
        - **Topics/Themes:** `Career`, `Self-Doubt`, `Productivity`, etc.
        - **Key Concepts:** `Imposter Syndrome`, `perfectionism`, `decision paralysis`.
    3. **Personalized Alerts & Recommendations:** A rule-based engine will use the structured AI analysis to provide proactive guidance.
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