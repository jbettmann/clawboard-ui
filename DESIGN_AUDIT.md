# Airbnb

## Layout & Structure
Used Airbnb public web pages (https://www.airbnb.com/ and https://www.airbnb.com/host/homes) because the authenticated host dashboard UI is not publicly accessible without account state. The public host flow emphasizes large hero sections, clear value-prop blocks, and chunked informational modules with strong visual separation. Layout pattern is top-led narrative sections rather than dense operational dashboards.

## Navigation
Global top navigation is minimal and action-led (Become a host, Get started). Host-specific pages use focused pathways rather than deep multi-level IA. This keeps entry friction low but defers complexity to authenticated areas.

## Header/Toolbar
Header treatment is lightweight and marketing-first, with primary CTA prominence over utility controls. Toolbar-like controls are minimal on public pages; interaction is mostly forward navigation rather than in-place manipulation.

## Spacing & Density
Airbnb uses generous vertical rhythm, high whitespace, and clear block separation. Density is intentionally low on public host surfaces, improving scanability and trust.

## Typography
Large, friendly headline scales and readable body sizes create an approachable tone. Typographic hierarchy is obvious, with strong headline/body contrast and restrained use of all-caps labels.

## Color Usage
Color usage is restrained: neutral backgrounds with a small set of brand-accent moments. Emphasis is achieved more via spacing and hierarchy than heavy color coding.

## Interactive States
Primary interactions are CTA driven (hover/focus on buttons and links), with limited high-frequency state complexity on public pages. States prioritize clarity over compactness.

## Settings & Toggles
Public pages expose very few toggles/settings. Configuration patterns are intentionally deferred to account/onboarding flows.

# Linear

## Layout & Structure
Used public Linear marketing and docs pages (https://linear.app/ and https://linear.app/docs) because full workspace UI requires login. Public material still reveals a product architecture centered on left-anchored navigation, focused work panes, and structured panels for lists, timelines, and issue detail.

## Navigation
Navigation model is explicit and system-like: product pillars (Intake, Plan, Build, Monitor), then deeper task-level structures. Docs IA mirrors this with predictable sections, reinforcing a learnable mental model.

## Header/Toolbar
Top-level controls are compact and utility-forward. Linear surfaces command-like productivity patterns (quick access, keyboard-first behaviors) rather than oversized controls.

## Spacing & Density
Compared with Airbnb, Linear appears intentionally denser but still ordered. Rows, columns, and cards are tightly spaced with disciplined grid alignment to maximize information throughput.

## Typography
Typography is compact, high-legibility, and optimized for repeated scanning (lists, statuses, metadata). Hierarchy is clear but subtle; there is less decorative type and more operational consistency.

## Color Usage
Color is semantic and sparing: neutral base with focused accent colors for status, category, and active context. This supports fast state recognition without visual noise.

## Interactive States
Strong interactive affordances for selection, active rows, hover previews, status chips, and progress-oriented workflows are implied across public product demos and docs.

## Settings & Toggles
Linear patterns emphasize quick mode changes (filters/views/options) and configurable workflows. Settings are task-oriented and integrated into daily surfaces rather than isolated deep menus.

# Notion

## Layout & Structure
Used Notion public site and help content (https://www.notion.com/ and https://www.notion.com/help/guides) because most real workspace layouts are user-content-dependent and authenticated. Public documentation and product pages show a modular block-first system with flexible page composition.

## Navigation
Notion navigation pattern is workspace/page centric, typically anchored by a left sidebar and contextual page controls. IA is flexible rather than rigidly prescriptive, enabling different team structures.

## Header/Toolbar
Header and toolbar controls are contextual to the current page/document, with lightweight chrome and emphasis on content area ownership.

## Spacing & Density
Notion generally runs medium density: tighter than marketing tools, looser than issue trackers. Spacing supports writing/knowledge workflows with calm but not sparse composition.

## Typography
Typography is content-centric and readable for long-form mixed with structured data. Hierarchy supports quick switching between prose, lists, and database-like surfaces.

## Color Usage
Palette is neutral-first with optional subdued accents and label colors. Color assists categorization but avoids overpowering text content.

## Interactive States
Interactions favor inline editing, block-level actions, and contextual menus. States feel progressive and local (edit in place, reveal controls on focus/hover).

## Settings & Toggles
Notion uses numerous lightweight toggles for views, filters, properties, and page behavior. Settings are granular and often colocated with the object being configured.

# Stripe Dashboard

## Layout & Structure
Used Stripe Dashboard documentation (https://docs.stripe.com/dashboard and linked basics pages) because the actual dashboard (https://dashboard.stripe.com/) requires authentication. Docs describe a classic operations console structure: persistent sidebar, data-heavy primary content area, analytics home, and entity-detail drilldowns.

## Navigation
Stripe uses a robust left-sidebar IA with core sections (Home, Balances, Transactions, Customers, Product catalog), shortcut/pinning behavior, and product-grouped navigation. This supports both breadth and repeated expert workflows.

## Header/Toolbar
Toolbar behavior is action-oriented (filter, export, search, account context), with utility controls supporting operational tasks. Header space is functional, not decorative.

## Spacing & Density
Stripe is high-density compared with consumer-first products. Tables, filters, and metrics are tightly packed but systematically organized for financial operations.

## Typography
Typography prioritizes precision and legibility for numbers, statuses, and transaction metadata. Hierarchy supports quick anomaly detection and reconciliation tasks.

## Color Usage
Color is mostly semantic (success/warning/risk/informational) layered on neutral UI chrome. This reduces ambiguity in operational contexts.

## Interactive States
Interactive states are workflow-critical: sorting, filtering, drilldowns, multi-step actions, exports, and role-sensitive controls.

## Settings & Toggles
Docs highlight rich settings systems (personal, account, product), feature flags/early access, branding controls, role permissions, and product-specific toggles.

# Vercel

## Layout & Structure
Used Vercel public marketing/docs pages (https://vercel.com/ and https://vercel.com/docs) because complete project dashboards are account-scoped. Public materials show a product model oriented around projects, environments, deployments, observability, and collaboration surfaces.

## Navigation
Navigation is ecosystem-oriented: build/deploy/observe/security/tooling categories with clear documentation pathways. Product framing indicates environment-based and deployment-based navigation in app contexts.

## Header/Toolbar
Toolbar patterns are developer-utility focused (environment switching, deployment context, comments/toolbar integrations, performance tools), prioritizing speed over ornament.

## Spacing & Density
Vercel balances density and clarity: denser than marketing SaaS, less compressed than finance dashboards. Spacing remains controlled to support technical scanning.

## Typography
Typography is modern and technical, with concise labels and strong headline/body contrast. Documentation language and UI nomenclature are tightly aligned.

## Color Usage
Predominantly neutral/dark-friendly palette with precise accent usage for status and focus. Color is reserved for meaning and brand reinforcement.

## Interactive States
Strong emphasis on active states across deployments, previews, comments, and observability signals. Interaction model supports rapid iteration and review loops.

## Settings & Toggles
Settings culture is environment- and team-aware (feature flags, deployment protection, RBAC, observability controls). Toggles are treated as release/ops levers, not cosmetic options.

# clawboard-ui Comparison Against References

1. **Information hierarchy is too even.** Clawboard currently gives similar visual weight to many cards, while Linear/Stripe/Vercel concentrate emphasis on a small number of high-signal surfaces first, then secondary detail.
2. **Navigation model is clear but underpowered for scale.** Sidebar + sticky header foundation is strong, but compared with Stripe/Linear the IA lacks shortcut/pinning/filter depth for repeated operator flows.
3. **Density tuning is inconsistent.** Some cards are spacious (Airbnb-like) while others are operationally dense (Stripe-like), creating mixed rhythm instead of intentional mode-based density.
4. **Typography system lacks stronger role separation.** Current headings, labels, and helper text are readable but not as sharply differentiated as Linear/Stripe for quick scanning.
5. **State semantics are present but fragmented.** Status badges and tone panels exist, but treatment varies across pages; Stripe/Linear show more standardized status grammar.
6. **Settings patterns are functional but not unified.** Home personalization and connection guidance are useful, yet control patterns (shown/hidden, move up/down, variant buttons) feel mechanically mixed vs Notion/Stripe’s coherent settings logic.
7. **Interactive feedback could be more systematic.** Current controls work, but hover/active/selected/focus states are not yet consistently codified as a product-wide behavior language.

# Clawboard Design Plan

1. **Change:** Establish a strict two-tier information hierarchy per page: (a) mission-critical summary rail, (b) secondary detail modules.
   **Inspired by:** Linear, Stripe Dashboard, Vercel.
   **Why:** Reduces cognitive load and makes “what needs attention now” immediately obvious before users parse lower-priority cards.

2. **Change:** Introduce a unified status semantics system (tokens + copy rules) for healthy/watch/offline/risk states across all pages.
   **Inspired by:** Stripe Dashboard, Linear.
   **Why:** Consistent status grammar improves trust, accelerates scanning, and prevents conflicting interpretations of similar conditions.

3. **Change:** Redesign sidebar/header behavior for operational speed: support pinned destinations, recent views, and contextual page actions in a stable location.
   **Inspired by:** Stripe Dashboard shortcuts, Linear navigation discipline.
   **Why:** Frequent operators need faster route memory and fewer clicks than static nav alone provides.

4. **Change:** Define explicit density modes by surface type (overview, monitoring, settings) and apply consistent spacing scale per mode.
   **Inspired by:** Airbnb (breathing room), Linear/Stripe (compact operations), Vercel (balanced technical density).
   **Why:** Eliminates mixed rhythm and aligns visual density with task intent (sensemaking vs execution).

5. **Change:** Strengthen typography hierarchy with fixed roles (kicker, section title, card title, metric value, support text, metadata) and predictable size/weight mapping.
   **Inspired by:** Linear, Stripe Dashboard, Notion.
   **Why:** Faster scan paths and clearer grouping improve comprehension in multi-card dashboards.

6. **Change:** Standardize card architecture into a small set of reusable patterns (metric card, alert card, list card, action card, settings card) with consistent internal anatomy.
   **Inspired by:** Stripe Dashboard, Vercel, Linear.
   **Why:** Reduces visual noise and makes new pages feel immediately familiar.

7. **Change:** Unify interactive states across controls (default/hover/active/selected/focus/disabled/loading) and make selection states more pronounced.
   **Inspired by:** Linear, Vercel, Notion.
   **Why:** Predictable interaction feedback increases confidence and accessibility, especially in high-frequency workflows.

8. **Change:** Reframe settings and personalization into a coherent “configuration model” with clear scopes (user, workspace, page/widget) and consistent toggle language.
   **Inspired by:** Stripe Dashboard settings taxonomy, Notion contextual controls.
   **Why:** Users should understand what a change affects before committing it, reducing configuration errors.

9. **Change:** Limit accent color usage to high-value intent (primary action, critical state, selected context) while keeping neutral base dominant.
   **Inspired by:** Stripe Dashboard, Vercel, Airbnb.
   **Why:** Improves signal-to-noise and preserves calm tone without sacrificing urgency cues.

10. **Change:** Add explicit “empty/loading/error/recovery” journey standards per module with consistent messaging and action placement.
    **Inspired by:** Stripe operational workflows, Linear task continuity.
    **Why:** Reliability perception depends on graceful degraded states as much as ideal-state visuals.

# Sources Used

- https://www.airbnb.com/
- https://www.airbnb.com/host/homes
- https://linear.app/
- https://linear.app/docs
- https://www.notion.com/
- https://www.notion.com/help/guides
- https://docs.stripe.com/dashboard
- https://docs.stripe.com/dashboard/basics
- https://stripe.com/
- https://vercel.com/
- https://vercel.com/docs
