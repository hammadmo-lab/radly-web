# Radly Neon UI Design Plan

This document tracks the current state of the Radly UI redesign as we transition the product to the new “neon aurora” visual system. It captures what has been completed, the shared primitives we introduced, and the remaining surfaces that still need to be repainted.

---

## ✅ Completed Work

- **Global Design Tokens**
  - Added dark “neon shell” and “aurora card” primitives in `src/app/globals.css`, including the deep-space body backdrop, glow utilities, and gradient badges.
  - Updated shared button + progress components (`src/components/ui/button.tsx`, `src/components/ui/progress.tsx`) to use the new gradient/outline styles and glow animations.

- **Reports Dashboard (`src/app/app/reports/page.tsx`)**
  - Wrapped the page in the neon shell.
  - Introduced status chips with dedicated state colors and aurora list items so template names stay visible without hover.
  - Restyled search, sort controls, empty states, and pagination to match the palette.

- **Usage Widget (`src/components/UsageWidget.tsx`)**
  - Converted the component to the aurora card with gradient progress bar, pill badges, and responsive typography.

- **Notification Center (`src/components/layout/NotificationCenter.tsx`)**
  - Brought the dialog, bell trigger, and badges into the dark theme with translucent glass, tinted icon cradles, and neon hover states.

- **Templates Gallery (`src/app/app/templates/page.tsx`)**
  - Replaced the light-theme cards and banners with neon shell wrappers, gradient badges, and aurora cards for each template tile.
  - Updated filter dropdowns, empty states, and call-to-action buttons to match the new design system.

---

## ⏳ In Progress / Next Up


### Newly Completed

- **Admin Dashboard (`src/app/admin/page.tsx`)**
  - Migrated the full dashboard shell to the neon system: aurora cards, glowing stat tiles, gradient error banners, and connection status redesign aligned with assistant branding.
  - Refreshed subscription table, filters, and action buttons with the new button/usage progress treatments.

- **Metrics Dashboard (`src/app/admin/metrics`)**
  - Restyled the entry page and every analytic panel (overview, alerts, queue, DB, LLM panels) with neon shells, dark charts, and tinted status summaries.
  - Brought loading + error states into the aurora theme.

- **Public Marketing Homepage (`src/app/page.tsx`)**
  - Rebuilt the hero with starfield, enlarged logo, and assistant-focused CTA copy.
  - Added structured sections (value pillars, workflow, comparison deck, testimonials, footer) using neon cards.

- **Legal & Footer Surfaces**
  - Added privacy and terms routes with assistant-forward copy and neon styling.
  - Introduced global footer CTA (`© Radly 2025` with policy links).

- **Mobile Navigation (`src/components/layout/Navigation.tsx`)**
  - Updated the mobile drawer to neon gradients, glowing icon capsules, and translucent account blocks.

- **Generate Workflow (`src/app/app/generate/page.tsx`)**
  - Converted the multi-step form to neon cards, gradient stepper, and assistant messaging.
  - Rebuilt error/usage limit banners and action bar to match the dark system.

- **Loading Experiences**
  - Added neon `/app/loading.tsx` hero and redesigned report-generation overlay (`GenerateLoading`) with starfield, custom progress cards, trivia, and skeleton preview.

### Remaining

- **Public Marketing Homepage Enhancements**
  - Iterate on additional sections (integrations/security, resident education callouts) as new content arrives.

- **Validation**
  - Run `npm run lint` and `npm run build` once all surfaces are updated to confirm there are no lingering syntax or styling regressions.

---

## Notes & Guidelines

- When porting a page, start by wrapping the outer content in `.neon-shell` or `.aurora-card` containers before adjusting individual modules.
- Prefer the new gradient utilities or inline `style` gradients over arbitrary Tailwind hex classes to avoid parser issues.
- Empty states and banners should use the translucent glass backgrounds and tinted text (`rgba(207,207,207,…)`) seen on the reports & templates pages.
- Icon-only actions should use the ghost/outline button variants to keep hover feedback consistent.

Feel free to update this plan as additional surfaces are addressed or new design requirements appear. Once all remaining pages are complete and validated, we can mark the redesign as done and archive this document for reference.
