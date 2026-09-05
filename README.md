# my-skills
Workspace for Claude skills

## Installed skills

### ui-ux-pro-max (v2.13.0)

[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) by
[nextlevelbuilder](https://github.com/nextlevelbuilder) — UI/UX design
intelligence for AI coding assistants, with searchable local databases of
styles, color palettes, font pairings, charts, and stack-specific UX
guidelines (React, Next.js, Vue, Svelte, Astro, SwiftUI, React Native,
Flutter, Tailwind, shadcn/ui, Jetpack Compose, Angular, Laravel, and more).

This was vendored directly into `.claude/skills/` because the
`/plugin marketplace add` / `/plugin install` commands used to install
Claude Code plugins aren't available in this environment. The plugin
bundles several skills, all copied in as-is:

- `.claude/skills/ui-ux-pro-max` — the core design-intelligence skill
- `.claude/skills/design` — brand identity, tokens, logos, CIP, slides, icons
- `.claude/skills/design-system` — token architecture & component specs
- `.claude/skills/ui-styling` — shadcn/ui + Tailwind UI implementation
- `.claude/skills/brand` — brand voice & messaging frameworks
- `.claude/skills/slides` — HTML presentation design
- `.claude/skills/banner-design` — social/ads/web/print banner design

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT
licensed — see `LICENSE`).
