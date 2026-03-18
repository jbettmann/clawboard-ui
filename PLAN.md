# Clawboard UI – Product Plan (Phases 1–8)

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

### Phase 4 — Outputs + Home Customization
1. Replace Outputs placeholder with a real product surface.
2. Implement Outputs feed/detail behavior with pin/save actions.
3. Connect pinned outputs so Home reflects pin/unpin behavior.
4. Add Home customization controls for widget visibility and order.
5. Keep interaction model simple, calm, and elderly-friendly.
6. Preserve buildability and validation confidence after Phase 4 implementation.

### Phase 5 — Chat + Connections + Clear Status
1. Replace Chat placeholder with a real conversation workspace.
2. Make session/activity clarity obvious through readable status cues.
3. Replace Connections placeholder with guided auth/connect flow and understandable health states.
4. Improve status/log/history presentation in plain language (glanceable, non-debuggy).
5. Keep design calm, modern, intuitive, and elderly-friendly.
6. Preserve buildability and validation confidence after Phase 5 implementation.

### Phase 6 — Drop-In Compatibility + Integration Notes
1. Add a clear compatibility layer for OpenClaw gateway/API/auth wiring assumptions.
2. Document a realistic minimal-effort drop-in path from stock OpenClaw UI to clawboard-ui.
3. Document explicit rollback steps to return to the stock UI quickly.
4. Expose compatibility configuration in UI for easy operator verification.
5. Preserve buildability and validation confidence after compatibility additions.

### Phase 7 — Packaging + Non-Technical Installability
1. Add practical Docker packaging suitable for local/prod-style startup.
2. Provide plain-language setup/install instructions for non-technical operators.
3. Make development vs production run paths explicit and easy to follow.
4. Clarify environment setup and where users should edit configuration.
5. Preserve buildability and validation confidence after packaging/docs updates.

### Phase 8 — Final Polish, Accessibility, and OSS Readiness
1. Improve practical accessibility support (keyboard flow, focus cues, semantic state announcements).
2. Apply final interaction polish across key product surfaces without changing core behavior.
3. Add screenshot/demo asset structure and guidance for docs/PR usage.
4. Add contributor-facing templates (issues/PR) for open-source collaboration readiness.
5. Preserve buildability and validation confidence after final polish updates.

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

### Phase 4
- [x] Outputs route upgraded from placeholder to an interactive feed/detail surface
- [x] Output detail actions implemented for pin/unpin and save/unsave
- [x] Home pinned outputs connected to Outputs pin state
- [x] Home customization controls implemented for widget visibility/order
- [x] Preferences persist locally for a simple, dependable experience
- [x] Validation rerun after Phase 4 UI implementation (`npm run lint`, `npm run build`)

### Phase 5
- [x] Chat route upgraded from placeholder to an interactive conversation workspace
- [x] Session list and message surface implemented with clear activity/readability cues
- [x] Connections route upgraded with guided auth/connect flow and plain-language health states
- [x] Status/log/history presentation implemented in a glanceable non-debuggy Advanced Settings surface
- [x] UI tone maintained as calm, modern, intuitive, and elderly-friendly
- [x] Validation rerun after Phase 5 UI implementation (`npm run lint`, `npm run build`)

### Phase 6
- [x] OpenClaw compatibility layer added (`src/lib/openclaw-compat.ts`) with gateway/API/auth/base URL normalization
- [x] Integration and rollback documentation added (`docs/OPENCLAW_COMPATIBILITY.md`)
- [x] Environment defaults updated for drop-in mode (`.env.example`)
- [x] Connections surface now shows compatibility snapshot from runtime config
- [x] README updated with Phase 6 compatibility guidance and pointers
- [x] Validation rerun after Phase 6 additions (`npm run lint`, `npm run build`)

