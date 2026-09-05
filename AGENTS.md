# AGENTS.md — Momentodo

This file is read automatically by OpenCode's primary agent at session start.
It exists to give any agent — primary or sub — enough context to work without
re-deriving decisions that have already been made.

## What this project is

Momentodo is a task app built around one idea: **match tasks to the time you
actually have**, not just list them. Full requirements live in `PRD.md`.
Design decisions and exact visual tokens live in `design-tokens.json`. A
working, click-through reference implementation (HTML/CSS/JS, no build step)
is at `design-reference/momentodo-conceptC-polish.html` — open it in a
browser before writing any component code. It is the source of truth for
layout and interaction; PRD.md and design-tokens.json are the source of
truth for exact values.

## Chosen direction (do not re-litigate)

- **IA / structure:** "Moments-first" — a grid of colored time-duration cards
  (5/15/30/60 min) is the primary entry point on Home. Tapping one expands an
  accordion of tasks that fit. Four screens total: Home, Tasks, Timer, Stats.
- **Visual polish:** "Warm & Tactile" — saturated colors, chunky rounded
  corners (22px cards / 14px pills), colored glow shadows tinted to match
  each time-card's color, bouncy spring motion (`cubic-bezier(.34,1.56,.64,1)`,
  ~280ms) on taps and checkbox completion.
- These were chosen via blind A/B/C comparison at both the IA level and the
  polish level. Don't propose alternative IAs or palettes without being asked.

## Tech stack

**Recommended default:** Preact + TypeScript + Vite, shipped as an
installable PWA (works on phone and desktop from one codebase, running
inside the existing browser/WebView process rather than a bundled runtime).
Preact is used instead of React specifically for the memory budget below —
same component model and hooks API, but a ~3KB runtime instead of ~45KB and
a lighter virtual-DOM diff, with negligible cost to how the codebase reads
or how PRD.md/BUILD_PLAN.md's component boundaries apply. `preact/compat`
is available if any React-only library turns out to be needed.

State via a small store (Zustand is fine, it has no dependency on a large
runtime) with a persistence interface that starts backed by
`localStorage`/IndexedDB but is written so a real backend can be swapped in
later without touching components.

This is a recommendation, not a locked decision — if a native app (React
Native / Expo) is actually wanted, say so before Phase 0 in `BUILD_PLAN.md`
starts, since it changes the component layer and the memory budget below.

## Memory budget: target under 300MB

This is a hard constraint on the whole build, not just an optimization
pass at the end. Treat any choice below as the default; deviating from one
requires a stated reason.

- **Never wrap this app in Electron.** Electron bundles its own Chromium +
  Node process and commonly costs 150-300MB of baseline RAM before any app
  code runs — that alone could consume the entire budget. The PWA approach
  above avoids this because it runs inside a browser/WebView process the
  OS already has resident.
- **If a native shell is added later, use Capacitor, not Electron.**
  Capacitor renders through the OS's system WebView (already resident on
  the device) instead of bundling a browser, so its baseline overhead is
  far lower.
- **No heavy chart libraries.** The Stats screen's ring, breakdown bars,
  and week chart are all simple shapes — build them with plain SVG/CSS as
  the reference mockup does. Do not add Chart.js, D3, Recharts, or similar
  for this; they add real parsed/retained memory for functionality this
  app doesn't need (interactivity, tooltips, animation engines).
- **No moment.js.** Native `Date` (or `date-fns` with per-function imports,
  never the full package) covers everything this app needs.
- **No lodash as a full import.** Write the handful of small utilities
  needed directly, or import individual lodash functions
  (`lodash/debounce`, not `lodash`).
- **No Redux/Redux Toolkit.** Zustand (or comparable) is sufficient at this
  app's complexity and carries much less runtime weight.
- **Don't hold unbounded history in memory.** Stats' "this week" data and
  any future longer-range history should be queried from the persistence
  layer for the date range actually being displayed, not loaded in full
  every session — see `PRD.md`'s note on this.
- **Google Fonts: request only the weights actually used** (check
  `design-tokens.json` → `typography` before adding a weight to the
  `<link>` import), not a broad range "just in case."
- **Service worker cache scope stays small** — app shell and icons only,
  not a general-purpose asset cache that grows unbounded.
- If the task list is ever expected to grow into the thousands, revisit
  list virtualization (e.g. `@tanstack/virtual`) rather than rendering
  every row — not needed at MVP scale, but flagged here so it isn't
  forgotten if scope grows.

`qa-agent` checks this budget as part of its normal review — see its
agent definition and `BUILD_PLAN.md` Phase 3.

## Multi-agent workflow

This repo is set up for OpenCode's subagent model. Custom subagents live in
`.opencode/agent/`. The intended flow:

1. Run the built-in **plan** agent first against `BUILD_PLAN.md` to confirm
   the task breakdown and phase order before any files are touched. This
   matches how this project has always worked — a written plan comes before
   code.
2. Switch to **build** (primary) and dispatch phases to subagents, either
   with `@agent-name` or the `subagent` tool. Subagents run in fresh child
   sessions with no memory of this conversation, so always point them at the
   specific doc(s) they need (e.g. "read PRD.md §Data Model and
   design-tokens.json, then...").
3. Respect the dependency order in `BUILD_PLAN.md` — `ui-agent` and
   `state-agent` can run in parallel, but both must publish their
   interfaces/types before `screens-agent` starts consuming them.
4. `qa-agent` is read-mostly and reviews incrementally, per screen, not just
   at the very end.

## Non-negotiable engineering conventions

- **No hardcoded colors, radii, shadows, or motion timings in components.**
  Everything must reference the design tokens (as CSS variables or a theme
  object generated from `design-tokens.json`). This is how the app stays
  restyleable and how `ui-agent` and `screens-agent` stay in sync.
- **Static analysis is a gate, not a suggestion.** Before any agent reports a
  task done: run the type checker, run the linter, and for anything
  producing HTML run a tag-balance and duplicate-id check. A task is not
  complete if these haven't been run — silently skipping this step has
  caused real bugs to ship before.
- Quick-add tasks must be creatable with only a title; difficulty, priority,
  and time estimate are optional and filled in later via the "needs details"
  prompt — see PRD.md. Don't make any of those three fields required at
  creation.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Test: `npm run test`
- Build: `npm run build`
- Bundle size check: `npm run analyze` —
  run this whenever a new dependency is added, per the memory budget above.
