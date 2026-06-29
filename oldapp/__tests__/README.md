# Scheduler App Tests

This directory contains the test suite for the scheduler application.

## Testing Strategy

The tests are organized into several categories:

### Store Tests
Located in `__tests__/store/` - These test the Zustand store functionality, including:
- State initialization
- State updates
- Day/lesson management
- Deduplication logic

### Component Tests
Located in `__tests__/components/` - These test React components, including:
- Rendering
- Prop handling
- User interactions
- State management

### Database Tests
Located in `__tests__/lib/database/` - These test database operations, including:
- Error handling
- Retry mechanisms
- Lock detection

## Running the Tests

To run all tests:
```
npm test
```

To run tests in watch mode (re-runs when files change):
```
npm run test:watch
```

To run a specific test file:
```
npm run test:file path/to/test-file.test.ts
```

To generate coverage reports:
```
npm run test:coverage
```

## Key Test Areas

1. **Duplicate Key Prevention**: Testing the logic that prevents duplicate keys in various components.

2. **Error Handling**: Testing robust error handling for database operations.

3. **State Management**: Testing proper state initialization, updates, and cleanup.

4. **Server-Side Data Loading**: Testing server-side data loading vs client-side fallbacks.

## Mock Strategy

The tests use the following mocking strategy:

- **Store**: Directly accessing the store via `getState()` when testing store functionality.

- **Components**: Using Jest mocks for dependencies and React Testing Library for rendering and interactions.

- **Database**: Mocking the database module with simulated success/error responses.

- **Server Actions**: Mocking Next.js server actions to simulate API responses.

## Future Test Coverage Areas

1. Integration tests for the complete schedule creation workflow
2. End-to-end tests for key user journeys
3. Performance tests for database operations
4. Visual regression tests for UI components 