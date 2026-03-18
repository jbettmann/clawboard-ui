export type OpenClawAuthMode = "session-cookie" | "bearer-token";

export type OpenClawUiMode = "standalone" | "drop-in";

export type OpenClawCompatibilityConfig = {
  gatewayUrl: string;
  apiBaseUrl: string;
  authMode: OpenClawAuthMode;
  uiMode: OpenClawUiMode;
  stockUiUrl: string;
};

const DEFAULTS: OpenClawCompatibilityConfig = {
  gatewayUrl: "http://localhost:3333",
  apiBaseUrl: "/api",
  authMode: "session-cookie",
  uiMode: "drop-in",
  stockUiUrl: "http://localhost:3000",
};

function normalizeUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export function getOpenClawCompatibilityConfig(): OpenClawCompatibilityConfig {
  return {
    gatewayUrl: normalizeUrl(process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL, DEFAULTS.gatewayUrl),
    apiBaseUrl: normalizeUrl(process.env.NEXT_PUBLIC_OPENCLAW_API_BASE_URL, DEFAULTS.apiBaseUrl),
    authMode:
      process.env.NEXT_PUBLIC_OPENCLAW_AUTH_MODE === "bearer-token"
        ? "bearer-token"
        : DEFAULTS.authMode,
    uiMode: process.env.NEXT_PUBLIC_OPENCLAW_UI_MODE === "standalone" ? "standalone" : DEFAULTS.uiMode,
    stockUiUrl: normalizeUrl(process.env.NEXT_PUBLIC_OPENCLAW_STOCK_UI_URL, DEFAULTS.stockUiUrl),
  };
}

export function resolveApiBaseUrl(config: OpenClawCompatibilityConfig) {
  if (config.apiBaseUrl.startsWith("http://") || config.apiBaseUrl.startsWith("https://")) {
    return config.apiBaseUrl;
  }

  return `${config.gatewayUrl.replace(/\/$/, "")}${config.apiBaseUrl.startsWith("/") ? config.apiBaseUrl : `/${config.apiBaseUrl}`}`;
}

export const OPENCLAW_COMPAT_ASSUMPTIONS = [
  "OpenClaw Gateway owns authentication and API routes.",
  "clawboard-ui is a presentation layer and should not implement a second auth system.",
  "In drop-in mode, route UI traffic to clawboard-ui while keeping /api and auth endpoints on the existing gateway.",
] as const;
