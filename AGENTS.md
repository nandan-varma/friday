# AGENTS.md - Coding Guidelines for Friday Repository

This document provides coding standards and operational guidelines for AI agents working on the Friday codebase. Follow these rules to maintain consistency and quality.

## Project Overview

Friday is a Next.js 16.1.1 application built with:

- React 19.2.3
- TypeScript 5.x
- Tailwind CSS v4
- shadcn/ui component library
- Base UI React primitives
- pnpm package manager

## Build, Lint, and Test Commands

### Development Workflow

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Package Management

### Dependency Rules

- **Never install new packages** without explicit user approval. Check if required functionality already exists in the current dependencies before suggesting installations.
- Review `package.json` to understand what packages are already available.
- Use existing dependencies to solve problems whenever possible.

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode**: Always enabled - no `any` types, explicit null checks
- **Target**: ES2017
- **JSX**: React JSX transform (`react-jsx`)
- **Module resolution**: `bundler` (for Next.js)
- **Path aliases**: `@/*` maps to `./*`

### Import Organization

```typescript
// 1. React imports
import React from "react";

// 2. External library imports (alphabetical)
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";

// 3. Local imports (relative paths or aliases)
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

// Group imports by type, separate with empty lines
```

### Component Patterns

#### Function Components

```typescript
interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  className?: string
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

#### Component Variants (class-variance-authority)

```typescript
const buttonVariants = cva(
  "base-classes inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        // ... more variants
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2",
        lg: "h-9 px-3",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### Naming Conventions

#### Files and Components

- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`utils.ts`, `helpers.ts`)
- **Hooks**: camelCase with `use` prefix (`useLocalStorage.ts`)
- **Types**: PascalCase with descriptive names (`UserData.ts`, `ApiResponse.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in constants files

#### Variables and Functions

- **camelCase** for variables and functions
- **PascalCase** for component names and types
- **Descriptive names**: `isLoading` not `loading`, `handleSubmit` not `onClick`

### Styling Guidelines

#### Tailwind CSS v4

- **CSS Variables**: Use OKLCH color space with CSS custom properties
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Use CSS custom properties for theme switching
- **Utility Classes**: Prefer Tailwind utilities over custom CSS

#### Class Name Utilities

```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

function Component({ className, variant }: Props) {
  return (
    <div className={cn(
      "base-classes",
      variant === "primary" && "bg-primary text-primary-foreground",
      className
    )} />
  )
}
```

### TypeScript Best Practices

#### Type Definitions

```typescript
// Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions and complex types
type ButtonVariant = "default" | "outline" | "destructive";
type ApiResponse<T> = {
  data: T;
  error?: string;
  status: number;
};

// Prefer interface over type for public APIs
export interface ComponentProps {
  children?: React.ReactNode;
  onClick?: () => void;
}
```

#### Generic Components

```typescript
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  renderOption: (option: T) => React.ReactNode;
}

function Select<T>({ options, value, onChange, renderOption }: SelectProps<T>) {
  // Implementation
}
```

### Error Handling

#### React Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback
        ? <this.props.fallback error={this.state.error} />
        : <div>Something went wrong</div>
    }
    return this.props.children
  }
}
```

#### API Error Handling

```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Re-throw for component-level handling
  }
}
```

#### Form Validation

```typescript
interface FormErrors {
  email?: string;
  password?: string;
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  return errors;
}
```

# Icon usage

```typescript
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification03Icon } from '@hugeicons/core-free-icons'
 
function App() {
  return <HugeiconsIcon icon={Notification03Icon} size={24} color="currentColor" strokeWidth={1.5} />
}
```

### Performance Guidelines

#### React Optimization

- **Memoization**: Use `React.memo()` for expensive components
- **useMemo/useCallback**: For expensive computations and event handlers
- **Lazy loading**: Use `React.lazy()` for route-based code splitting
- **Image optimization**: Use Next.js `Image` component

#### Next.js Specific

- **Server Components**: Default to server components when possible
- **Client Components**: Use `'use client'` directive only when necessary
- **API Routes**: Use App Router API routes (`app/api/`)
- **Metadata**: Use metadata API for SEO

### File Structure

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                   # Utilities and configurations
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

### Commit Message Conventions

```
feat: add user authentication
fix: resolve button click handler bug
docs: update component documentation
style: format code with prettier
refactor: simplify user state management
chore: update dependencies
```

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] ESLint passes without warnings
- [ ] Components follow established patterns
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Error handling implemented
- [ ] Code is self-documenting with clear naming

### Security Considerations

- **Input Validation**: Always validate user inputs
- **XSS Prevention**: Use React's built-in XSS protection
- **CSRF Protection**: Implement CSRF tokens for forms
- **Environment Variables**: Never commit secrets
- **Dependencies**: Regularly update for security patches

---

This document should be updated as the codebase evolves. When making changes to coding standards, update this file and communicate changes to the team.
