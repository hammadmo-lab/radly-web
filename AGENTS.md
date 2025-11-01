# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `src/app`, with grouped route segments for auth, admin, marketing, and the protected `app/` workspace. Reusable UI sits in `src/components/ui`, feature modules under `src/components/features`, and shared providers such as `AuthProvider` in top-level component files. Domain logic is in `src/lib` (Supabase clients, API adapters, validation schemas) and `src/hooks` (React Query data hooks). Types reside in `src/types`, helpers in `src/utils`, and co-located mocks under `src/__mocks__`. Playwright specs live in `e2e`, Jest suites in `src/__tests__` or component-level `__tests__`. Static assets ship from `public/`, documentation from `docs/`, and Capacitor projects sit under `ios/` and `android/`.

## Build, Test, and Development Commands
- `npm run dev` – launch the Turbopack dev server on :3000.  
- `npm run build` – create a production build; use `npm run analyze` when bundle inspection is needed.  
- `npm run build:mobile` – build with `CAPACITOR_BUILD`, then `npm run cap:sync` to update native projects.  
- `npm run start` – serve the compiled app.  
- `npm run lint` – run ESLint with Next.js + TypeScript config.  
- `npm test` / `npm run test:watch` – run Jest unit tests.  
- `npm run test:e2e` – execute Playwright suites; `npm run test:e2e:report` to review results.

## Coding Style & Naming Conventions
Codebase uses TypeScript with React functional components. Keep indentation at two spaces, omit semicolons, and favor descriptive `camelCase` for utilities/hooks and `PascalCase` for components/providers. Shared UI primitives follow the shadcn-inspired pattern (`Button`, `Card` in `src/components/ui`). Tailwind CSS 4 powers styling—prefer utility classes in components and extend tokens via `tailwind.config.ts`. Run `npm run lint -- --fix` before opening a PR; address warnings (`react-hooks/exhaustive-deps`, `@typescript-eslint/no-unused-vars`) rather than suppressing them.

## Testing Guidelines
Place unit tests beside source (`Component.test.tsx`) or in `src/__tests__` for cross-cutting logic. Use Testing Library for component behavior and mock Supabase via `src/__mocks__`. Verify new queries or hooks include coverage for loading/error branches. End-to-end flows belong in `e2e`, using Playwright fixtures to authenticate. Run `npm test` and `npm run test:e2e` locally when altering data flow, auth, or routing; attach failing-output snippets to the PR if relevant.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes observed in history (`fix:`, `docs:`, `feat:`) and keep summaries under 72 characters. Squash WIP commits before merging. PRs should describe the change, link to any issue, list notable risks, and include screenshots or screen recordings for UI or mobile updates. Confirm lint, unit, and e2e scripts are green, and note any intentionally skipped checks. Request reviews from code owners responsible for the touched area (app routes, components, or native shells).

## Security & Configuration Tips
Store secrets in `.env.local`; never commit credentials. Use `check-supabase-config.sh` before deploying to ensure required Supabase keys exist. When testing mobile features, sync native shells after env changes with `npm run cap:sync`.
