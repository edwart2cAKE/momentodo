# Momentodo — OpenCode handoff package

Drop this folder's contents into the root of a new (or existing) repo and
open it with OpenCode. `AGENTS.md` is picked up automatically; the four
subagents in `.opencode/agent/` are auto-discovered too.

## Contents

- `AGENTS.md` — project context, read automatically by OpenCode. Includes
  a **300MB memory budget** section — the concrete technical choices
  (Preact over React, no Electron, no heavy chart/date libraries) that
  keep the running app under that.
- `PRD.md` — full product requirements: screens, data model, acceptance
  criteria, and an explicit list of what's mocked vs. what needs to be real.
- `BUILD_PLAN.md` — phased task breakdown with agent ownership and which
  phases/tasks can run in parallel.
- `design-tokens.json` — exact colors, radii, shadows, motion, and
  typography, extracted from the approved mockup. Source of truth for
  every visual value.
- `design-reference/momentodo-conceptC-polish.html` — the working,
  click-through mockup (no build step, just open it in a browser). Defaults
  to the chosen Polish B ("Warm & Tactile") state.
- `.opencode/agent/` — four subagents: `ui-agent`, `state-agent`,
  `screens-agent`, `qa-agent`. Each file explains its own scope.

## Suggested first session

1. Start OpenCode in the repo root.
2. Switch to the `plan` agent and ask it to review `BUILD_PLAN.md` and
   confirm the phase breakdown — this is a deliberate step, not a
   formality, since Phase 0's tech choices (see `AGENTS.md`) should be
   confirmed before code exists.
3. Switch to `build` and run Phase 0 yourself (it's a single sequential
   scaffold step, not worth a subagent).
4. From Phase 1 on, dispatch to `@ui-agent` and `@state-agent` — they can
   run in parallel once each has stated its interface.
5. Bring in `@screens-agent` (optionally split per-screen) once Phase 1's
   interfaces exist, then `@qa-agent` per screen as it lands.

If anything in `PRD.md` or `design-tokens.json` turns out to be wrong or
incomplete once real components exist, update those files rather than
letting the code and the docs drift apart — they're meant to stay the
source of truth through the whole build, not just at kickoff.
