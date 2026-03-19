export type ConfigScope = "user" | "workspace" | "page-widget";

export type ScopeMetadata = {
  title: string;
  description: string;
  badge: string;
};

export const scopeMetadata: Record<ConfigScope, ScopeMetadata> = {
  user: {
    title: "User scope",
    description: "Applies to your Clawboard account everywhere you sign in.",
    badge: "User",
  },
  workspace: {
    title: "Workspace scope",
    description: "Applies to everyone inside this workspace and its shared views.",
    badge: "Workspace",
  },
  "page-widget": {
    title: "Page · widget scope",
    description: "Only affects the home dashboard layout in this workspace.",
    badge: "Page",
  },
};
