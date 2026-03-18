# Demo & Screenshot Assets

This project includes a lightweight structure for visual documentation:

- `docs/assets/screenshots/` → still screenshots used in docs/PRs
- `docs/assets/demos/` → short GIF/MP4 demos for feature walkthroughs

## Suggested naming convention

Use stable, descriptive names so assets are easy to reference:

- `home-dashboard-light.png`
- `chat-workspace-keyboard-nav.png`
- `connections-guided-setup.gif`

Format: `<surface>-<scenario>.<ext>`

## Capture guidance

1. Use realistic sample content (no secrets, tokens, private data).
2. Capture at desktop width first (1366px+), then optional narrow/mobile.
3. For accessibility-sensitive changes, capture:
   - visible focus state
   - high contrast legibility
   - any status cue that could rely on color
4. Keep demo clips short (10–30s) and task-focused.

## Where to reference assets

- README updates
- Phase notes in `PLAN.md`
- PR descriptions (`.github/pull_request_template.md`)

Tip: prefer optimized PNG/WebP for screenshots and compressed GIF/MP4 for demos.
