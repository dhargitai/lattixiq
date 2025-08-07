# Epic 4: Premium Gating & Testimonials (MVP)

## Epic Overview

**Title:** Basic Premium Gating After First Roadmap
**Priority:** High - Core MVP functionality
**Estimated Duration:** 1 sprint (2 weeks)
**Dependencies:** Epics 1-3 must be complete (need roadmap completion flow)

## Epic Description

Implement basic premium gating that allows users to complete their first roadmap for free, then requires subscription for additional roadmaps. Includes testimonial feature that grants one additional roadmap as a reward for leaving feedback.

## Acceptance Criteria

- [ ] Users can create and complete one roadmap without subscription
- [ ] After first roadmap completion, users see subscription CTA instead of "Create New Roadmap"
- [ ] /new-roadmap, /learn/_, /plan/_, /reflect/\* paths redirect to /toolkit if user has roadmaps but no subscription
- [ ] Testimonial modal offers one additional roadmap for feedback
- [ ] Payment flow integrated with Stripe
- [ ] Subscription status properly tracked and enforced

## User Stories

### Story 4.1: Implement Stripe Payment Integration

**As a** user  
**I want** to upgrade to premium  
**So that** I can create additional roadmaps after my first one

**Acceptance Criteria:**

- [ ] Stripe checkout integrated with latest SDK
- [ ] Uses environment variables for product IDs (STRIPE_MONTHLY_PRODUCT_ID, STRIPE_ANNUAL_PRODUCT_ID)
- [ ] Checkout callback path handles subscription verification
- [ ] Subscription status tracked in database
- [ ] Success/failure messages displayed on toolkit page after checkout
- [ ] Webhook handling for subscription lifecycle events

**Technical Tasks:**

1. Install latest Stripe SDK: `npm install stripe @stripe/stripe-js@latest`
2. Set up environment variables in `.env.local`:
   ```env
   # Stripe configuration (values to be populated by product owner)
   STRIPE_SECRET_KEY=[your-stripe-secret-key]
   STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]
   STRIPE_MONTHLY_PRODUCT_ID=[your-monthly-product-id]
   STRIPE_ANNUAL_PRODUCT_ID=[your-annual-product-id]
   STRIPE_WEBHOOK_SECRET=[your-webhook-secret]
   ```
3. Implement `/app/api/checkout/route.ts`:
   - Create Stripe checkout session with product ID from env
   - Set success_url to `/api/checkout/callback?session_id={CHECKOUT_SESSION_ID}`
   - Set cancel_url to `/toolkit?canceled=true`
4. Implement `/app/api/checkout/callback/route.ts`:
   - Verify checkout session with Stripe
   - Update user subscription status in database
   - Redirect to `/toolkit` with success message
5. Implement `/app/api/webhooks/stripe/route.ts`:
   - Handle customer.subscription.created
   - Handle customer.subscription.updated
   - Handle customer.subscription.deleted
   - Update database subscription status
6. Add to user profile schema:
   ```sql
   - stripe_customer_id
   - stripe_subscription_id
   - subscription_status (active/canceled/past_due)
   - subscription_current_period_end
   ```
7. Create `/lib/stripe/client.ts` and `/lib/stripe/utils.ts` for helper functions

**Story Points:** 13

---

### Story 4.2: Create Basic Premium Gates with Dialog CTA

**As a** product owner  
**I want** premium features properly gated after first roadmap  
**So that** users are encouraged to subscribe

**Acceptance Criteria:**

- [ ] First roadmap creation and completion always free
- [ ] After first roadmap completion, "See what you'll get with Premium" button replaces "Create New Roadmap"
- [ ] Button opens dialog with premium benefits from database
- [ ] Dialog includes CTA to Stripe checkout for monthly subscription
- [ ] /new-roadmap redirects to /toolkit if user has roadmaps but no subscription
- [ ] Premium content editable in database without deployment

**Technical Tasks:**

1. Create generic content blocks table:
   ```sql
   content_blocks:
   - id (uuid, primary key)
   - content_id (text, unique, indexed) -- slug identifier
   - content (text) -- markdown content
   - metadata (jsonb, nullable) -- optional structured data
   - created_at (timestamp)
   - updated_at (timestamp)
   - published (boolean, default true)
   ```
