# Clawboard UI – Execution Plan

## Status

### Completed
- **Phase 1:** shadcn sidebar adoption + theme toggle moved to persistent top-right header
- **Phase 2:** design research completed and captured in `DESIGN_AUDIT.md`
- **Phase 3:** core design-system and hierarchy pass implemented in code (this branch/PR)

### Current Gate
- Awaiting Phase 3 review/merge before starting Phase 4.

## Phase 3+ Implementation Plan

### Phase 3 — Core design system and page hierarchy
Goal: apply the highest-impact cross-app visual changes that affect every screen.

1. Establish a strict typography role system across the app:
   - kicker / eyebrow
   - section title
   - card title
   - metric value
   - body / support text
   - metadata / captions
2. Standardize card anatomy into reusable patterns:
   - metric card
   - alert card
   - list card
   - action card
   - settings card
3. Introduce a consistent two-tier page hierarchy on every major screen:
   - top = mission-critical summary / actions
   - below = supporting detail modules
4. Normalize accent-color usage so `red-400` is reserved for high-value intent:
   - primary action
   - selected context
   - critical / elevated state
5. Tighten page-level spacing rhythm so screens stop feeling visually inconsistent.
6. Validate with `npm run lint` and `npm run build`.

**Why first:** This phase creates the shared visual language everything else depends on.

---

### Phase 4 — Status semantics and interaction-state unification
Goal: make state meaning consistent, fast to scan, and trustworthy.

1. Define and apply a unified status grammar across the app:
   - healthy
   - watch
   - offline
   - risk
   - loading
   - empty
   - error
2. Standardize status badges, banners, panels, and inline indicators so the same state looks the same everywhere.
3. Unify interactive behavior across controls:
   - default
   - hover
   - active
   - selected
   - focus-visible
   - disabled
   - loading
4. Improve recovery-state UX:
   - empty states
   - loading states
   - error messaging
   - retry / next-step placement
5. Validate with `npm run lint` and `npm run build`.

**Why second:** Clawboard is operational UI; inconsistent state semantics destroy trust faster than spacing issues.

---

### Phase 5 — Navigation, header, and high-frequency workflow refinement
Goal: make the shell faster and more useful for repeated operator flows.

1. Upgrade sidebar behavior with room for:
   - pinned destinations
   - recent destinations/views
   - clearer active-context treatment
2. Refine the header so top-right actions follow the audit guidance consistently.
3. Add contextual page actions in stable, expected locations.
4. Reduce click cost for frequent workflows by improving nav/action placement.
5. Validate responsive behavior for desktop and mobile shell interactions.
6. Validate with `npm run lint` and `npm run build`.

**Why third:** After the visual system is stabilized, shell-level workflow improvements can be applied cleanly.

---

### Phase 6 — Density tuning by surface type
Goal: make overview, monitoring, and settings screens feel intentionally different instead of inconsistently spaced.

1. Define density modes for:
   - overview surfaces
   - monitoring / operations surfaces
   - settings / configuration surfaces
2. Apply mode-specific spacing, row height, card padding, and grouping rules.
3. Rebalance dense screens for scan efficiency without making calm surfaces feel cramped.
4. Preserve readability in both light and dark mode.
5. Validate with `npm run lint` and `npm run build`.

**Why fourth:** Density is easier to tune after shared hierarchy, status semantics, and shell patterns are stable.

---

### Phase 7 — Settings and configuration model cleanup
Goal: make settings predictable by scope and reduce ambiguity about what controls affect.

1. Reorganize settings/personalization around explicit scopes:
   - user-level
   - workspace-level
   - page/widget-level
2. Standardize toggle language, helper text, and destructive/safe affordances.
3. Make configuration impact clear before users commit a change.
4. Align settings cards and controls with the shared card/state system from earlier phases.
5. Validate with `npm run lint` and `npm run build`.

**Why fifth:** Settings cleanup depends on the shared visual/state rules established earlier.

---

### Phase 8 — Final polish and benchmark pass
Goal: close remaining quality gaps against the references after the structural work is done.

1. Run a full product-wide polish pass against `DESIGN_AUDIT.md`.
2. Tighten any remaining issues in:
   - spacing
   - typography
   - accent restraint
   - hover/focus transitions
   - responsive behavior
3. Verify the implemented result against the benchmark expectations from:
   - Airbnb
   - Linear
   - Notion
   - Stripe Dashboard
   - Vercel
4. Validate with `npm run lint` and `npm run build`.

**Why last:** This phase should refine a mostly-correct system, not patch around unfinished foundations.

## Workflow Rule for Each Phase
For every approved phase:
1. implement only that phase
2. verify in code
3. run `npm run lint`
4. run `npm run build`
5. create a dedicated branch
6. commit only that phase’s changes
7. push and open a PR
8. stop and wait for approval / merge before starting the next phase

## Next Required User Decision
Approve or revise the Phase 3–8 breakdown above.
