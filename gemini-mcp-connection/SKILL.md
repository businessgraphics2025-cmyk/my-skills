---
name: gemini-mcp-connection
description: Guides connecting Claude Code to Google's Gemini via MCP (Model Context Protocol) — installing a bridge MCP server so Claude can call out to Gemini models, and/or configuring Gemini CLI's own mcpServers so it can consume MCP tools. Use this whenever the user mentions "Gemini MCP", "connect Gemini", "gemini mcp add", wants Claude and Gemini to collaborate or cross-check each other, asks how to give Claude Code access to Gemini, or hits errors setting up a Gemini-related MCP server (missing GEMINI_API_KEY, "gemini command not found", MCP server not showing up in `claude mcp list`). Trigger even if the user just says "Gemini" plus "MCP" without more detail — walk them through the setup rather than assuming they already know the mechanics.
---

# Connecting Claude Code to Gemini via MCP

## The one fact that resolves most confusion

**Gemini CLI (Google's official tool) is an MCP *client*, not an MCP server.** It can consume tools
from MCP servers you point it at, but it has no built-in mode where it exposes itself as a server for
something else — like Claude Code — to connect to.

So "connect Claude Code to Gemini MCP" almost always means one of two different, independent things.
Figure out which one the user wants before doing anything, since the setup and the JSON files involved
are completely different:

| The user wants... | What's actually needed |
|---|---|
| **Claude Code to be able to call Gemini** (ask it questions, get a second opinion, delegate a sub-task) | A small **bridge MCP server** that wraps the Gemini API or a locally-authenticated Gemini CLI, registered with Claude Code via `claude mcp add`. This is the common case — jump to [Direction A](#direction-a-claude-code-can-call-gemini-most-common). |
| **Gemini CLI to be able to call other MCP servers** (give Gemini the same kind of tool access Claude Code has) | Editing Gemini CLI's own `settings.json` under an `mcpServers` key. This has nothing to do with Claude. Jump to [Direction B](#direction-b-gemini-cli-consumes-mcp-servers). |

If it's ambiguous, ask. A good disambiguating question: *"Do you want Claude to be able to ask Gemini
things, or are you setting up Gemini CLI itself to use MCP tools?"* Most people asking about a "Gemini
MCP server" mean Direction A — they want multi-model collaboration inside Claude Code.

## Direction A: Claude Code can call Gemini (most common)

There's no single official bridge — a few community MCP servers wrap Gemini for this purpose. Pick based
on whether the user already has an authenticated `gemini` CLI or would rather use an API key directly.
See `references/bridge-options.md` for a fuller comparison; the two solid defaults:

### Option 1 — API-key based, npx, zero local setup (`@rlabs-inc/gemini-mcp`)

Fastest path if the user is fine pasting in a Gemini API key (free tier available from
[Google AI Studio](https://aistudio.google.com/apikey)).

```bash
claude mcp add gemini -s user -- env GEMINI_API_KEY=<their-key> npx -y @rlabs-inc/gemini-mcp
```

- `-s user` registers it for that user across all projects; use `-s project` (writes `.mcp.json` in the
  repo, shareable via git) or `-s local` (default, current project only, private) instead if that fits
  better — explain the difference rather than picking silently, since `-s project` puts the command
  (though not the key, if they instead put it in a `.env`) into a file that gets committed.
- Never hardcode the API key into a file that gets committed. Prefer passing it as an env var on the
  command line, or via a local `.env` the user's shell loads, not inline in `.mcp.json`.

### Option 2 — Uses the user's already-authenticated `gemini` CLI, no API key (`gemini-cli-mcp-server`)

Better if the user already runs `gemini` locally (logged in via Google, not an API key) and wants Claude
to reuse that session instead of managing a second credential.

```bash
git clone https://github.com/centminmod/gemini-cli-mcp-server.git
cd gemini-cli-mcp-server
uv venv && source .venv/bin/activate && uv pip install -r requirements.txt
claude mcp add gemini-cli -s user -- /absolute/path/to/.venv/bin/python /absolute/path/to/mcp_server.py
```

Use absolute paths for both the interpreter and the script — Claude Code launches the server from an
arbitrary working directory, so relative paths silently fail to resolve.

### Verify the connection

```bash
claude mcp list        # should show the new server as "connected", not "failed"
```

Inside a Claude Code session, `/mcp` lists connected servers and their tools. If Gemini's tools don't
show up, restart the Claude Code session — MCP servers are only discovered at session start.

Once connected, the user doesn't need special syntax — just ask Claude something like *"ask Gemini to
review this function"* or *"get a second opinion from Gemini on this approach"*, and Claude will call the
exposed tool (commonly named `gemini_query`, `gemini_prompt`, or similar depending on which bridge was
installed — check `/mcp` for the exact tool names).

### Troubleshooting

- **Server shows "failed" in `claude mcp list`** — run the launch command by hand in a terminal (strip
  the `claude mcp add` wrapper, just run what comes after `--`) and read the actual error; a bad
  `GEMINI_API_KEY` or a missing `npx`/`node` install are the two most common causes.
- **"gemini: command not found"** during setup of Option 2 — `npm install -g @google/gemini-cli` first,
  then confirm with `gemini --version`.
- **Tool calls time out or return auth errors** — for Option 2, run `gemini` interactively once first to
  complete its own login/API-key flow; the bridge reuses that local auth and can't complete it for the
  user.

## Direction B: Gemini CLI consumes MCP servers

This configures Gemini CLI the same way you'd configure Claude Code — giving *it* access to MCP tools
(GitHub, filesystem, whatever). It does not connect Gemini to Claude in any way.

Add entries under `mcpServers` in `~/.gemini/settings.json` (global) or `.gemini/settings.json`
(project-local, takes precedence):

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "some-mcp-server-package"],
      "env": { "SOME_API_KEY": "..." }
    }
  }
}
```

Or via the CLI itself: `gemini mcp add --transport http my-server https://example.com/mcp`. Remove one
with `gemini mcp remove my-server`. Gemini CLI needs a restart to pick up changes to `mcpServers`. See
`references/bridge-options.md` for the full settings schema (stdio vs. `httpUrl` vs. SSE transports).

## Safety notes

- Treat any Gemini API key like any other credential: keep it out of files committed to git, prefer
  environment variables or the platform keychain, and never echo it back in full when confirming setup.
- A bridge server that shells out to a local `gemini` CLI runs with the user's own authenticated session
  — installing one from an unfamiliar repo means trusting that code with whatever `gemini` can already
  do. Point this out if the user is installing a less well-known bridge than the two listed above.
