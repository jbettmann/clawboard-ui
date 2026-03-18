"use client";

import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ClawboardStateProvider } from "@/lib/clawboard-state";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ClawboardStateProvider>
      <AppShell pathname={pathname}>{children}</AppShell>
    </ClawboardStateProvider>
  );
}
