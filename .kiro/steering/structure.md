# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities (cn function)
├── public/               # Static assets
├── styles/               # Additional stylesheets
└── .kiro/                # Kiro configuration
    └── steering/         # AI assistant guidance
```

## Key Conventions

### Import Aliases
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/hooks` → `./hooks`
- `@/components/ui` → `./components/ui`

### Component Structure
- **UI Components**: Located in `components/ui/` (shadcn/ui)
- **Custom Components**: Direct in `components/`
- **Page Components**: In `app/` directory following App Router structure

### File Naming
- **Components**: PascalCase for files and exports (`Button.tsx`, `export default Button`)
- **Utilities**: kebab-case for files, camelCase for exports (`use-toast.ts`)
- **Pages**: lowercase for route segments (`page.tsx`, `layout.tsx`)

### TypeScript Patterns
- Interface definitions inline or at top of files
- Strict typing with proper type exports
- Use of `type` for unions, `interface` for objects

### Styling Approach
- **Tailwind classes** for component styling
- **CSS variables** for theme colors (HSL format)
- **cn() utility** for conditional classes (from `lib/utils.ts`)
- **Component variants** using class-variance-authority

### State Management
- **React Hook Form** for form state
- **useState/useEffect** for local component state
- **Context** for theme management

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for data structures
- Maintain consistent import ordering (external → internal → relative)