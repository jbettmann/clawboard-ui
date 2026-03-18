# Clawboard UI – Update Plan (Design + Data + Component Overhaul)

## Approved Plan

### Phase 1 — Foundation: full-width shell, theme architecture, and design tokens
1. Replace the constrained centered shell with a true full-width responsive app layout.
2. Introduce a semantic design token system for surfaces, text, borders, states, and accent usage.
3. Add intentional light / dark / system theme support with a visible toggle and persisted preference.
4. Replace the current sky-accent styling with a balanced `red-400` accent system paired with neutrals.
5. Standardize spacing, typography, elevation, radius, focus states, and transitions.
6. Validate with lint and production build.

### Phase 2 — Navigation overhaul with shadcn sidebar
1. Replace the custom navigation with shadcn sidebar as the primary navigation system.
2. Add desktop expanded/collapsed behavior, mobile drawer behavior, and persisted sidebar preference where appropriate.
3. Rework the global layout so every screen feels part of one unified dashboard.
4. Establish a consistent page header pattern with title, context, primary action, and supporting status.
5. Validate with lint and production build.

### Phase 3 — Real data foundation and read-only live wiring
1. Add a shared OpenClaw client layer using the existing compatibility config.
2. Define typed domain models for skills, jobs, job history, outputs, daily briefs, chat sessions/messages, and connection/system health.
3. Add shared async state handling for loading, error, and empty states.
4. Replace all mock read-path data with live OpenClaw data.
5. Wire the dashboard to actual user-visible OpenClaw data across all screens.
6. Validate with lint and production build.

### Phase 4 — Home/dashboard redesign around real user context
1. Redesign Home so it immediately answers: what am I looking at, what needs attention, and what can I do next?
2. Replace demo cards with real sections driven by live OpenClaw data.
3. Remove internal/dev-facing framing like “Phase X”.
4. Design clean, useful empty states for brand-new users without fake filler.
5. Validate with lint and production build.

### Phase 5 — Skills and jobs product surfaces with real state
1. Rebuild Skills around real inventory, built-in vs custom distinctions, enabled/disabled state, and useful metadata.
2. Rebuild Jobs around real scheduler data including active/scheduled/paused states and run history.
3. Improve information hierarchy and list-detail flows.
4. Enable real write actions only where supported and safe by the OpenClaw API.
5. Validate with lint and production build.

### Phase 6 — Outputs, briefs, and chat/agent activity with live data
1. Replace local output state with real outputs and daily briefs.
2. Clearly distinguish daily briefs, job outputs, agent outputs, and saved/pinned items.
3. Rebuild chat/activity around real sessions and real message history.
4. Connect composer/send actions to the real OpenClaw execution flow where supported safely.
5. Validate with lint and production build.

### Phase 7 — Connections, status, and system observability
1. Replace env-only compatibility views with real runtime health/status.
2. Show actual gateway status, node/device health, auth/connectivity state, and recent issues.
3. Simplify status/history views so they are actionable instead of debuggy.
4. Improve troubleshooting flows so users understand what is broken, what it impacts, and what to do next.
5. Validate with lint and production build.

### Phase 8 — Final polish, responsiveness, and interaction quality
1. Refine responsive behavior across screen sizes.
2. Tighten alignment, spacing rhythm, and typographic hierarchy everywhere.
3. Add polished hover, pressed, focus, loading, and transition states.
4. Normalize reusable patterns across all surfaces.
5. QA light mode and dark mode separately so both feel first-class.
6. Final benchmark pass against Airbnb, Linear, Notion, Stripe Dashboard, and Vercel quality expectations.
7. Validate with lint and production build.

## Checklist Status

### Phase 1
- [x] Full-width responsive shell implemented
- [x] Semantic design token system introduced
- [x] Light / dark / system theme support with persisted toggle added
- [x] `red-400` accent system applied to shared foundation
- [x] Shared spacing / typography / elevation / interaction primitives tightened
- [x] Validation run (`npm run lint`, `npm run build`)

### Phase 2
- [x] shadcn sidebar implemented as primary navigation
- [x] Desktop collapse + mobile drawer behavior added
- [x] Sidebar preference persistence added where appropriate
- [x] Global page header framework standardized
- [x] Validation run (`npm run lint`, `npm run build`)

### Phase 3
- [ ] Shared OpenClaw API client added
- [ ] Typed live-data domain models added
- [ ] Shared loading / error / empty-state primitives added
- [ ] Mock read-path data removed from all screens
- [ ] Read-only live data wired across dashboard surfaces
- [ ] Validation run (`npm run lint`, `npm run build`)

### Phase 4
- [ ] Home redesigned around real user context and next actions
- [ ] Real live-data sections replace demo cards
- [ ] Internal/dev-facing framing removed
- [ ] Empty states for new users implemented without mock filler
- [ ] Validation run (`npm run lint`, `npm run build`)

### Phase 5
- [ ] Skills rebuilt around real inventory and status
- [ ] Jobs rebuilt around real scheduler state and history
- [ ] List-detail flows and hierarchy improved
- [ ] Safe supported write actions enabled where available
- [ ] Validation run (`npm run lint`, `npm run build`)

### Phase 6
- [ ] Outputs and daily briefs wired to live data
- [ ] Output types clearly distinguished in UI
- [ ] Chat/activity rebuilt around real sessions and history
- [ ] Real send/execution flow connected where supported safely
- [ ] Validation run (`npm run lint`, `npm run build`)

### Phase 7
- [ ] Real runtime health/status replaces env-only views
- [ ] Gateway/node/auth/connectivity states surfaced clearly
- [ ] Status/history views simplified and made actionable
- [ ] Troubleshooting UX improved with clear next steps
- [ ] Validation run (`npm run lint`, `npm run build`)

### Phase 8
- [ ] Responsive behavior refined across common screen sizes
- [ ] Spacing, alignment, and type hierarchy polished throughout
- [ ] Hover / focus / pressed / loading / transition states polished
- [ ] Reusable patterns normalized across surfaces
- [ ] Light and dark mode QA pass completed
- [ ] Final benchmark polish pass completed
- [ ] Validation run (`npm run lint`, `npm run build`)

## Current State

The existing repository has a working Next.js/Tailwind UI shell and multiple surface implementations for Home, Chat, Skills, Jobs, Outputs, Connections, and Settings. However, the current app is still a demo-state frontend:

- The shell is visually centered and width-constrained rather than using the full viewport effectively.
- Theme behavior currently follows system preference only; there is no visible toggle or deliberate multi-theme system.
- The primary navigation is custom and not built with the shadcn sidebar pattern.
- A sky-blue accent is used heavily instead of the requested `red-400` accent strategy.
- Most screens use local component state and fixture data rather than live OpenClaw data.
- No real read-path API integration exists yet for skills, jobs, history, outputs, briefs, sessions, or connection health.
- Existing surfaces are useful references for product intent, but they need a substantial redesign and data migration to meet the updated brief.

### Done
- New multi-phase redesign + live-data migration plan approved.
- `PLAN.md` rewritten to reflect the updated execution plan.
- Phase 1 foundation work completed across layout, theming, tokens, and shared UI primitives.
- Validation completed for Phase 1 with successful `npm run lint` and `npm run build`.
- Phase 2 navigation overhaul completed with a sidebar-driven shell, mobile/desktop navigation states, and a shared page header framework.
- Validation completed for Phase 2 with successful `npm run lint` and `npm run build`.

### Now
- Phase 2 is ready to be committed, pushed, and opened as a PR for review.

### Next
- Wait for approval and merge of the Phase 2 PR, then re-read `PLAN.md` and begin Phase 3 only after merge.
