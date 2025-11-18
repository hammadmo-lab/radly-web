# Contributing to Radly Frontend

Thank you for your interest in contributing to the Radly Frontend! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Architecture](#project-architecture)
- [Common Tasks](#common-tasks)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher
- **npm** 10 or higher
- **Git** for version control
- A code editor (we recommend VS Code with the following extensions):
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd radly-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your credentials. See [Environment Configuration](#environment-configuration) below.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Verify the setup:**
   Open http://localhost:3000 in your browser and ensure the application loads correctly.

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration
NEXT_PUBLIC_API_BASE=https://edge.radly.app
NEXT_PUBLIC_RADLY_CLIENT_KEY=your_64_character_api_key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Contact the team lead to obtain the required credentials for development.

## Development Workflow

### Creating a New Feature

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines below

3. **Test your changes:**
   ```bash
   npm run lint      # Check for linting errors
   npm run test      # Run unit tests
   npm run test:e2e  # Run E2E tests (optional for small changes)
   npm run build     # Ensure production build succeeds
   ```

4. **Commit your changes** using conventional commit messages (see [Commit Guidelines](#commit-guidelines))

5. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a pull request** on GitHub

### Branch Naming Conventions

Use descriptive branch names that follow this pattern:

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring
- `test/test-description` - Test additions or updates
- `chore/task-description` - Maintenance tasks

## Code Style and Standards

### TypeScript

- **Strict mode is enabled** - Avoid using `any` types
- **Use interfaces for object shapes** - Prefer interfaces over types for object definitions
- **Use type inference** - Let TypeScript infer types when possible
- **Export types** - Define and export types in `src/types/` for reusability

**Example:**
```typescript
// Good
interface UserProfile {
  id: string
  name: string
  email: string
}

function getUserProfile(userId: string): Promise<UserProfile> {
  return httpGet<UserProfile>(`/v1/users/${userId}`)
}

// Bad
function getUserProfile(userId: any): Promise<any> {
  return httpGet(`/v1/users/${userId}`)
}
```

### React Components

- **Use functional components** with hooks
- **Server Components by default** - Add `"use client"` only when necessary
- **Component naming** - Use PascalCase for component names
- **File organization** - One component per file, matching the component name

**Example:**
```typescript
// Good: src/components/features/UserProfile.tsx
export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useUserProfile(userId)

  if (isLoading) return <Skeleton />

  return <div>{data?.name}</div>
}

// Bad: Using default export and class components
export default class UserProfile extends React.Component {
  // ...
}
```

### Styling with Tailwind CSS

- **Use Tailwind utility classes** - Avoid custom CSS when possible
- **Responsive design** - Mobile-first approach with responsive prefixes
- **Use design system classes** - Leverage custom classes from `globals.css`
- **Avoid inline styles** - Use Tailwind classes instead

**Example:**
```tsx
// Good
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click me
</button>

// Bad
<button style={{ padding: '8px 16px', backgroundColor: '#2653FF' }}>
  Click me
</button>
```

### File Organization

Follow this component organization pattern:

```
src/
├── components/
│   ├── ui/              # Primitive, reusable UI components
│   ├── features/        # Feature-specific components
│   ├── layout/          # Layout components (navigation, etc.)
│   ├── shared/          # Shared utility components
│   └── admin/           # Admin-specific components
├── lib/                 # Utility libraries and helpers
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── app/                 # Next.js App Router pages
```

## Testing Requirements

### Unit Tests

Write unit tests for:
- Utility functions in `src/lib/`
- Custom hooks in `src/hooks/`
- Complex component logic

**Example:**
```typescript
// src/lib/__tests__/http.test.ts
import { httpGet } from '../http'

describe('httpGet', () => {
  it('should fetch data successfully', async () => {
    const data = await httpGet('/v1/test')
    expect(data).toBeDefined()
  })
})
```

**Run unit tests:**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test -- path.test.ts  # Run specific test
```

### End-to-End Tests

Write E2E tests for:
- Critical user workflows (authentication, report generation)
- Multi-step processes
- Cross-browser compatibility

**Run E2E tests:**
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:debug    # Debug mode
```

### Test Coverage

- Maintain or improve code coverage with each PR
- Aim for at least 80% coverage for new code
- Run coverage report: `npm test -- --coverage`

## Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic changes)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(auth): add magic link authentication
fix(reports): correct date formatting in export
docs(readme): update installation instructions
refactor(http): consolidate duplicate error handling
test(api): add tests for polling hooks
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass:**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Update documentation** if you've made API changes or added new features

3. **Add or update tests** for your changes

4. **Rebase on main** to ensure a clean history:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### PR Description Template

Use this template for your pull request description:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of specific changes

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one team member
3. **Address feedback** promptly and professionally
4. **Squash commits** if requested before merging
5. **Delete branch** after merge

## Project Architecture

### State Management

The application uses a layered approach:

1. **Authentication State** - React Context (`useAuth()` hook)
2. **Server State** - TanStack React Query
3. **Form State** - React Hook Form + Zod validation
4. **UI State** - Local `useState`
5. **Client Storage** - localStorage (non-sensitive data only)

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

### API Integration

All API calls use the centralized HTTP client:

```typescript
import { httpGet, httpPost, httpPut } from '@/lib/http'

// Fetch data
const data = await httpGet<Type>('/v1/endpoint')

// Create resource
const result = await httpPost('/v1/resource', payload)

// Update resource
await httpPut('/v1/resource/123', updates)
```

## Common Tasks

### Adding a New Component

1. **Create the component file** in the appropriate directory:
   ```typescript
   // src/components/features/NewFeature.tsx
   'use client'

   export function NewFeature() {
     return <div>New Feature</div>
   }
   ```

2. **Add tests** if the component has complex logic:
   ```typescript
   // src/components/features/__tests__/NewFeature.test.tsx
   import { render, screen } from '@testing-library/react'
   import { NewFeature } from '../NewFeature'

   describe('NewFeature', () => {
     it('renders correctly', () => {
       render(<NewFeature />)
       expect(screen.getByText('New Feature')).toBeInTheDocument()
     })
   })
   ```

### Adding a New API Endpoint

1. **Define types** in `src/types/api.ts`:
   ```typescript
   export interface NewResource {
     id: string
     name: string
   }
   ```

2. **Create API function** in appropriate lib file:
   ```typescript
   export async function getNewResource(id: string): Promise<NewResource> {
     return httpGet<NewResource>(`/v1/resources/${id}`)
   }
   ```

3. **Create React Query hook** (optional):
   ```typescript
   export function useNewResource(id: string) {
     return useQuery({
       queryKey: ['resource', id],
       queryFn: () => getNewResource(id),
     })
   }
   ```

### Adding a New Form

1. **Define Zod schema** in `src/lib/schemas.ts`:
   ```typescript
   export const newFormSchema = z.object({
     name: z.string().min(2),
     email: z.string().email(),
   })

   export type NewFormData = z.infer<typeof newFormSchema>
   ```

2. **Create form component** using React Hook Form:
   ```typescript
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'

   export function NewForm() {
     const form = useForm<NewFormData>({
       resolver: zodResolver(newFormSchema),
     })

     const onSubmit = async (data: NewFormData) => {
       await httpPost('/v1/endpoint', data)
     }

     return (
       <form onSubmit={form.handleSubmit(onSubmit)}>
         <Input {...form.register('name')} />
         <Input {...form.register('email')} />
         <Button type="submit">Submit</Button>
       </form>
     )
   }
   ```

### Adding a New Page

1. **Create page file** in `src/app/` directory:
   ```typescript
   // src/app/app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>
   }
   ```

2. **Add to navigation** if needed in `src/components/layout/Navigation.tsx`

3. **Add route protection** in `middleware.ts` if the page requires authentication

## Getting Help

If you need help or have questions:

1. **Check existing documentation** - [README.md](./README.md), [CLAUDE.md](./CLAUDE.md)
2. **Search issues** - Look for similar issues or questions
3. **Ask the team** - Reach out on Slack or create a GitHub discussion
4. **Create an issue** - If you find a bug or have a feature request

## Code of Conduct

- Be respectful and professional in all interactions
- Provide constructive feedback during code reviews
- Help other contributors when possible
- Follow the project's coding standards and guidelines

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Radly Frontend!**

For more information, see:
- [README.md](./README.md) - Project overview and setup
- [CLAUDE.md](./CLAUDE.md) - Detailed architecture and development guidelines
- [docs/](./docs/) - Additional technical documentation
