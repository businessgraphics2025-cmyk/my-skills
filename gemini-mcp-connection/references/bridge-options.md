# Gemini MCP bridge options, in more detail

Gemini CLI has no built-in "serve as MCP server" mode (confirmed against the official
`google-gemini/gemini-cli` docs as of September 2026). Every path that lets Claude Code call Gemini goes
through a third-party bridge process that itself speaks MCP to Claude, and either calls the Gemini API
directly or shells out to a locally-installed `gemini` binary. This file compares the maintained options;
`SKILL.md` covers the two recommended in the main flow.

## Comparison

| | `@rlabs-inc/gemini-mcp` | `centminmod/gemini-cli-mcp-server` |
|---|---|---|
| Auth | `GEMINI_API_KEY` env var | Reuses local `gemini` CLI login (or its own API key config) — no key handled by the bridge |
| Install | `npx -y @rlabs-inc/gemini-mcp` (no local clone needed) | `git clone` + Python venv + `npm install -g @google/gemini-cli` |
| Runtime deps | Node/npx only | Python 3.10+, `uv`, Node (for the `gemini` CLI itself) |
| Tool surface | Small — a query/prompt tool and an info/diagnostics tool | Large (~30 tools): plain prompting, conversations with memory, code review, git-diff review, structured extraction, cross-model comparison via OpenRouter |
| Good fit when | User wants the fastest path and doesn't mind an API key | User already has `gemini` authenticated locally and wants richer, code-review-shaped tools, or wants to avoid a second credential |

Both are community projects, not published/maintained by Google or Anthropic — mention this to the user
so they can judge the trust bar the same way they would for any other unofficial MCP server, especially
important for `gemini-cli-mcp-server` since it executes with the user's already-authenticated `gemini`
session.

Other bridges surfaced by a search (`cmdaltctr/claude-gemini-mcp-slim`,
`jamiewonderchild-claude-gemini-mcp`, listings on Glama/LobeHub) exist and follow the same
key-or-local-CLI pattern — worth mentioning as alternatives if neither default fits, but don't recommend
one you haven't actually read the setup for.

## Image generation bridges ("Nano Banana")

These are a separate category from the text bridges above — none of the text bridges generate images, and
neither does Gemini CLI itself. All wrap Gemini's image models (marketed as "Nano Banana" /
"Nano Banana Pro" — the underlying model IDs are `gemini-2.5-flash-image`, `gemini-3.1-flash-image`, and
`gemini-3-pro-image`) and need the same `GEMINI_API_KEY` as Option 1's text bridge.

| | `@jimothy-snicket/gemini-image-mcp` | `shinpr/mcp-image` | `mrafaeldie12/nano-banana-pro-mcp` |
|---|---|---|---|
| Scope | Gemini image models only, plus free local image processing (crop/resize/format) | Gemini, OpenAI, and BytePlus Seedream image models through one server | Focused specifically on the newer "Nano Banana Pro" (`gemini-3-pro-image-preview`) model |
| Good fit when | The user only wants Gemini and likes having free local-processing tools alongside it | The user wants to compare or switch between providers without juggling multiple MCP servers | The user specifically wants the higher-end Pro image model and nothing else |

A generated image is returned as a saved file path rather than streamed as raw image data through Claude's
context — this keeps a single generation call cheap in tokens even though the image itself is large.

Preview model IDs (`gemini-3-pro-image-preview`, `gemini-3.1-flash-image-preview`) are being phased out in
favor of general-availability IDs without the `-preview` suffix — if a bridge's default model 404s or
warns about deprecation, that's usually why; point the user at the bridge's own model-name setting rather
than assuming the whole bridge is broken.

## Gemini CLI's own `mcpServers` schema (Direction B)

Full shape of one entry in `~/.gemini/settings.json` or `.gemini/settings.json`:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "some-mcp-server-package"],
      "env": { "SOME_API_KEY": "$SOME_API_KEY" },
      "cwd": "/optional/working/directory",
      "timeout": 30000,
      "trust": false
    },
    "http-server-name": {
      "httpUrl": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer $TOKEN" }
    },
    "sse-server-name": {
      "url": "https://example.com/sse"
    }
  }
}
```

- `command`/`args`/`env`/`cwd` — for a locally-spawned stdio server (the most common shape).
- `httpUrl` — for a remote server speaking streamable HTTP.
- `url` — for a remote server speaking SSE.
- `trust: true` skips Gemini CLI's per-tool-call confirmation prompt for that server — only set it for a
  server the user genuinely trusts, same judgment call as Claude Code's own permission prompts.
- Env values can reference `$VAR_NAME` to pull from the shell environment rather than hardcoding secrets
  into the JSON file.
- Project-local `.gemini/settings.json` overrides the global `~/.gemini/settings.json` for entries with
  the same name.
- `gemini mcp add`, `gemini mcp list`, and `gemini mcp remove <name>` manage these entries from the CLI
  without hand-editing the JSON; useful to mention as the lower-friction path.
