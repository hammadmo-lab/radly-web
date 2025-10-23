# Repository Guidelines
## Project Structure & Module Organization
- Core routes live in `src/app`, grouped by feature (`(auth)`, `app/dashboard`, public marketing pages).
- Shared UI sits in `src/components`, with reusable shadcn primitives under `src/components/ui`.
- Keep data access, schemas, and Supabase helpers in `src/lib`, domain types in `src/types`, and shared utilities in `src/utils`.
- Tests mirror the source tree in `src/__tests__` and `src/__mocks__`; Playwright suites sit in `e2e`. Assets stay in `public`, while long-form content lives in `content` and `docs`.

## Build, Test, and Development Commands
- `npm run dev` launches the Turbopack dev server at `http://localhost:3000`; use `npm run dev:clean` if `.next` caching drifts.
- `npm run build` + `npm run start` build and serve the production bundle; use `npm run analyze` for bundle diffs.
- `npm run lint` applies the Next/TypeScript ESLint rules; `npm run test` or `npm run test:watch` execute Jest suites.
- `npm run test:e2e` runs Playwright headlessly; open artifacts with `npm run test:e2e:report`.

## Coding Style & Naming Conventions
- Stick to TypeScript, modern React, and 2-space indentation; annotate props and hooks explicitly.
- Name components in PascalCase (`ReportPreview.tsx`), hooks in camelCase starting with `use`, constants in UPPER_SNAKE.
- Lean on ESLint and the Tailwind 4 config; prefer extending `src/components/ui` over ad-hoc CSS.
- Use `@/` absolute imports instead of relative ladders, and co-locate feature helpers with their entrypoints.

## Testing Guidelines
- Co-locate Jest specs as `*.test.ts[x]` under `src/__tests__`, preferring Testing Library queries over DOM traversal.
- Mock Supabase, fetch, and timers via `src/__mocks__`; guard authentication flows and form-validation edge cases.
- Keep Playwright specs in `e2e/*.spec.ts`; inspect runs with `npm run test:e2e:report` or `npm run test:e2e:headed`.
- Focus on high-risk paths (auth redirects, template generation, exports) and add regression tests before refactors.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`fix: …`, `feat: …`, `chore: …`) as seen in recent history; keep scope limited to one concern.
- Include context, testing notes, and Supabase dashboard changes in commit/PR bodies; attach before/after screenshots for UI work.
- Ensure lint, unit, and e2e checks pass locally before requesting review; link the relevant Linear/Trello ticket when available.

## Security & Configuration Tips
- Store secrets in `.env.local`; never commit Supabase keys or service roles. Confirm redirect URLs in the Supabase dashboard when touching auth.
- Update `middleware.ts` and `src/lib/supabase.ts` together when adjusting gating logic, and surface new env vars in `README.md`.
