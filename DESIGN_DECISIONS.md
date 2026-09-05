# Design Decisions — Blind Test Winners

This file records the winning layout for each screen, chosen via blind
A/B/C/D comparison. These are the source of truth for how each screen
should look and feel. Don't re-litigate these without being asked.

## Details (Task creation / needs-details flow)

**Winner: Variant B — Labeled Rows**

The needs-details prompt groups pills into labeled rows under the task
title:
- **Time** row: 5m / 15m / 30m / 60m + custom number input
- **Difficulty** row: Easy / Medium / Hard
- **Priority** row: Low / Med / High

Each row has a small uppercase label (e.g. "TIME", "DIFFICULTY",
"PRIORITY") above its pills. A "Done" pill at the bottom dismisses the
prompt. The task remains fully usable even if some fields are left unset.

Reference: `design-reference/blind-test-details.html` (Variant B)

## Timer

**Winner: Variant D — Progress Ring**

The timer screen uses a circular progress ring as the primary element:
- SVG ring wraps the time display (25:00 for focus, 00:00 for stopwatch)
- Ring fills clockwise as time elapses (focus) or counts up (stopwatch)
- Selected task name shown inside the ring below the time
- Task label turns green when timer is running
- Ring stroke color: green when running, amber when paused, gray when idle
- Single toggle button: Start / Pause (no separate Pause button)
- Reset button alongside

Reference: `design-reference/blind-test-timer.html` (Variant D)

## Home

**Winner: Variant B — 2x2 Grid + Ring + Chips**

The home screen uses a 2x2 grid of moment cards with rich visual treatment:
- **2x2 grid** of larger cards (not 4-column compact grid)
- Each card has colored glow shadow matching its time color
  - 5min: amber glow, 15min: green glow, 30min: blue glow, 60min: red glow
- Selected card expands inline beneath the grid to show matching tasks
- Tasks shown as chips with dot indicator + task name + estimated time
- **Progress ring** in header area (completion percentage as mini ring)
- "Up next" as horizontal scrollable row of task chips

Reference: `design-reference/blind-test-home.html` (Variant B)

## Stats

**Winner: Variant C — Dashboard Grid**

The stats screen uses a dense dashboard layout:
- **2-column stat grid** at top: mini completion ring + key numbers
  (tasks completed, total, medium count, high priority count)
- **Stacked horizontal bars** for difficulty and priority breakdowns
  (single bar per category, segments colored by level)
- **Colored heatmap dots** for the week chart (28px rounded squares
  with intensity-based coloring: light green → dark green based on count)
- Overall feel: data-dense, scannable, no wasted space

Reference: `design-reference/blind-test-stats.html` (Variant C)
