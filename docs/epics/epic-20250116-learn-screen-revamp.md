# Epic: Learn Screen Revamp - "Crystallize & Apply" Model

**Epic ID:** EPIC-20250116-001  
**Created:** 2025-01-16  
**Status:** Planning  
**Priority:** High

## Executive Summary

Revamp the Learn screen experience to implement the "Crystallize & Apply" model, transforming abstract mental model concepts into immediately actionable knowledge through a structured, engaging, and personalized learning flow.

## Problem Statement

The current Learn screen lacks the "wow factor" that demonstrates the real potential of each mental model. Users need a more compelling, personalized experience that bridges the gap between theoretical understanding and practical application.

## Goals & Success Criteria

### Primary Goals

1. **Increase Engagement**: Create a "wow factor" that keeps users engaged through the entire learning experience
2. **Improve Comprehension**: Use proven learning science principles (contextualization, elaboration, concrete examples)
3. **Accelerate Application**: Move users from abstract understanding to concrete application in a single flow
4. **Enhance Personalization**: Provide goal-specific examples that make knowledge immediately relevant

### Success Metrics

- Increased time spent on Learn screens
- Higher completion rates for learning → planning flow transitions
- Improved user feedback scores on learning experience
- Reduced drop-off between learning and planning phases

## Solution Overview: The "Crystallize & Apply" Model

The new model structures each knowledge piece into 8 carefully designed sections that guide users from initial interest to actionable insight:

### Learning Science Foundation

- **Contextual Learning**: Anchor concepts in familiar experiences
- **Chunking & Dual Coding**: Combine text with strong conceptual imagery
- **Concrete Examples**: Progress from abstract to personally relevant scenarios
- **Motivation Theory**: Leverage both loss aversion and potential gains

## Detailed Screen Specifications

### Desktop Layout

```ascii
┌────────────────────────────────────────────────────────────┐
│ [<] Learn • Thought Experiments              Step 2 of 5   │
│ ────────────────────────────────────────────────────────── │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │                    💭 THE HOOK                    │    │
│   │                  (Large, 24px font)               │    │
│   │  "What if you could test your wildest theories   │    │
│   │   without risking a single dollar or minute?"    │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │                 VISUAL METAPHOR                   │    │
│   │         ╔═══════════════════════════╗            │    │
│   │         ║   [Lightbulb Laboratory]  ║            │    │
│   │         ║      Animated/Static      ║            │    │
│   │         ║        400x300px          ║            │    │
│   │         ╚═══════════════════════════╝            │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │                  UNDERSTAND IT                    │    │
│   │                                                   │    │
│   │  Thought experiments are mental simulations...   │    │
│   │                                                   │    │
│   │  🧠 Like a flight simulator for ideas           │    │
│   │                                                   │    │
│   │  ╔═══════════════════════════════════════════╗   │    │
│   │  ║ 🎯 When reality is too risky, your        ║   │    │
│   │  ║    imagination becomes your laboratory     ║   │    │
│   │  ╚═══════════════════════════════════════════╝   │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │              SEE IT → USE IT → OWN IT            │    │
│   │  ┌──────────┬──────────┬────────────────────┐   │    │
│   │  │ Classic  │  Modern  │  ✨ YOUR SCENARIO  │   │    │
│   │  └──────────┴──────────┴────────────────────┘   │    │
│   │                                                   │    │
│   │  ┌────────────────────────────────────────────┐ │    │
│   │  │          ✨ MADE FOR YOUR GOAL             │ │    │
│   │  │                                            │ │    │
│   │  │  Since you want to "stop procrastinating   │ │    │
│   │  │  on big projects", here's how Thought      │ │    │
│   │  │  Experiments can help:                     │ │    │
│   │  │                                            │ │    │
│   │  │  Before starting that daunting report,     │ │    │
│   │  │  mentally walk through: "What if I just   │ │    │
│   │  │  write the first paragraph? What would     │ │    │
│   │  │  that feel like? What if I discover it's  │ │    │
│   │  │  easier than expected?"                   │ │    │
│   │  └────────────────────────────────────────────┘ │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │                 STAKES & REWARDS                  │    │
│   │  ┌────────────────────┬────────────────────┐    │    │
│   │  │    ⚠️ PITFALL       │    🎯 PAYOFF       │    │    │
│   │  ├────────────────────┼────────────────────┤    │    │
│   │  │ Without this, you   │ Master this and    │    │    │
│   │  │ learn through       │ explore impossible │    │    │
│   │  │ costly trial &      │ scenarios safely,  │    │    │
│   │  │ error               │ finding insights   │    │    │
│   │  └────────────────────┴────────────────────┘    │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │  🔗 POWER COMBO (Step 3+ only)                   │    │
│   │  Combine Thought Experiments + Inversion for... │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │         [📖 Dive Deeper] ▼                       │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │  Ready to put Thought Experiments into action    │    │
│   │  for your procrastination challenge?             │    │
│   │                                                   │    │
│   │          [ Start Planning → ]                    │    │
│   └──────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```ascii
┌─────────────────────┐
│ [<] Learn  [2 of 5] │
│ ─────────────────── │
│  Thought Experiments│
│                     │
│ ┌─────────────────┐ │
│ │   💭 THE HOOK   │ │
│ │  "What if you   │ │
│ │  could test..." │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │  [Visual Image] │ │
│ │   (Full width)  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │  UNDERSTAND IT  │ │
│ │  Definition...  │ │
│ │  🧠 Analogy...  │ │
│ │ ┌─────────────┐ │ │
│ │ │ 🎯 TAKEAWAY │ │ │
│ │ └─────────────┘ │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ SEE→USE→OWN IT  │ │
│ │ [Swipeable tabs]│ │
│ │ ● ○ ○           │ │
│ │                 │ │
│ │ ✨ YOUR SCENARIO│ │
│ │ Personalized... │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │   ⚠️ PITFALL    │ │
│ │   Learn through │ │
│ │   costly errors │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │   🎯 PAYOFF     │ │
│ │   Safe insight  │ │
│ │   exploration   │ │
│ └─────────────────┘ │
│                     │
│ [📖 Dive Deeper ▼]  │
│                     │
│ ┌─────────────────┐ │
│ │ [Start Planning] │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### Expanded "Dive Deeper" Section

