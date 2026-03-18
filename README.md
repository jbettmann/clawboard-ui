# Clawboard UI

Phase 1 frontend foundation for Clawboard.

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

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` and adjust values as needed:

```bash
cp .env.example .env.local
```

## Scripts

```bash
npm run dev    # start dev server
npm run lint   # run ESLint
npm run build  # create production build
npm run start  # run production build
```

## UI Foundation Notes

- Shared shell layout lives in `src/components/app-shell.tsx`
- Reusable UI primitives live in `src/components/ui/*`
- Utility helpers live in `src/lib/*`
- Placeholder content uses `src/components/page-template.tsx`

## License

MIT
