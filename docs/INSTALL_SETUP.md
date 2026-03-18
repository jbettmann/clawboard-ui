# Clawboard UI Setup (Non-Technical Friendly)

This guide gives you two easy ways to run Clawboard UI:

1. **Simple app mode** (Node.js + npm)
2. **Docker mode** (recommended if you want a one-command start)

---

## Before you start

You need:

- This project folder (`clawboard-ui`)
- A running OpenClaw gateway (usually `http://localhost:3333`)

---

## Step 1: Create your local settings file

From the project folder, copy the sample settings:

```bash
cp .env.example .env.local
```

The default values already work for most local setups. If your gateway uses another URL, update this line in `.env.local`:

```env
NEXT_PUBLIC_OPENCLAW_GATEWAY_URL=http://localhost:3333
```

---

## Option A — Run without Docker

### 1) Install dependencies

```bash
npm install
```

### 2) Start in development mode (best for trying things)

```bash
npm run dev
```

Open: http://localhost:3000

### 3) Run in production mode (stable run path)

```bash
npm run build
npm run start
```

Open: http://localhost:3000

---

## Option B — Run with Docker (packaged path)

### 1) Build and run with Docker Compose

```bash
docker compose up -d --build
```

### 2) Open the app

http://localhost:3000

### 3) Check logs (if needed)

```bash
docker compose logs -f
```

### 4) Stop the app

```bash
docker compose down
```

---

## Quick troubleshooting

- **Port 3000 already in use:** change mapping in `docker-compose.yml` from `3000:3000` to `3001:3000` and open `http://localhost:3001`.
- **Gateway not reachable:** verify `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL` in `.env.local`.
- **Blank or unexpected data:** check compatibility settings in `.env.local` and review `docs/OPENCLAW_COMPATIBILITY.md`.

---

## What file should I edit for configuration?

Use `.env.local` only.

Most important settings:

- `NEXT_PUBLIC_OPENCLAW_UI_MODE` (`drop-in` or `standalone`)
- `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL`
- `NEXT_PUBLIC_OPENCLAW_API_BASE_URL`
- `NEXT_PUBLIC_OPENCLAW_AUTH_MODE`
- `NEXT_PUBLIC_OPENCLAW_STOCK_UI_URL`
