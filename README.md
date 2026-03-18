# Clawboard UI

Phase 1–7 frontend foundation for Clawboard.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- shadcn/ui-oriented component baseline

## Route Scaffold

- `/` → Home
- `/chat`
- `/skills`
- `/jobs`
- `/outputs`
- `/connections`
- `/settings`
- `/settings/advanced`

## Quick Start (Local)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Production Run Path (Local)

```bash
npm run build
npm run start
```

## Docker Run Path (Phase 7)

### Build and run

```bash
cp .env.example .env.local
docker compose up -d --build
```

Open http://localhost:3000.

### Stop

```bash
docker compose down
```

## Environment Setup

Copy `.env.example` to `.env.local` and adjust values as needed:

```bash
cp .env.example .env.local
```

Most important environment keys:

- `NEXT_PUBLIC_OPENCLAW_UI_MODE`
- `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL`
- `NEXT_PUBLIC_OPENCLAW_API_BASE_URL`
- `NEXT_PUBLIC_OPENCLAW_AUTH_MODE`
- `NEXT_PUBLIC_OPENCLAW_STOCK_UI_URL`

Compatibility-specific settings for OpenClaw gateway/API/auth are documented in `docs/OPENCLAW_COMPATIBILITY.md`.

For plain-language setup instructions, see `docs/INSTALL_SETUP.md`.

## Scripts

```bash
npm run dev    # start dev server
npm run lint   # run ESLint
npm run build  # create production build
npm run start  # run production build
```

## OpenClaw Drop-In Compatibility (Phase 6)

- See `docs/OPENCLAW_COMPATIBILITY.md` for the wiring map, assumptions, switch-over steps, and rollback steps.
- Compatibility layer lives at `src/lib/openclaw-compat.ts`.
- `Connections` UI now includes a live compatibility snapshot (gateway/API/auth mode) based on env vars.

## Packaging & Installability (Phase 7)

- Multi-stage Docker build for production image (`Dockerfile`)
- One-command local container startup (`docker-compose.yml`)
- Standalone Next.js build output enabled (`next.config.ts`)
- Non-technical setup guide added (`docs/INSTALL_SETUP.md`)

## UI Foundation Notes

- Shared shell layout lives in `src/components/app-shell.tsx`
- Reusable UI primitives live in `src/components/ui/*`
- Utility helpers live in `src/lib/*`
- Placeholder content uses `src/components/page-template.tsx`

## License

MIT
