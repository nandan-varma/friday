# End-to-End Tests

This directory contains comprehensive end-to-end tests for the Friday calendar application using Playwright.

## Test Structure

### Authentication Tests (`auth.spec.ts`)

- Login page functionality
- Signup page functionality
- Form validation
- Navigation between auth pages
- Protected route redirects
- Google OAuth integration

### Dashboard Tests (`dashboard.spec.ts`)

- Dashboard loading and redirects
- Navigation between sections
- AI chat page access
- Settings page access
- Main navigation functionality

### Calendar Tests (`calendar.spec.ts`)

- Calendar view loading
- View switching (month/week/day/agenda)
- Navigation controls
- Date display
- Day headers

### Event Management Tests (`events.spec.ts`)

- Event creation form
- Event validation
- Event editing
- Event deletion
- Time validation
- Recurring events
- All-day events

### AI Chat Tests (`ai-chat.spec.ts`)

- Chat interface loading
- Message sending and receiving
- Chat history persistence
- Clear chat functionality
- Input validation
- Typing indicators
- Event creation via chat
- Error handling

### Settings Tests (`settings.spec.ts`)

- Settings page loading
- Profile information display
- Profile updates
- Google Calendar integration
- Notification preferences
- Theme switching
- Privacy settings
- Account deletion
- Form validation

## Running Tests

### Prerequisites

- Node.js and npm/pnpm installed
- Application running on localhost:3000 (configured in `playwright.config.ts`)

### Commands

```bash
# Run all e2e tests
pnpm test:e2e

# Run e2e tests with UI
pnpm test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- Base URL: `http://localhost:3000`
- Automatic server startup via `npm run build && npm run start`
- HTML reports
- Screenshots on failure
- Video recording on failure (in CI)

## Authentication Setup

Most tests currently check for redirects to login when not authenticated. To run authenticated tests:

1. Set up test user accounts in your database
2. Create authentication helper functions
3. Update tests to use actual login flows

Example authentication helper:

```typescript
async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}
```

## Test Data

Tests currently use placeholder data. For full functionality testing:

1. Create test user accounts
2. Pre-populate test events
3. Set up mock AI responses
4. Configure test Google Calendar integration

## CI/CD Integration

The tests are configured to run in CI with:

- 2 retries on failure
- Single worker to avoid conflicts
- No existing server reuse
- HTML reports for debugging

## Best Practices

1. **Isolation**: Each test should be independent
2. **Data Cleanup**: Clean up test data after each test
3. **Wait Strategies**: Use explicit waits rather than timeouts
4. **Selectors**: Use semantic selectors (roles, labels) over CSS/XPath
5. **Authentication**: Mock authentication for faster, more reliable tests
6. **Visual Testing**: Consider adding visual regression tests

## Debugging

- Use `--debug` flag for step-through debugging
- Check HTML reports in `playwright-report/` directory
- Use `page.pause()` to inspect the page state
- Enable tracing with `trace: 'on'` in config

## Future Enhancements

1. **Authentication Helpers**: Create reusable login/logout functions
2. **Test Data Factories**: Generate consistent test data
3. **API Mocking**: Mock external APIs for faster tests
4. **Visual Regression**: Add visual comparison tests
5. **Performance Testing**: Add performance benchmarks
6. **Cross-browser Testing**: Test on multiple browsers
7. **Mobile Testing**: Add mobile-specific test scenarios
