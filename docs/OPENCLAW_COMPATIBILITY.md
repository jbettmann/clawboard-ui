# OpenClaw Compatibility (Phase 6)

This document defines the **minimal-effort drop-in story** for replacing the stock OpenClaw web UI with `clawboard-ui` while keeping OpenClaw gateway behavior intact.

## Compatibility goals

- Keep OpenClaw Gateway as the source of truth for API/auth.
- Treat `clawboard-ui` as a UI shell (no parallel auth system).
- Support easy switch-over and easy rollback.

---

## Wiring map (stock UI vs clawboard-ui)

| Concern | Stock OpenClaw UI | clawboard-ui compatibility mode |
|---|---|---|
| UI host | Served by existing OpenClaw web endpoint | Served by Next.js app (`clawboard-ui`) |
| API base | Existing gateway API routes | Same gateway API routes (proxied or direct) |
| Authentication | Existing OpenClaw auth/session flow | Reuse existing OpenClaw auth/session flow |
| Base URL assumption | OpenClaw gateway/web origin | `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL` + `NEXT_PUBLIC_OPENCLAW_API_BASE_URL` |
| Rollback | N/A | Point UI traffic back to stock UI endpoint |

### Assumptions

1. OpenClaw gateway continues to own `/api` and auth/session endpoints.
2. UI replacement should not require backend schema/auth changes.
3. Browser cookies/session handling should remain gateway-driven in `session-cookie` mode.

---

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL` – OpenClaw gateway origin (example: `http://localhost:3333`)
- `NEXT_PUBLIC_OPENCLAW_API_BASE_URL` – API path or full URL (example: `/api`)
- `NEXT_PUBLIC_OPENCLAW_AUTH_MODE` – `session-cookie` (default) or `bearer-token`
- `NEXT_PUBLIC_OPENCLAW_UI_MODE` – `drop-in` (default) or `standalone`
- `NEXT_PUBLIC_OPENCLAW_STOCK_UI_URL` – where stock UI is available for rollback

`src/lib/openclaw-compat.ts` is the compatibility layer that normalizes these settings and resolves the effective API base URL.

---

## Drop-in deployment options

## Option A (recommended): reverse proxy split

Run `clawboard-ui` separately, then route traffic as:

- `/` (UI pages) -> `clawboard-ui`
- `/api` + auth/session routes -> existing OpenClaw gateway

This keeps backend behavior unchanged while swapping the front end.

## Option B: standalone UI during migration

Run `clawboard-ui` on its own port/domain and point it to the gateway with env vars. Useful for validation before full cutover.

---

## Switch to clawboard-ui

1. Build and run clawboard-ui:
   - `npm install`
   - `npm run build`
   - `npm run start`
2. Configure env (`.env.local`) to target your gateway.
3. Update reverse proxy (or UI routing layer) so web traffic lands on clawboard-ui while gateway API/auth routes remain on OpenClaw.
4. Smoke test:
   - UI routes load (`/`, `/chat`, `/skills`, etc.)
   - connections page shows expected gateway/API/auth mode snapshot
   - API-backed flows (when wired) still resolve to gateway

---

## Revert to stock OpenClaw UI

Fast rollback is intentionally simple:

1. Point UI traffic back to stock OpenClaw UI origin/path.
2. Remove or disable clawboard-ui UI routing rule.
3. (Optional) keep clawboard-ui running in standalone mode for testing only.

No gateway API/auth rollback should be required because those were never replaced.

---

## Reality check for this repo phase

Phase 6 establishes compatibility scaffolding and docs so integration is operationally clear and low-risk.
Current UI surfaces are mostly local/demo state; backend API calls can be connected incrementally using the compatibility config without changing the drop-in strategy.
