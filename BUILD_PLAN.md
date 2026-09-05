# Build Plan

Read this with OpenCode's `plan` agent before any file gets touched. Each
phase lists which subagent(s) own it and whether phases/tasks inside a phase
can run in parallel.

## Phase 0 — Scaffold (sequential, single agent)

Owner: primary `build` agent (no subagent needed, it's one-shot setup).

- Init Vite + Preact + TypeScript project (see `AGENTS.md`'s memory
  budget for why Preact over React).
- Install state/store dependency (Zustand or equivalent — avoid
  Redux/Redux Toolkit) and testing/lint tooling (Vitest, ESLint, Prettier
  or equivalent). Add a bundle-size analyzer (e.g.
  `rollup-plugin-visualizer` for Vite) now, not after the app is already
  bloated.
- Create `src/theme/tokens.ts` generated from `design-tokens.json` (or a
  script that reads the JSON directly at build time — either is fine, but
  it must be one source, not hand-copied).
- Fill in the real commands in `AGENTS.md`'s Commands section once they
  exist.
- Commit before Phase 1 starts.

**Blocks everything below.**

## Phase 1 — Foundations (parallel: ui-agent + state-agent)

These two can run at the same time, but **both must post their public
interface first** (component prop types / store API shape) before writing
full implementations, so neither blocks the other and `screens-agent` in
Phase 2 has something to code against early.

### `ui-agent`
- Shared components, styled only from `src/theme/tokens.ts`:
  `MomentCard`, `TaskRow`, `NeedsDetailsPrompt` (the pill-based inline
  detail-filling UI), `BottomNav`, `TimerDisplay`, `Pill`/`Chip`,
  `ProgressBar`/`Ring`.
- Cross-check every component visually against
  `design-reference/momentodo-conceptC-polish.html` with the Polish B state
  active (it's the default in that file).
- No data-fetching, no store access — components take props only.

### `state-agent`
- Define `Task` and `TimerSession` types per `PRD.md` §Data model.
- Implement the store: task CRUD, moment-filtering selector
  (`tasksFittingMinutes(n)`), timer session logging, derived stats
  selectors (completed-today count, difficulty/priority breakdowns).
- Persistence layer behind an interface (`TaskRepository`) with a
  `localStorage`-backed implementation for now — no component should import
  `localStorage` directly.
- Priority/difficulty labels come from a config object, not hardcoded
  strings (see PRD note on user-defined priority scale).

## Phase 2 — Screens (parallel once Phase 1 interfaces exist)

Owner: `screens-agent`, or split further into one agent per screen
(`home-agent`, `tasks-agent`, `timer-agent`, `stats-agent`) if running fully
parallel — they touch disjoint files (`src/screens/Home.tsx` etc.) so this
is safe to fan out.

- Home: moment grid + accordion + progress strip + "up next" list.
- Tasks: quick-add + filter/sort + full list + needs-details flow.
- Timer: mode toggle, task binding dropdown, controls, session log.
- Stats: ring, breakdowns, week chart (explicitly mark the week chart's data
  source as mocked until real history exists — see PRD).

Each screen composes `ui-agent`'s components and reads/writes through
`state-agent`'s store. No screen should reach into another screen's local
state — everything shared goes through the store.

## Phase 3 — QA pass (per screen, not just at the end)

Owner: `qa-agent`. Review each screen from Phase 2 as it lands, don't wait
for all four.

- Run typecheck, lint, and tests; all must pass.
- Verify each screen against its acceptance criteria in `PRD.md`.
- Check for hardcoded colors/radii/shadows/motion values that bypass
  `src/theme/tokens.ts`.
- Confirm quick-add never requires time/difficulty/priority at creation.
- Basic accessibility pass: tap target sizes, color contrast on tags,
  focus order on the quick-add and pill controls.
- **Memory check**, at least once per phase and again at Phase 4: open the
  built app, run through all four screens and start/stop the timer a few
  times, then check JS heap size and total process/tab memory (browser
  DevTools Memory/Performance panel, or the equivalent WebView inspector
  if a native shell is in use). Flag anything trending toward the 300MB
  budget in `PRD.md`, and check for the specific causes listed in
  `AGENTS.md`'s memory budget section (an accidentally-added heavy
  dependency is the most common cause).

## Phase 4 — Integration polish (sequential, primary `build` agent)

- Wire navigation between all four screens if not already done in Phase 2.
- Confirm store updates in one screen (e.g. checking off a task on Home)
  are reflected live in others (Stats ring, Tasks list).
- Final full click-through against `PRD.md` acceptance criteria as a whole,
  not screen-by-screen.

## Explicitly out of scope for this build plan

- Electron wrapper — explicitly disallowed by the memory budget in
  `AGENTS.md`, not just deprioritized.
- Native app wrapper via Capacitor/Expo — revisit only if the PWA approach
  turns out to be insufficient; Capacitor is the fallback if it's needed,
  never Electron (see memory budget).
- Backend/sync — the persistence interface in Phase 1 is designed to make
  this a later swap, not a Phase-1 concern.
- Notifications/reminders, user accounts, and a settings screen for
  customizing the priority scale — all flagged as v2 in PRD.md.
