# replit.md

## Overview

This is a network speed testing application that measures download/upload speeds, ping, and jitter. Users can run speed tests and view their historical results. The app features a modern, dark-themed UI with animated speed gauges and data visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for speed gauge and transitions
- **Build Tool**: Vite with path aliases (`@/` for client source, `@shared/` for shared code)

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Speed Test Implementation**:
  - Ping endpoint returns timestamps for latency measurement
  - Download endpoint streams random binary data with backpressure handling
  - Upload endpoint receives binary blobs and reports bytes received

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Single `test_results` table storing speed test metrics (download/upload speeds in Mbps, ping/jitter in ms, location data)
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including speed gauges
    hooks/        # Custom hooks for speed tests and results
    pages/        # Route components
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint handlers
  storage.ts      # Database access layer
  db.ts           # Drizzle database connection
shared/           # Shared between frontend and backend
  schema.ts       # Drizzle table definitions
  routes.ts       # API route definitions with Zod schemas
```

### Key Design Decisions
1. **Shared Route Definitions**: API routes are defined once in `shared/routes.ts` with Zod schemas, ensuring type safety across frontend and backend
2. **Streaming for Speed Tests**: Download uses chunked streaming with backpressure to accurately measure bandwidth without memory issues
3. **CSS Variables for Theming**: Dark, tech-focused color palette with neon accents defined via CSS custom properties
4. **Glass Morphism UI**: Modern aesthetic with backdrop blur, gradients, and glow effects

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- Connection pooling through `pg` package

### UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, toast, etc.)
- **Lucide React**: Icon library
- **Recharts**: Data visualization for history charts
- **Embla Carousel**: Carousel component

### Fonts
- **Google Fonts**: Outfit (display), Inter (body), DM Sans, Fira Code, Geist Mono

### Build & Development
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development