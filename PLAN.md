# Clawboard UI – Product Plan (Phases 1–3)

## Approved Plan

### Phase 1 — Foundation
1. Initialize baseline framework (Next.js App Router + TypeScript + Tailwind).
2. Establish source-of-truth structure (app shell, route placeholders, shared primitives).
3. Implement initial route map (Home, Chat, Skills, Jobs, Outputs, Connections, Settings, Settings/Advanced).
4. Document setup and legal baseline.
5. Validate with lint and production build.

### Phase 2 — Home Dashboard Experience
1. Replace Home placeholder with a real dashboard (not docs-only).
2. Make Home the center of product flow with clear, human-friendly composition:
   - morning brief
   - status pulse
   - active jobs
   - pinned outputs
   - quick actions
3. Keep visual tone calm, modern, intuitive, and elderly-friendly (avoid admin-console density).
4. Preserve buildability and validation confidence.

### Phase 3 — Skills + Jobs Product Surfaces
1. Replace Skills placeholder with a real management surface.
2. Implement Skills list/detail/form editing patterns directly in UI.
3. Replace Jobs placeholder with a real management surface.
4. Implement Jobs list/detail UI with plain-language schedule editing and obvious actions.
5. Keep layout calm, modern, intuitive, and elderly-friendly.
6. Preserve buildability and validation confidence after UI implementation.

## Checklist Status

### Phase 1
- [x] Next.js + TypeScript + Tailwind initialized
- [x] shadcn/ui-oriented component foundation added (`ui` primitives + `cn` utility)
- [x] App shell implemented with calm, modern navigation and layout
- [x] Placeholder routes created for all required sections
- [x] Project docs and legal baseline added (`README.md`, `.env.example`, `LICENSE`)
- [x] Validation run (`npm run lint`, `npm run build`)

### Phase 2
- [x] Home route upgraded from placeholder to an actual dashboard experience
- [x] Morning brief and system status pulse implemented in Home composition
- [x] Active jobs panel implemented with clear ETA and urgency cues
- [x] Pinned outputs section implemented for high-value references
- [x] Quick actions panel implemented for common user flows
- [x] Shell heading refined to feel like a daily assistant, not an admin console
- [x] Validation rerun after Phase 2 UI implementation (`npm run lint`, `npm run build`)

### Phase 3
- [x] Skills route upgraded from placeholder to an interactive management surface
- [x] Skills list/detail/form editing pattern implemented with save/reset/create actions
- [x] Skills form includes plain labels, large controls, and enabled/safety states
- [x] Jobs route upgraded from placeholder to an interactive management surface
- [x] Jobs list/detail editing implemented with plain-language schedule input
- [x] Jobs actions implemented and clearly visible (Run now, Pause, Resume, Skip next)
- [x] Validation rerun after Phase 3 UI implementation (`npm run lint`, `npm run build`)

## Current State

The repository now contains working product surfaces for Home, Skills, and Jobs:

- **Home (Phase 2):** Day-start dashboard with morning brief, status pulse, active jobs, pinned outputs, and quick actions.
- **Skills (Phase 3):** Full list/detail/form pattern with editable fields (name, summary, trigger guidance, tags, safety level, enabled state), plus Add, Save, and Reset actions.
- **Jobs (Phase 3):** Full list/detail management pattern with editable purpose and plain-language schedule input, schedule interpretation hint, and clear controls (Run now, Pause, Resume, Skip next, Save changes).
- **Design posture:** Surfaces use calm spacing, high-contrast typography, plain language, and larger touch targets to remain intuitive and elderly-friendly.
- **Buildability:** Lint and production build pass after Phase 3 implementation.

Phase 1, Phase 2, and Phase 3 are complete and validated.
