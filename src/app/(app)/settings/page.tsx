import Link from "next/link";

import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageTemplate
        title="Settings"
        description="Configure preferences, comfort defaults, and view activity history in simple language."
      />

      <Button asChild variant="secondary">
        <Link href="/settings/advanced">Open Status & History</Link>
      </Button>
    </div>
  );
}
