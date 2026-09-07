# Feature Spec: Real Data for the Stats "This Week" Heatmap

## Context

`src/screens/Stats.tsx` currently renders a hardcoded array (`weekMock`) for
the "This week" heatmap instead of real completion history. This was always
flagged as mocked (see `PRD.md`'s "What's mocked vs. real" table). Real data
is fully available: every `Task` already gets a real `completedAt` ISO
timestamp set in `taskStore.ts`'s `toggleTask` when it's marked done, and
cleared back to `null` if un-toggled.

## Requirements

### 1. New selector
Add `useWeeklyCompletions()` to `src/store/selectors.ts`:
- Returns `{ label: string; date: string; count: number }[]`, 7 entries,
  matching the shape `Stats.tsx` already expects from `weekMock` (`{ l, n }`
  today — rename fields when wiring in, see below).
- Window: the 7 most recent calendar days ending today (rolling window),
  labeled with short weekday names (`Mon`, `Tue`, ...) — matches the
  existing mock's labels. (A fixed Mon–Sun week is an alternative; rolling
  7-day is preferred since it reads sensibly on every day of the week, not
  just after Monday.)
- Bucket `tasks.filter(t => t.completedAt)` by the calendar day of
  `completedAt` (local time, not UTC, so a task completed at 11pm doesn't
  land in the wrong day for the user).
- Must be a `useShallow`-wrapped Zustand selector, consistent with the
  existing selectors in the same file (`useDifficultyBreakdown`, etc.).

### 2. Wire into `Stats.tsx`
- Replace the `weekMock` import/usage with `useWeeklyCompletions()`.
- `heatmapLevel()` thresholding logic (0 / 1 / 2 / 3+ tiers) stays as-is —
  it already takes a plain `n: number` and doesn't care where it comes from.
- No visual changes required; this is a data-source swap only.

### 3. Memory/perf constraint
Per `AGENTS.md`'s memory budget and `PRD.md`'s note on this exact feature:
compute the 7-day bucketing from the already-in-memory `tasks` array (it's
already fully loaded for the rest of the app) — do **not** add a new
persisted "daily completion count" table or a separate history fetch for
this pass. This keeps the change small and avoids a new persistence
concern; if the task list grows very large in the future, revisit with a
range-scoped query, but that's out of scope here.

## Non-functional
- No new dependencies (no date library — plain `Date` methods are
  sufficient for calendar-day bucketing and weekday labels).
- Stays within existing component structure; `Stats.tsx`'s JSX/layout is
  unchanged.

## Acceptance criteria (qa-agent)
- Completing a task today immediately increments today's bucket in the
  heatmap (shared store, so this should update live without a reload —
  same pattern as the ring/breakdowns already updating live).
- Un-completing a task decrements the correct day's bucket (since
  `completedAt` is cleared on un-toggle).
- A task completed yesterday shows up under yesterday's label, not today's
  (verifies local-time day bucketing, not UTC off-by-one).
- Heatmap with zero completions in the window renders all-zero tiles via
  the existing `heatmapLevel(0)` styling — no crash on an empty week.
- Typecheck, lint, and existing tests all still pass.
- No hardcoded design values introduced — verify against
  `design-tokens.json` (should be unaffected, since this is data-only).

## Explicitly out of scope for this pass
- Changing the mocked-vs-real fix for `useCompletedToday`/`useTotalToday`
  (those currently count all-time/all tasks despite the "today" naming,
  which affects the ring and stat cards above the heatmap, not the heatmap
  itself) — tracked separately, not part of this spec.
- A history view beyond 7 days.
- Persisted daily-aggregate table (see memory/perf note above).