#### Desktop - Expanded State

```ascii
┌──────────────────────────────────────────────────────┐
│              📖 DIVE DEEPER ▲                        │
│ ┌──────────────────────────────────────────────────┐│
│ │  ┌───────────────┬────────────────────────────┐  ││
│ │  │ HOW IT WORKS  │  THE ORIGIN STORY          │  ││
│ │  │ [Tab Active]  │  [Tab]                     │  ││
│ │  └───────────────┴────────────────────────────┘  ││
│ │                                                   ││
│ │  🧠 The Mechanism                                ││
│ │  ─────────────────                               ││
│ │  Thought experiments work by engaging multiple   ││
│ │  cognitive systems simultaneously. They          ││
│ │  activate your visual cortex for mental         ││
│ │  imagery, your prefrontal cortex for abstract   ││
│ │  reasoning...                                    ││
│ │                                                   ││
│ │  Evolution gave us this because our ancestors    ││
│ │  who could imagine "what if the tiger attacks    ││
│ │  from the left?" survived better.                ││
│ │                                                   ││
│ │  ┌────────────────────────────────────────────┐ ││
│ │  │     ⚠️ ADVANCED PITFALLS & NUANCES         │ ││
│ │  │                                            │ ││
│ │  │  • Bias Contamination: Your experiments    │ ││
│ │  │    are only as unbiased as your mind      │ ││
│ │  │                                            │ ││
│ │  │  • Oversimplification Trap: Reality has    │ ││
│ │  │    friction that pure logic misses         │ ││
│ │  └────────────────────────────────────────────┘ ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │         📚 ADDITIONAL RESOURCES                  ││
│ │         (Custom content if needed)               ││
│ │  ┌────────────────────────────────────────────┐ ││
│ │  │  Related Reading:                          │ ││
│ │  │  • Einstein's Thought Experiments          │ ││
│ │  │  • Mental Models for Decision Making       │ ││
│ │  │                                            │ ││
│ │  │  Practice Exercise:                        │ ││
│ │  │  Try this 5-minute thought experiment...   │ ││
│ │  └────────────────────────────────────────────┘ ││
│ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

#### Mobile - Expanded State

```ascii
┌─────────────────────┐
│  📖 DIVE DEEPER ▲   │
│ ┌─────────────────┐ │
│ │ [Accordion Menu] │ │
│ │                 │ │
│ │ ▼ How It Works  │ │
│ │   Content...    │ │
│ │                 │ │
│ │ ▶ Origin Story  │ │
│ │                 │ │
│ │ ▼ Pitfalls      │ │
│ │   • Bias trap   │ │
│ │   • Oversimplify│ │
│ │                 │ │
│ │ ▶ Learn More    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## Content Structure Details

### 1. The Hook: "You Are Here" Moment

