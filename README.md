# Scheduler App

A modern, responsive scheduling application built with Next.js and React. This project serves as a foundation for building comprehensive scheduling and calendar management features.

## Project Overview

**Current Status**: Initial Development Phase  
**Framework**: Next.js 15.1.7 with React 19  
**Language**: TypeScript  
**Styling**: CSS Modules with CSS custom properties  

## App Description

This is a **scheduler application template** designed to provide a solid foundation for building scheduling and calendar management functionality. While currently displaying the default Next.js welcome screen, the project is structured and named to evolve into a full-featured scheduling solution.

### Current State
- ✅ Next.js 15.1.7 with App Router architecture
- ✅ React 19 with TypeScript for type safety
- ✅ Modern CSS with dark/light mode support
- ✅ Optimized font loading with Geist font family
- ✅ ESLint configuration for code quality
- ✅ Responsive design foundation

### Intended Functionality
Based on the project name and structure, this app is positioned to become a comprehensive scheduler that could include:
- 📅 Calendar views (daily, weekly, monthly)
- ⏰ Event creation and management
- 🔄 Recurring event support
- 👥 User management and permissions
- 📱 Mobile-responsive interface
- 🌙 Dark/light theme support

## Technical Stack

- **Frontend**: Next.js 15.1.7, React 19, TypeScript
- **Styling**: CSS Modules, CSS Custom Properties
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)
- **Development**: Turbopack for fast refresh
- **Linting**: ESLint with Next.js configuration

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun package manager

### Installation & Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
scheduler-app/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles with theme variables
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page component
│   └── page.module.css # Page-specific styles
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── next.config.ts      # Next.js configuration
└── tsconfig.json       # TypeScript configuration
```

## Development Features

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **Theme Support**: CSS custom properties for easy theming
- **Font Optimization**: Automatic font optimization with next/font
- **Code Quality**: ESLint configuration for consistent code style

## Future Development

This foundation provides an excellent starting point for implementing:
- Database integration for event storage
- Authentication and user management
- Calendar component library integration
- API routes for backend functionality
- Real-time updates with WebSocket support
- Mobile app development with React Native

## Current Screenshot

![Scheduler App Current State](https://github.com/user-attachments/assets/e9bdee47-6e5a-46bd-a04b-1fa9f58ca9cf)

*The app currently displays the Next.js welcome screen, ready for scheduler functionality to be implemented.*
