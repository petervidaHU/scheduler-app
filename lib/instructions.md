# Project Instructions for GitHub Copilot
This is a timetable app for schools. The user can log in, select an entity (in the app: ‘tenancy’), within which he can add the following entities: subject, classroom, class, teacher, speciality, frame (in the app: ‘frame’. 
From these, the user can create a timetable, specifying the time, subject, classroom, teacher of a lesson within a given frame. The purpose of the app is to allow you to select only the teachers and classrooms that are available at the time when you create the timetable.
All entities can be managed with CRUD operations, all timetables can be queried, modified.

## Project Overview
This is a frontend application built with Next.js and Mantine UI v7. The project follows SOLID principles where appropriate and uses Zustand for client-side state management.

## Technology Stack
- Next.js is the React framework
- Mantine UI v7 for components and styling
- Zustand for client-side state management
- TypeScript for type safety

## Code Style Guide
- Use camelCase for variables and functions
- Use PascalCase for component and type names
- Maximum line length: 80 characters
- Use descriptive variable names
- Use functional components with React hooks
- Use named exports instead of default exports when possible

## Architecture Guidelines
- Follow SOLID principles where appropriate:
  - Single Responsibility: Each component should do one thing well
  - Open/Closed: Components should be open for extension but closed for modification
  - Liskov Substitution: Components should be replaceable with instances of their subtypes
  - Interface Segregation: Many specific interfaces are better than one general interface
  - Dependency Inversion: Depend on abstractions, not concretions
- Do NOT create classes unless necessary (prefer a functional approach)
- Use composition over inheritance
- Keep components small and focused

## State Management
- Use Zustand for client-side state management
- Structure Zustand stores with clear actions and selectors
- Access existing Zustand stores instead of creating new ones
- Keep state normalized when dealing with collections of data
- Use React Query for server state management if applicable

## UI/Styling Guidelines
- Use Mantine UI v7 components for all UI elements. Be aware that Mantine has a breaking changes from  v6 to v7. Do not rely on v6 solutuions
- Leverage Mantine theme system for styling and customization
- Do NOT use inline styles or separate CSS files
- Use Mantine's responsive props for handling different screen sizes
- Follow Mantine naming conventions for props and components
- Use Mantine's color system and avoid hardcoded colors

## Next.js Specific Guidelines
- Use App Router for routing
- Properly differentiate between client and server components
- Use appropriate data fetching methods based on the component type
- Implement proper loading states and error boundaries
- Follow Next.js best practices for image optimization and performance

## Testing Requirements
- Write unit tests for all reusable components
- Use React Testing Library for component testing
- Test key user interactions and state changes
- Maintain test coverage above 80%
- Use descriptive test names following the pattern: [ComponentName]_[StateUnderTest]_[ExpectedBehavior]

## Performance Considerations
- Use proper code splitting with dynamic imports
- Implement memoization for expensive calculations
- Optimize re-renders with useMemo and useCallback when necessary
- Follow Next.js best practices for image and font optimization
- Minimize bundle size by avoiding unnecessary dependencies

## Accessibility Guidelines
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements
- Maintain proper heading hierarchy
- Provide appropriate ARIA attributes where necessary
- Ensure sufficient color contrast ratios

## Documentation Requirements
- Document complex component props with TypeScript interfaces
- Add inline comments for complex logic
- Keep the README updated with setup and contribution instructions