**Purpose**: Anchor abstract concepts in familiar, real-world experiences
**Content**: Short, engaging anecdote or provocative question
**Learning Science**: Contextual learning for easier encoding

**Example**:

> "Ever noticed how after you buy a new car, you suddenly see that same model everywhere? Let's talk about why."

### 2. The Core Concept: "Nutshell" Explanation

**Purpose**: Crystal-clear, concise definition
**Components**:

- **Definition**: 1-2 sentence explanation in simple language
- **Analogy/Metaphor**: Powerful conceptual tool
- **Key Takeaway**: Bold, tweet-sized summary

**Example**:

> **Definition**: Thought experiments are mental simulations that allow you to logically test scenarios, explore possibilities, and solve problems that would be difficult, expensive, or impossible to perform in real life.
>
> **Analogy**: Think of your mind as a flight simulator for ideas—you can crash a thousand virtual planes to learn how to fly without ever leaving the ground.
>
> **Key Takeaway**: **When reality is too risky or expensive to test, your imagination becomes your laboratory.**

### 3. Application Spectrum: "See It, Use It, Own It"

**Purpose**: Bridge theory to practice with increasing relevance
**Components**:

- **Classic Example**: Well-known formal example
- **Modern Example**: Everyday modern life scenario
- **Personalized Example**: LLM-generated based on user's roadmap goal

**Example Personalized Content**:

> **User Goal**: "I want to stop procrastinating on my big projects at work."
>
> **Personalized Example**: You're staring at your report, feeling overwhelmed. **Your 'Activation Energy' plan could be this: IF it's 9 AM, THEN I will simply open the document and write one single sentence.** That's it. The goal isn't to finish the report, but to make the first step so easy it's impossible _not_ to do.

### 4. "Why It Matters": Pitfalls & Payoffs

**Purpose**: State stakes and motivate action
**Components**:

- **Pitfall**: Negative consequence when ignored
- **Payoff**: Benefit when applied

**Example**:

> **Pitfall**: Without thought experiments, you're forced to learn expensive lessons through trial and error, making costly mistakes that could have been avoided through mental simulation.
>
> **Payoff**: Using thought experiments lets you explore dangerous, expensive, or impossible scenarios safely, leading to breakthrough insights and better decisions before you act.

### 5. Visual Metaphor

**Purpose**: Memorable visual anchor for the concept
**Content**: Image/diagram that reinforces the mental model
**Learning Science**: Dual coding (visual + text processing)

### 6. Bridge to Action

**Purpose**: Smooth transition to next step in user flow
**Content**: Static encouraging text with conditional button behavior
**Conditional Logic**:

- **No Plan Exists**: Button reads `[ Start Planning → ]` and navigates to Plan Screen
- **Plan Already Created**: Button reads `[ Back to Reflection → ]` and navigates to Reflect Screen

**Example Text**: "Ready to put this into action for your goal?"
**Note**: This maintains existing flow logic where users who return to Learn Screen to refresh their memory can quickly return to reflection without re-planning.

### 7. Combining Models Tip (Steps 3+ Only)

**Purpose**: Show synergistic effects between mental models
**Process**:

1. Analyze current step and preceding steps in roadmap
2. Identify 1-2 models with powerful synergistic effects
3. Write tactical paragraph explaining combination strategy

**Example**:

> You can supercharge **Thought Experiments** by pairing it with **Inversion**. Instead of just imagining what success looks like, also imagine all the ways your plan could fail. This gives you both the confidence to act and the wisdom to avoid pitfalls.

### 8. Dive Deeper Content

**Purpose**: Optional detailed exploration for engaged users
**Components**:

- **How It Works**: Cognitive mechanisms and evolutionary origins
- **Origin Story**: Historical development and key figures
- **Advanced Pitfalls & Nuances**: Sophisticated understanding of limitations
- **Additional Resources**: Custom markdown content (optional)

## Technical Requirements

### Database Schema Changes

#### Knowledge Content Table Extensions

