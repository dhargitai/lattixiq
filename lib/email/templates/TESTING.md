# Email Template Testing Guide

## Plan Reminder Email Template Cross-Client Testing

This guide provides instructions for testing the plan reminder email template across various email clients to ensure consistent rendering and functionality.

### Test Email Clients

The template must be tested in the following email clients:

1. **Gmail** (Web and Mobile App)
2. **Outlook** (Desktop and Web)
3. **Apple Mail** (iOS and macOS)
4. **Yahoo Mail** (Web)
5. **Mobile Clients** (iOS Mail, Android Gmail)

### Testing Checklist

For each email client, verify the following:

#### Visual Rendering

- [ ] Brain emoji (🧠) displays correctly
- [ ] "LattixIQ" header is centered and visible
- [ ] Plan container has proper background and border
- [ ] IF/THEN labels are bold and colored (#6d3a9c)
- [ ] Text is readable and properly sized
- [ ] Footer tagline is visible
- [ ] Overall layout is centered with max-width of 600px

#### Mobile Responsiveness

- [ ] Email is readable without horizontal scrolling
- [ ] Text size is appropriate for mobile screens
- [ ] Plan container adapts to screen width
- [ ] Padding and spacing look good on small screens

#### Content Display

- [ ] User name appears in greeting (if provided)
- [ ] Plan trigger text displays completely
- [ ] Plan action text displays completely
- [ ] Motivational message is visible and appropriate
- [ ] Special characters render correctly (', ", &, <, >)
- [ ] Newlines/line breaks display properly

#### Security Requirements

- [ ] No external links are present
- [ ] No tracking pixels
- [ ] No JavaScript execution
- [ ] No external resource loading

### How to Test

#### 1. Generate Test Email HTML

```typescript
import { renderPlanReminder } from "@/lib/email/templates/render-plan-reminder";

// Generate test HTML with various content scenarios
const testScenarios = [
  {
    name: "Basic Mental Model",
    params: {
      planTrigger: "I notice myself procrastinating",
      planAction: "I will use the 2-minute rule",
      contentType: "mental-model",
      contentTitle: "The 2-Minute Rule",
      userName: "Test User",
    },
  },
  {
    name: "Cognitive Bias with Special Characters",
    params: {
      planTrigger: "When I'm about to judge someone's actions",
      planAction: "I'll consider their perspective & context",
      contentType: "cognitive-bias",
      contentTitle: "Attribution Bias",
      userName: "O'Connor",
    },
  },
  {
    name: "Multiline Plan",
    params: {
      planTrigger: `When I notice:
- Feeling overwhelmed
- Too many options`,
      planAction: `I will:
1. List top 3 choices
2. Pick the reversible one`,
      contentType: "fallacy",
      contentTitle: "Paradox of Choice",
    },
  },
];

// Generate HTML for each scenario
testScenarios.forEach((scenario) => {
  const result = renderPlanReminder(scenario.params);
  if (result.success) {
    // Save to file or send test email
    console.log(`Generated: ${scenario.name}`);
  }
});
```

#### 2. Send Test Emails

Use the development email testing endpoint:

```bash
# Send test email to your email address
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "type": "plan-reminder",
    "planTrigger": "Test trigger",
    "planAction": "Test action",
    "contentType": "mental-model",
    "contentTitle": "Test Model",
    "userName": "Test User"
  }'
```

#### 3. Manual Testing with Email Clients

1. **Gmail Web**
   - Open in Chrome, Firefox, and Safari
   - Check with and without images enabled
   - Test in both Default and Comfortable density settings

2. **Outlook Desktop**
   - Test in Outlook 2019, 2021, and Microsoft 365
   - Check in both Light and Dark modes
   - Verify table layout renders correctly

3. **Apple Mail**
   - Test on latest macOS and iOS versions
   - Check both portrait and landscape orientations on mobile
   - Verify with Dark Mode enabled

4. **Yahoo Mail**
   - Test in Chrome and Firefox
   - Check mobile web version

5. **Mobile Apps**
   - Gmail app on iOS and Android
   - Native iOS Mail app
   - Outlook mobile app

### Known Issues and Workarounds

#### Gmail

- May clip emails longer than 102KB
- Solution: Keep email content concise

#### Outlook

- Requires table-based layout for proper rendering
- Solution: Already implemented with nested tables

#### Apple Mail

- May have issues with certain CSS properties
- Solution: Using inline styles and email-safe CSS

#### Dark Mode

- Colors may be inverted in some clients
- Solution: Test with dark mode explicitly

### Automated Testing

Run the test suite to verify template generation:

```bash
# Run unit tests
npm run test:unit tests/unit/email/templates/plan-reminder.test.tsx

# Run integration tests
npm run test:integration tests/integration/email/plan-reminder-template.test.ts

# Run all email template tests
npm run test -- email/templates
```

### Preview Tool

For quick visual testing during development:

```typescript
import { generatePreviewHtml } from "@/lib/email/templates/render-plan-reminder";
import fs from "fs";

// Generate preview HTML
const html = generatePreviewHtml(
  "Your test trigger",
  "Your test action",
  "mental-model",
  "Test Model Name"
);

// Save to file and open in browser
fs.writeFileSync("email-preview.html", html);
// Open email-preview.html in browser
```

### Reporting Issues

If you find rendering issues in any email client:

1. Document the email client and version
2. Take a screenshot of the issue
3. Note the test scenario that caused the issue
4. Check if the issue is reproducible
5. Report in the project issue tracker

### Email Client Compatibility Matrix

| Feature       | Gmail Web | Gmail App | Outlook Desktop | Outlook Web | Apple Mail | Yahoo Mail |
| ------------- | --------- | --------- | --------------- | ----------- | ---------- | ---------- |
| Brain Emoji   | ✅        | ✅        | ✅              | ✅          | ✅         | ✅         |
| Inline Styles | ✅        | ✅        | ✅              | ✅          | ✅         | ✅         |
| Table Layout  | ✅        | ✅        | ✅              | ✅          | ✅         | ✅         |
| Max Width     | ✅        | ✅        | ✅              | ✅          | ✅         | ✅         |
| Border Radius | ✅        | ✅        | ⚠️              | ✅          | ✅         | ✅         |
| Box Shadow    | ✅        | ✅        | ❌              | ✅          | ✅         | ✅         |

Legend:

- ✅ Full support
- ⚠️ Partial support (may have minor issues)
- ❌ Not supported (graceful degradation applied)
