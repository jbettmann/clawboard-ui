import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <PageTemplate
        title="Home"
        description="A calm launch point for Clawboard UI with system status and key actions."
      />

      <Card>
        <CardHeader>
          <CardTitle>Foundation status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Start Dev Session</Button>
          <Button variant="secondary">Open Roadmap</Button>
        </CardContent>
      </Card>
    </div>
  );
}
