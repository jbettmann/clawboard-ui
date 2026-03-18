import Link from "next/link";

import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageTemplate
        title="Settings"
        description="Configure preferences, access, and behavior defaults for Clawboard UI."
      />

      <Button asChild variant="secondary">
        <Link href="/settings/advanced">Go to Advanced Settings</Link>
      </Button>
    </div>
  );
}
