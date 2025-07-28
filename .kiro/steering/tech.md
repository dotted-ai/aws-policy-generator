# Technology Stack

## Framework & Runtime
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library with React Server Components (RSC)
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Headless UI components for accessibility
- **Geist Font** - Typography (Sans & Mono variants)
- **Lucide React** - Icon library
- **CSS Variables** - Theme system with HSL color values

## Key Libraries
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **class-variance-authority** - Component variant management
- **tailwind-merge & clsx** - Conditional CSS class handling
- **next-themes** - Theme switching support
- **Sonner** - Toast notifications

## Development Tools
- **ESLint** - Code linting (build errors ignored)
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## Build Configuration
- **Build errors ignored** - TypeScript and ESLint errors don't block builds
- **Image optimization disabled** - For development flexibility
- **Path aliases configured** - `@/` prefix for imports

## Common Commands
```bash
# Development
npm run dev          # Start development server
pnpm dev            # Alternative with pnpm

# Production
npm run build       # Build for production
npm run start       # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Deployment
- **Vercel** - Primary deployment platform