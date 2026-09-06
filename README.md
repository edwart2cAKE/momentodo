# Momentodo

A task app organized around available time. Instead of a flat list, you see colored time-duration cards (5, 15, 30, 60 min) — tap one to see tasks that fit.

## Features

- **Moments-first home** — 2x2 grid of colored time cards; tap to expand matching tasks
- **Smart quick add** — type `call dentist 15m @errands` and NLP parses duration, tags, due dates, difficulty, and priority
- **Task editing** — ⋮ menu on every task to edit title, time, difficulty, priority, due date, tags, recurrence, and subtasks
- **Due dates** — overdue/today/tomorrow badges, "Due" sort option, tasks with future dates still appear in moment matching
- **Tags** — color-coded `@errands`, `@work`, etc. with filter support
- **Subtasks** — nested task lists with indent
- **Recurring tasks** — daily/weekly/monthly/weekday patterns with auto-regeneration
- **Timer** — focus (countdown) and stopwatch modes with circular progress ring, session log
- **Stats** — completion ring, difficulty/priority breakdowns, weekly heatmap
- **Responsive** — mobile-first with desktop sidebar layout (≥768px)

## Tech Stack

- **Preact** + TypeScript + Vite (3KB runtime vs React's 45KB)
- **Zustand** for state with localStorage persistence
- **PWA** — installable, works offline
- **No heavy dependencies** — no chart libraries, no moment.js, no lodash

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Type checking |
| `npm run lint` | Lint + auto-fix |
| `npm run analyze` | Bundle size analysis |

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── MomentCard    # Time-duration card for home grid
│   ├── Ring          # SVG progress ring
│   ├── TaskRow       # Task item with checkbox, tags, due date, ⋮ menu
│   ├── TaskEditDropdown  # Popover (desktop) / bottom sheet (mobile) editor
│   ├── TaskEditMenu  # Full task editing form
│   ├── NeedsDetailsPrompt  # Inline detail-filling for quick-add tasks
│   └── Sidebar       # Desktop navigation
├── screens/          # Home, Tasks, Timer, Stats
├── store/            # Zustand store + localStorage persistence
├── theme/            # Design tokens → CSS variables / theme object
├── types/            # Task, Tag, RecurrencePattern types
├── utils/            # NLP parser, date helpers
└── hooks/            # useMediaQuery, useInterval
```

## Design System

All colors, radii, shadows, and motion values come from `design-tokens.json` via `src/theme/tokens.ts`. No hardcoded values in components.

## Multi-Agent Setup

This repo includes OpenCode subagents in `.opencode/agent/`:

- **ui-agent** — shared components styled from tokens
- **state-agent** — store, types, persistence
- **screens-agent** — screen implementations
- **qa-agent** — code review, accessibility, PRD compliance

See `AGENTS.md` for full context and engineering conventions.

## Memory Budget

Target: **under 300MB** runtime. Enforced by:

- Preact over React (~3KB vs ~45KB runtime)
- No Electron (PWA runs in existing browser/WebView)
- No heavy chart libraries (SVG/CSS only)
- Per-function date imports, not full packages
- Service worker caches only app shell + icons

## License

Private — not for distribution.