2. Seed initial content blocks:

   ```sql
   INSERT INTO content_blocks (content_id, content) VALUES
   ('premium-benefits-modal', '
   ## Unlock Your Full Potential with Premium

   - ✨ **Unlimited Mental Model Learning** - Continue your journey without limits
   - 🧠 **Get Wiser & Think Clearer** - Master cognitive tools that transform your thinking
   - 🎯 **Solve Problems More Effectively** - Apply proven mental models to real challenges
   - 🚀 **Get Ahead in Life** - Gain the edge successful people use daily
   - 📊 **Personalized Recommendations** - AI-powered suggestions based on your progress
   - 🔍 **Pattern Insights & Analysis** - Discover your thinking patterns and growth areas
   ');

   -- Example future content blocks:
   -- ('testimonial-request-modal', '...')
   -- ('onboarding-welcome', '...')
   -- ('roadmap-completion-message', '...')
   ```

3. Create `/lib/subscription/check-limits.ts`:
   ```typescript
   -checkCanCreateRoadmap(userId) -
     hasCompletedFreeRoadmap(userId) -
     hasActiveSubscription(userId) -
     getTestimonialBonus(userId);
   ```
4. Create `/components/features/subscription/PremiumBenefitsDialog.tsx`:
   - Fetch content using content_id: 'premium-benefits-modal'
   - Render markdown content
   - "Get Premium Access" button that calls Stripe checkout
   - Clean, compelling design
5. Update `/app/(app)/toolkit/page.tsx`:
   - Check if user has completed first roadmap and no subscription
   - Show "See what you'll get with Premium" button
   - Button opens PremiumBenefitsDialog
6. Create `/app/api/content-blocks/[contentId]/route.ts`:
   - GET endpoint to fetch content by content_id
   - Cached for performance
   - Returns 404 if content_id not found or not published
7. Create content helper utilities `/lib/content/utils.ts`:
   ```typescript
   - getContentBlock(contentId: string)
   - updateContentBlock(contentId: string, content: string)
   - listContentBlocks() // for admin purposes
   ```
8. Add route guards to `/app/(app)/new-roadmap/page.tsx`:
   - Check subscription limits
   - Redirect to `/toolkit` with query param if not allowed
9. Update database schema for user stats:
   ```sql
   - roadmap_count in user profiles
   - free_roadmaps_used boolean
   - testimonial_bonus_used boolean
   ```

**Story Points:** 8

---

### Story 4.3: Implement Testimonial Reward System

**As a** user  
**I want** to get an additional roadmap for leaving a testimonial  
**So that** I can continue learning before committing to subscription

**Acceptance Criteria:**

- [ ] Testimonial modal appears after first roadmap completion
- [ ] Clearly states this is a one-time offer
- [ ] Grants one additional roadmap upon testimonial submission
- [ ] Modal can be dismissed (offer expires)
- [ ] Testimonial stored in database
- [ ] Can't be exploited for multiple bonuses

**Technical Tasks:**

1. Create testimonials table:
   ```sql
   testimonials:
   - id
   - user_id
   - content
   - rating (1-5)
   - roadmap_id (which roadmap they completed)
   - created_at
   - published (boolean for moderation)
   ```
2. Create `/components/features/testimonial/TestimonialModal.tsx`:
   - Appears on roadmap completion (first roadmap only)
   - Form with rating and text feedback
   - "One-time offer" messaging
   - Submit or skip buttons
3. Implement `/app/api/testimonials/route.ts`:
   - POST endpoint to save testimonial
   - Grant additional roadmap credit
   - Mark testimonial_bonus_used in user record
4. Update roadmap completion flow:
   - Check if first roadmap
   - Show testimonial modal before toolkit redirect
   - Track if user dismissed offer
5. Add testimonial bonus check to roadmap creation limits
6. Create admin view for testimonial moderation (basic list view)

**Story Points:** 8

---

### Story 4.4: Subscription Management in Settings

**As a** premium user  
**I want** to manage my subscription  
**So that** I can view and control my premium access

**Acceptance Criteria:**