```sql
-- Add new fields to knowledge_content table
ALTER TABLE knowledge_content ADD COLUMN hook TEXT;
ALTER TABLE knowledge_content ADD COLUMN definition TEXT;
ALTER TABLE knowledge_content ADD COLUMN analogy_or_metaphor TEXT;
ALTER TABLE knowledge_content ADD COLUMN key_takeaway TEXT;
ALTER TABLE knowledge_content ADD COLUMN classic_example TEXT;
ALTER TABLE knowledge_content ADD COLUMN modern_example TEXT;
ALTER TABLE knowledge_content ADD COLUMN pitfall TEXT;
ALTER TABLE knowledge_content ADD COLUMN payoff TEXT;
ALTER TABLE knowledge_content ADD COLUMN visual_metaphor TEXT; -- Prompt for image generation
ALTER TABLE knowledge_content ADD COLUMN visual_metaphor_url TEXT; -- Optional pre-generated image URL
ALTER TABLE knowledge_content ADD COLUMN dive_deeper_mechanism TEXT;
ALTER TABLE knowledge_content ADD COLUMN dive_deeper_origin_story TEXT;
ALTER TABLE knowledge_content ADD COLUMN dive_deeper_pitfalls_nuances TEXT;
ALTER TABLE knowledge_content ADD COLUMN super_model BOOLEAN DEFAULT false;
ALTER TABLE knowledge_content ADD COLUMN extra_content TEXT; -- Long markdown content
```

#### Roadmap Steps Table Extensions

```sql
-- Add personalized content fields to roadmap_steps table
ALTER TABLE roadmap_steps ADD COLUMN personalized_example TEXT; -- LLM-generated
ALTER TABLE roadmap_steps ADD COLUMN combine_with_models TEXT[]; -- Array of model names
```

### Frontend Implementation

#### Component Architecture

- **LearnScreen**: Main container component
- **ContentSection**: Reusable section wrapper
- **ProgressiveDisclosure**: Expandable content container
- **ExampleTabs**: Swipeable tabs for See/Use/Own examples
- **PitfallPayoffCards**: Responsive card layout
- **DeepDiveAccordion**: Collapsible detailed content

#### Responsive Design Patterns

- **Desktop**: Side-by-side layouts, hover states, tabbed content
- **Mobile**: Vertical stack, swipe gestures, accordion sections
- **Progressive Enhancement**: Core content accessible without JavaScript

#### State Management

- Content fetching via React Query
- UI state (expanded sections, active tabs) via local state
- Progress tracking via Zustand store

## Implementation Timeline

### Phase 1: Database & Content Migration (Week 1)

- [ ] Create database migration
- [ ] Update TypeScript types
- [ ] Migrate existing content to new schema
- [ ] Create content seeding scripts

### Phase 2: Core UI Components (Week 2)

- [ ] Build responsive layout components
- [ ] Implement progressive disclosure
- [ ] Create swipeable example tabs
- [ ] Add pitfall/payoff cards

### Phase 3: Content Integration (Week 3)

- [ ] Integrate with knowledge content API
- [ ] Implement personalized example generation
- [ ] Add combining models logic
- [ ] Test responsive layouts

### Phase 4: Polish & Testing (Week 4)

- [ ] Add animations and micro-interactions
- [ ] Implement visual metaphor display
- [ ] User testing and feedback integration
- [ ] Performance optimization

## Risk Mitigation

### Content Quality Risk

**Risk**: Poor quality personalized examples reduce user experience
**Mitigation**:

- Robust LLM prompts with examples
- Fallback to generic examples if personalization fails
- Content review process for static examples

### Performance Risk

**Risk**: Large content sections slow page load
**Mitigation**:

- Lazy load deep dive content
- Optimize images and visual metaphors
- Progressive content rendering

### Mobile UX Risk

**Risk**: Complex desktop layout doesn't work well on mobile
**Mitigation**:

- Mobile-first design approach
- Extensive mobile testing
- Progressive enhancement strategy

## Success Metrics & Monitoring

### Engagement Metrics

- Time spent on Learn screens (target: +50%)
- Scroll depth through content sections
- Deep dive content expansion rates
- Example tab interaction rates

### Learning Effectiveness

- Learn → Plan transition rate (target: +30%)
- User comprehension self-assessment scores
- Content section completion rates
- Personalized example quality ratings

### Technical Metrics

- Page load performance
- Mobile responsiveness scores
- Content delivery optimization
- Error rates for dynamic content generation

## Dependencies

### External Dependencies

- LLM API for personalized example generation
- Image generation/storage for visual metaphors
- Performance monitoring tools

### Internal Dependencies

- Updated database schema
- Content migration scripts
- Design system components
- Testing infrastructure

## Future Considerations

### V2 Enhancements

- Interactive visual metaphors
- Video content integration
- Audio narration options
- Adaptive difficulty based on user progress

### Localization Support

- Multi-language content structure
- Cultural adaptation of examples
- Right-to-left layout support

### Analytics Integration

- Learning pattern analysis
- Content effectiveness measurement
- Personalization quality tracking

---

**Stakeholders**: Product, Engineering, Design, Content  
**Next Review**: Weekly during implementation phases  
**Documentation**: Living document, updated based on implementation learnings
