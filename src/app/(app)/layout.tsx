"use client";

import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ClawboardStateProvider } from "@/lib/clawboard-state";
import { ThemePreferenceProvider } from "@/lib/theme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ClawboardStateProvider>
      <ThemePreferenceProvider>
        <AppShell pathname={pathname}>{children}</AppShell>
      </ThemePreferenceProvider>
    </ClawboardStateProvider>
  );
}
