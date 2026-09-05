# Momentodo — Product Requirements

## Core concept

A task app organized around **available time**, not just a flat list. The
core loop: open the app, tap how many minutes you have, get shown exactly
what fits.

## Needs (from original concept notes — MVP scope)

- Tasks, each with:
  - Estimated difficulty
  - Estimated priority (scale defined by the user, not fixed by the app)
- **Moment's Todo** (the main feature): show what tasks can be done if you
  have X minutes.
- Quick-add tasks:
  - Can be created incomplete (title only).
  - App asks for the missing details (time / difficulty / priority)
    shortly after, quickly and low-friction — not a blocking form.
- A 25-minute focus/productivity timer.
- A stopwatch for tasks (count-up, for open-ended work).

## Nice to haves (secondary priority, build after MVP is solid)

- Organization (filtering/sorting the full task list).
- Estimated completed progress (a sense of "how much of today is done").
- Priority estimation and difficulty estimation surfaced as reportable stats,
  not just task metadata.

## Screens

### 1. Home
- Header: app name + short tagline.
- **Moment cards**: 5 / 15 / 30 / 60 min, each a distinct color (see
  `design-tokens.json`). Tapping a card toggles an accordion beneath it
  listing tasks with `estimatedMinutes <= selected`. Tapping the same card
  again closes the accordion. Only one moment can be selected at a time.
- If no task fits the selected duration, show an empty state suggesting the
  user add a shorter task — don't just show a blank panel.
- A progress strip: `completedToday / totalToday`, as a small bar.
- "Up next": the top 3 incomplete tasks (by list order), each with a
  link/button to see the full list.
- Quick-add is available on this screen too (see Tasks screen for the full
  spec — same component, reused).

### 2. Tasks
- Quick-add input at the top (title only required).
- Status filter: All / Active / Done.
- Sort: added order (default) / priority / difficulty / time needed.
- Each task row: checkbox, title, tags (time, difficulty, priority — only
  shown once set), delete action.
- **Needs-details flow**: a task created via quick-add shows an inline
  "quick — got a sec to fill this in?" prompt directly under the title, with
  tappable pills for time (5/15/30/60), difficulty (Easy/Medium/Hard), and
  priority (Low/Med/High). Tapping a pill sets that field immediately — no
  save button per field. A "Done" pill dismisses the prompt regardless of
  whether all three fields were filled. The task remains fully usable
  (checkable, visible in Tasks) even if some fields are left unset; Home's
  moment-matching only considers tasks that do have a time estimate.

### 3. Timer
- Mode toggle: **Focus** (25:00 countdown) / **Stopwatch** (counts up).
- Optional binding: a dropdown of current incomplete tasks — associates the
  running session with a task for the log.
- Start / Pause / Reset.
- On finishing a focus countdown, or on reset after any elapsed time, log a
  session: task name (or "No task"), mode, duration, timestamp.
- A **session log** beneath the timer, most recent first.

### 4. Stats
- A completion ring: `completedToday / totalToday` as a percentage.
- Difficulty breakdown: count of tasks at each difficulty level, as
  horizontal bars.
- Priority breakdown: same, for priority levels.
- A "this week" bar chart of tasks completed per day.
  **This is mocked in the prototype with static numbers.** Building the
  real version requires persisting a daily completion count over time — see
  "What's mocked vs. real" below.

## Non-functional requirement: memory budget

The running app should stay under **300MB** of RAM in normal use (task
list of a realistic size, timer running, any screen open). See
`AGENTS.md`'s "Memory budget" section for the specific technical choices
this drives (runtime choice, no Electron, no heavy chart/date libraries,
bounded history loading). This is a constraint on every phase of
`BUILD_PLAN.md`, not a cleanup pass at the end.

## Data model

```ts
interface Task {
  id: string;
  title: string;
  estimatedMinutes: number | null;   // null until user sets it
  difficulty: 1 | 2 | 3 | null;      // Easy / Medium / Hard
  priority: 1 | 2 | 3 | null;        // Low / Med / High — see note below
  done: boolean;
  createdAt: string;                 // ISO timestamp
  completedAt: string | null;
}

interface TimerSession {
  id: string;
  taskId: string | null;             // null if no task was selected
  mode: 'focus' | 'stopwatch';
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
}
```

**Priority scale note:** the original concept calls for a priority scale
*defined by the user*, not fixed at Low/Med/High. The prototype hardcodes
three levels for simplicity. Treat the three-level scale as the MVP default,
but don't hardcode the *labels* in components — read them from a config
object so a future settings screen can let users rename or add levels
without a component rewrite.

## What's mocked vs. real (prototype → production gap)

| Feature | Prototype | Needs for production |
|---|---|---|
| Task list | In-memory JS array, resets on reload | Persisted store (localStorage/IndexedDB to start) |
| Timer sessions | In-memory array | Persisted, keyed by date for stats |
| Stats "this week" chart | Static mock numbers | Derived from real persisted `TimerSession`/completion history, grouped by day — query only the date range being displayed (see memory budget note above), don't load the full history table into memory to compute it |
| Priority/difficulty labels | Hardcoded 3 levels | Config-driven, ready for a future "customize scale" setting |
| Notifications/reminders | Not built | Out of scope for MVP — flag as a possible v2 |

## Acceptance criteria (per screen, for qa-agent)

- Home: selecting a moment card shows only tasks with `estimatedMinutes <=`
  the selected value; deselecting closes the accordion; empty state renders
  when nothing fits.
- Tasks: quick-add with only a title succeeds and immediately shows the
  needs-details prompt; setting a pill updates the task without a page
  reload; sort and filter can be combined.
- Timer: switching modes resets the display; starting, pausing, and
  resetting all behave correctly in both modes; a completed or
  meaningfully-elapsed session appears in the log.
- Stats: the ring percentage and difficulty/priority bars update
  immediately when a task's `done` state or fields change elsewhere in the
  app (shared store, not screen-local state).
- All screens: no hardcoded design values — verify against
  `design-tokens.json`.
- All screens: no unbounded in-memory data growth — history/session
  queries are range-scoped, not full-table loads. See memory budget above.