- [ ] Settings page shows current subscription status
- [ ] Active subscribers can access Stripe billing portal
- [ ] Clear display of subscription period and renewal date
- [ ] Cancellation redirects to Stripe portal
- [ ] Subscription status syncs with Stripe webhooks

**Technical Tasks:**

1. Update `/app/(app)/settings/billing/page.tsx`:
   - Display subscription status (Free/Premium)
   - Show current period end date if subscribed
   - "Manage Subscription" button for Stripe portal
2. Implement `/app/api/billing-portal/route.ts`:
   - Create Stripe billing portal session
   - Redirect to Stripe customer portal
   - Return URL set to settings page
3. Create `/components/features/settings/BillingSection.tsx`:
   - Subscription status badge (Free/Premium)
   - Next billing date if applicable
   - Manage/Upgrade button based on status
4. Add subscription status helper:
   ```typescript
   // /lib/subscription/status.ts
   -getSubscriptionStatus(userId) - formatSubscriptionPeriod(date) - isSubscriptionActive(status);
   ```
5. Ensure webhook handling updates UI:
   - Real-time status updates
   - Handle grace periods
   - Clear messaging for expired subscriptions

**Story Points:** 5

---

## Epic Summary

**Total Story Points:** 34 (reduced from 71)
**Critical Path:** Payment integration (4.1) → Premium gates (4.2) → Testimonial system (4.3) → Settings integration (4.4)
**Risk Areas:**

- Payment integration testing
- Edge cases in gating logic
- Testimonial system abuse prevention
- Webhook reliability

**Success Metrics:**

- 30% of users complete first roadmap
- 20% leave testimonials for bonus roadmap
- 15% convert to paid after first roadmap
- 0% can exploit system for unlimited free roadmaps

**Testing Requirements:**

- Payment flow end-to-end testing with Stripe test mode
- Gate logic with various user states
- Testimonial submission and bonus granting
- Webhook event handling
- Subscription status synchronization
- Database content fetching and caching

**Implementation Notes:**

1. **Stripe Setup:**
   - Product IDs managed via environment variables
   - Products created directly in Stripe Dashboard
   - Monthly subscription as primary offering
   - Annual option available but not emphasized initially

2. **Premium CTA Flow:**
   - Dialog-based approach for better UX
   - Content stored in database for easy updates
   - Direct to Stripe checkout (no intermediate pricing page)
   - Success callback handles subscription verification

3. **Database-Driven Content:**
   - Generic `content_blocks` table for all dynamic content
   - Content identified by unique `content_id` slugs
   - Cached API endpoint for performance
   - Admin can update without deployment
   - Extensible for future content needs (testimonials, onboarding, etc.)

4. **User Experience:**
   - Clear value proposition in dialog
   - Smooth checkout → callback → toolkit flow
   - Status messages confirm subscription state
   - Settings page for subscription management

5. **Security Considerations:**
   - Webhook signature verification
   - Server-side subscription checks
   - No client-side subscription status trust

6. **Stripe Integration References:**
   - Use Context7 to get latest Stripe SDK patterns
   - Follow Stripe's Next.js integration guide
   - Implement proper error handling for all payment flows
   - Use Stripe Elements for PCI compliance if custom forms needed

7. **Content Blocks Usage Pattern:**

   ```typescript
   // Example usage in component
   const { data: content } = await fetch("/api/content-blocks/premium-benefits-modal");

   // Potential content_id values:
   // 'premium-benefits-modal' - Premium features list
   // 'testimonial-request-modal' - Testimonial prompt content
   // 'onboarding-welcome' - Welcome message for new users
   // 'roadmap-completion-congrats' - Completion celebration message
   // 'subscription-success' - Post-payment success message
   // 'subscription-canceled' - Cancellation confirmation
   ```

## Removed Features (Moved to Epic 7)

The following advanced features have been postponed to Epic 7 for post-MVP development:

- AI Journal Analysis Pipeline (Story 4.2)
- Insights Dashboard (Story 4.3)
- Pattern Detection (Story 4.4)
- Personalized Recommendations (Story 4.5)
- Weekly Insights Email (Story 4.7)
- Advanced Analytics Tracking (Story 4.8)
