# 4. **User Flow & Features**

## **Epic 1: Onboarding & AI-Powered Roadmap Generation**

- **User Story:** As a new user, I want to define my primary growth goal so that the app can create a highly relevant, personalized learning path for me.
- **Functional Requirements:**
    1. **Goal Input:** The user will be prompted to define a goal via a simple UI. They can select from categories (e.g., "Stop Procrastinating," "Think More Clearly") or describe their goal in a free-text field.
    2. **AI-Powered Roadmap Generation:**
        - **Semantic Analysis:** The user's free-text input will be converted into a semantic vector embedding.
        - **Content Vectorization:** All 100 mental models and the lists of cognitive biases/fallacies from the provided documents will be pre-processed into their own semantic vector embeddings.

        - **Semantic Matching:** The system will use cosine similarity to find the mental models and biases most conceptually relevant to the user's stated goal, ensuring a much more nuanced and accurate match than simple keywords.
        - **Roadmap Curation:** An algorithm will select the top 5-7 most relevant items to create a logical "Growth Roadmap," prioritizing foundational concepts first.
    3. **Roadmap Visualization:** The app will display the personalized roadmap visually, with later steps blurred or locked to create a sense of progression and encourage completion.

## **Epic 2: The Core "Learn, Plan, Act, Reflect" Loop**

- **User Story:** As a learner, I want to understand a concept, create a concrete plan to apply it, and reflect on my experience to solidify my learning and unlock the next step.
- **Functional Requirements:**
    1. 
        
        **Learn Screen:** Provides a concise, actionable summary of the current mental model or cognitive bias, with content sourced from the provided documents. 3 The focus is on practical application.
        
    2. **Plan Screen:**
        - For **Mental Models**, this is a structured "If-Then" form to create an **Implementation Intention**.
        - For **Cognitive Biases**, this is a "Spotting Mission" prompt (e.g., "Your mission is to observe and identify one instance of **Confirmation Bias** 4 in your own thinking or in the media today.").
            
    3. **Reflect Screen (The Application Log):** To unlock the next step, the user must complete a structured journal entry, which includes a text description of their application/observation, what they learned, and a self-rated effectiveness score (1-5).

## **Epic 3: AI-Powered Journal Analysis & Personalization (Premium)**

- **User Story:** As an engaged user, I want the app to provide intelligent insights based on my journal entries to help me understand my patterns and guide my continued growth.
- **Functional Requirements:**
    1. **Data Storage:** Each "Application Log" entry will be stored in a structured format with associated metadata.
    2. **AI Analysis of Entries:** Each text entry will be processed by an AI model to extract:
        - **Sentiment:** `Positive`, `Negative`, `Neutral`.
        - **Topics/Themes:** `Career`, `Self-Doubt`, `Productivity`, etc.
        - **Key Concepts:** `Imposter Syndrome`, `perfectionism`, `decision paralysis`.
    3. **Personalized Alerts & Recommendations:** A rule-based engine will use the structured AI analysis to provide proactive guidance.
        - *Example:* `IF Topic = 'Self-Doubt' AND Sentiment = 'Negative' for >2 entries in a week, THEN suggest a new roadmap on 'Building Confidence' featuring models like 'Excessive Self-Regard Tendency'.`