### Phase 7
- [x] Production-ready Docker packaging added (`Dockerfile`, `.dockerignore`)
- [x] Docker run workflow added for one-command startup (`docker-compose.yml`)
- [x] Plain-language setup guide added for non-technical users (`docs/INSTALL_SETUP.md`)
- [x] README updated with clear local/dev/prod/docker run paths and env setup
- [x] Next.js standalone output enabled for lean runtime packaging (`next.config.ts`)
- [x] Validation rerun after Phase 7 updates (`npm run lint`, `npm run build`)

### Phase 8
- [x] App shell accessibility polish added (skip link, stronger keyboard focus, `aria-current` on active nav)
- [x] Selection controls improved with practical semantics (`aria-pressed` + descriptive labels)
- [x] Dynamic status notes made screen-reader-friendly (`aria-live` announcements)
- [x] Demo/screenshot asset structure and usage guidance added (`docs/DEMO_ASSETS.md`, `docs/assets/*`)
- [x] OSS contribution templates added (`.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`)
- [x] Validation rerun after Phase 8 updates (`npm run lint`, `npm run build`)

## Current State

The repository now contains working product surfaces for Home, Chat, Skills, Jobs, Outputs, Connections, Settings/Advanced status views, plus Phase 6 compatibility scaffolding, Phase 7 packaging/install improvements, and Phase 8 accessibility/OSS polish for OpenClaw drop-in UI replacement:

- **Home (Phases 2 + 4):** Day-start dashboard with morning brief, status pulse, active jobs, pinned outputs, quick actions, and a simple customization surface for widget visibility/order.
- **Chat (Phase 5):** Session-oriented conversation workspace with readable message layout, clear activity states, and simple composer behavior.
- **Skills (Phase 3):** Full list/detail/form pattern with editable fields (name, summary, trigger guidance, tags, safety level, enabled state), plus Add, Save, and Reset actions.
- **Jobs (Phase 3):** Full list/detail management pattern with editable purpose and plain-language schedule input, schedule interpretation hint, and clear controls (Run now, Pause, Resume, Skip next, Save changes).
- **Outputs (Phase 4):** Full feed/detail pattern with pin/save controls and state-connected Home pin behavior.
- **Connections (Phase 5):** Guided auth/connect workflow with clear health states, step-by-step setup guidance, and plain-language action outcomes.
- **Status & history (Phase 5):** Glanceable health snapshot, friendly activity timeline, and concise log digest in Advanced Settings.
- **Compatibility (Phase 6):** Dedicated OpenClaw compatibility layer (`src/lib/openclaw-compat.ts`) defines gateway/API/auth/base URL assumptions and supports drop-in vs standalone UI mode.
- **Integration docs (Phase 6):** `docs/OPENCLAW_COMPATIBILITY.md` documents wiring map, switch-over steps, and rollback to stock UI.
- **Packaging (Phase 7):** Multi-stage container packaging added via `Dockerfile` and `.dockerignore`, with Next.js standalone output for lean runtime startup.
- **Installability (Phase 7):** One-command Docker startup path documented and configured in `docker-compose.yml`.
- **Operator docs (Phase 7):** `docs/INSTALL_SETUP.md` provides plain-language setup and troubleshooting for non-technical users.
- **Accessibility polish (Phase 8):** App shell now includes a skip link, keyboard-focused nav enhancements, and active-page semantics (`aria-current`) for stronger keyboard/screen-reader flow.
- **Interaction semantics (Phase 8):** Selectable cards across key surfaces now expose pressed state and clearer labels, and dynamic status messages use `aria-live` to announce updates.
- **OSS readiness (Phase 8):** Contributor templates and demo/screenshot guidance were added via `.github/*` templates and `docs/DEMO_ASSETS.md` with `docs/assets/` structure.
- **Design posture:** Surfaces use calm spacing, high-contrast typography, plain language, and larger touch targets to remain intuitive and elderly-friendly.
- **State model:** Shared client state provider keeps outputs and Home customization aligned, while Phase 5 surfaces use focused local interaction state for clarity.
- **Buildability:** Lint and production build pass after Phase 7 packaging/install updates.

Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, and Phase 8 are complete and validated.
