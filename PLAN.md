# Clawboard UI – Product Plan (Phases 1–2)

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

## Current State

The repository now contains a working Phase 2 Home dashboard centered on day-start clarity and low-friction actions:

- Home is now a real product surface (`HomeDashboard`), not a scaffold card.
- The dashboard includes a structured morning brief with readable signal cards and an upcoming reminder.
- Quick actions are prominent and approachable with large hit targets and plain labels.
- Active jobs are summarized with calm urgency indicators and ETA context.
- Pinned outputs are immediately accessible from Home for continuity.
- App shell branding now communicates a supportive daily companion posture.

Phase 1 remains complete. Phase 2 dashboard implementation and validation are complete.
