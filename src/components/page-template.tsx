import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PageTemplate({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 1 Placeholder</Badge>
          <CardTitle className="mt-3 text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This route is intentionally scaffolded as a source-of-truth placeholder.
            Feature implementation will build on this stable shell.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
