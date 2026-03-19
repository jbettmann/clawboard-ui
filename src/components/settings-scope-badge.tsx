import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { scopeMetadata, type ConfigScope } from "@/lib/settings-scopes";

export function ScopeBadge({ scope, className }: { scope: ConfigScope; className?: string }) {
  const meta = scopeMetadata[scope];
  return (
    <Badge
      variant="muted"
      className={cn("text-[0.55rem] font-semibold uppercase tracking-[0.3em]", className)}
      title={meta.description}
    >
      {meta.badge}
    </Badge>
  );
}
