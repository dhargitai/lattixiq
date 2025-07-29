# **11. Testing Strategy**

Our approach to testing is designed to build confidence with every commit, ensure quality, and enable rapid, safe iteration.

## **Testing Philosophy**

- **Approach: Test-Driven Development (TDD):** All new functionality will be developed following the TDD `Red-Green-Refactor` cycle.
    1. **Red:** Write a failing test that clearly defines the desired functionality or bug fix.
    2. **Green:** Write the simplest possible application code to make the test pass.
    3. **Refactor:** Clean up and optimize the application code, ensuring all tests continue to pass.
- **Guiding Principle (Kent C. Dodds):** We will follow the principle: *"Write tests. Not too many. Mostly integration."* This means we will prioritize tests that simulate real user interactions and provide high confidence, while using unit tests more sparingly for complex, isolated business logic.

## **Test Types and Organization**

- **Integration Tests (`/tests/integration/`):** This is the foundation of our test suite. These tests will verify that different parts of our application work together as intended. We will use **Vitest** and **React Testing Library**.
    - **Frontend:** We will test component interactions. For example, simulating a user filling out the "Reflect" form and clicking "Submit," then asserting that the correct API call was made.
    - **Backend:** We will test our API Routes by sending mock HTTP requests and asserting that they return the correct response and that the database was changed appropriately.
- **Unit Tests (`/tests/unit/`):** These will be used for pure, complex business logic that can be tested in isolation, such as a utility function for analyzing text or a complex state management hook.
- **End-to-End (E2E) Tests (`/tests/e2e/`):** These are our highest-level tests. Using **Playwright**, we will automate a real browser to verify critical user flows from start to finish. For V1, we will have E2E tests for:
    1. The complete User Registration & First Roadmap Creation flow.
    2. The full "Learn, Plan, Act, Reflect" loop for a single roadmap step.

## **Sandboxed Test Environment**

To meet the requirement of running tests securely without sensitive data, we will implement the following:

- **Mocked Services:** All external services will be mocked during testing. The Stripe API, Notification Service, and AI Service calls will be intercepted using **Mock Service Worker (MSW)** for frontend tests and **Vitest's built-in mocking** for backend tests.
- **Test Database:** All tests will run against a separate, dedicated test database in Supabase. The connection string for this database will be provided via a `.env.test` file, which is never committed to source control.
- **Environment Variables:** All secrets and API keys will be managed through environment variables. The `.env.test` file will contain only mock or safe credentials. Our CI pipeline on GitHub Actions will be configured to use these test variables.

## **Happy and Unhappy Path Coverage**

It is a strict requirement that tests are written for both successful and failure scenarios. Every feature must include tests that verify correct behavior when things go wrong.

- **Test Case Structure:** Test files will be structured to clearly separate these paths.
    
    ```tsx
    // Example for a test file in /tests/integration/api/roadmaps.test.ts
    
    describe('POST /api/roadmaps', () => {
    
      // --- Happy Path ---
      it('should create a roadmap and return 201 for an authenticated user with a valid goal', () => {
        // Test logic here
      });
    
      // --- Unhappy Paths ---
      it('should return 401 Unauthorized if no user is logged in', () => {
        // Test logic here
      });
    
      it('should return 400 Bad Request if the goalDescription is missing or too short', () => {
        // Test logic here
      });
    
      it('should return 500 Internal Server Error if the database fails', () => {
        // Test logic here
      });
    });
    ```
    
