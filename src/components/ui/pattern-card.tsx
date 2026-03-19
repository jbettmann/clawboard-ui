import type { ComponentProps } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PatternCardRole = "metric" | "alert" | "list" | "action" | "settings";

const roleClass: Record<PatternCardRole, string> = {
  metric: "card-metric",
  alert: "card-alert",
  list: "card-list",
  action: "card-action",
  settings: "card-settings",
};

export function PatternCard({ role, className, ...props }: ComponentProps<typeof Card> & { role: PatternCardRole }) {
  return <Card className={cn(roleClass[role], className)} {...props} />;
}
