# Feature Spec: Settings Screen

## Context

There is currently no Settings screen. Logout lives as a lone button inside
`Sidebar.tsx`, and no other account/preference/data controls exist anywhere
in the app. This spec adds a proper `Settings` screen and moves account
actions into it.

## Requirements

### 1. Navigation
- New `Screen` union member: `'settings'`, added everywhere the existing
  `type Screen = 'home' | 'tasks' | 'timer' | 'stats'` is declared
  (`app.tsx`, `Sidebar.tsx`, `BottomNav.tsx`).
- Add a 5th tab (`iconography` needs a new icon key, e.g. `settings`) to both
  `Sidebar.tsx` and `BottomNav.tsx`.
- Remove the standalone logout button currently rendered at the bottom of
  `Sidebar.tsx`; Sidebar now only navigates to Settings like any other tab.
  `onLogout`/`isAuthenticated` props move from `Sidebar` into the new
  `Settings` screen.

### 2. Account section
- Display the signed-in identity. `supabaseClient.ts` stores the raw
  username in `user_metadata.username` at signup but has no getter for it —
  add `getCurrentUser(): Promise<{ id: string; username: string | null } | null>`
  that reads `supabase.auth.getSession()` and pulls
  `data.session?.user.user_metadata?.username` (fall back to the email
  local-part if not present, e.g. for accounts that signed up with a real
  email).
- If offline/skip-auth mode (`localStorage[SKIP_AUTH_KEY] === 'true'`, same
  check `app.tsx` already does): show "Not signed in" plus a button that
  routes to `LoginScreen` (reuse existing `onAuthenticated`/
  `onContinueOffline` flow — Settings doesn't need its own auth logic, just
  a way back into it).
- **Change password**: new form (current flow has none). Call
  `supabase.auth.updateUser({ password })` — add this as a new export in
  `supabaseClient.ts`. Requires an active session; show inline error on
  failure, inline success confirmation on success. No password strength
  requirements beyond what Supabase enforces server-side.
- **Log out**: move the existing `handleLogout` logic (currently defined
  inline in `app.tsx`) here as-is — it already correctly calls `signOut()`,
  clears `SKIP_AUTH_KEY`, and calls `setActiveRepository(null)`. Only the
  trigger location changes, not the logic.

### 3. Data section
- **Export data**: serialize `await repository.getTasks()` (already
  available via `store/persistence.ts`) to JSON and trigger a browser
  download (`Blob` + temporary `<a download>`, no new dependency needed).
  Include `TimerSession` data too via `repository.getSessions()`.
- **Clear local data**: destructive action, requires a confirm step (a
  second tap/dialog, not a single click). Clears local storage keys
  (`momentodo_tasks`, `momentodo_sessions`) — does **not** touch a signed-in
  user's remote Supabase data; scope this button to local/offline mode only,
  or clearly label it as "local device only" if shown while signed in.
- **Delete account**: out of scope for this pass — flag as a TODO/future
  item rather than building it, since it needs a Supabase-side admin call
  (`auth.admin.deleteUser`) that can't run from the client with the anon
  key. Don't stub a button that doesn't work.

### 4. Preferences section
- **Reduce motion** toggle only, for this pass. Persist as a simple boolean
  in a new lightweight `settingsStore.ts` (Zustand, `localStorage`-backed —
  same pattern as `taskStore`/`timerStore`, no need to route this through
  Supabase sync). Components currently read `motion.duration`/
  `motion.easing` directly from `theme/tokens.ts` for transitions; the
  cleanest hook-up is a small `useMotionPreference()` selector that
  `theme/tokens.ts` consumers check before applying a transition duration —
  full audit of every `transition:` usage is out of scope for this pass,
  but the toggle and its persisted value must exist and work end to end for
  at least the Sidebar/BottomNav tab transitions as a working example.
- Do **not** build: default moment-duration customization (`MOMENT_DURATIONS`
  is a fixed tuple in `types.ts`; changing it is a data-model change, not a
  settings toggle), notification preferences (no notification system exists
  anywhere in the codebase), theme/dark-mode switching (no alternate token
  set exists).

### 5. About section
- Static: app name, a version string (hardcode `0.1.0` or read from
  `package.json` at build time if trivial), a link to the GitHub repo.

## Non-functional
- Stay within the existing 300MB budget — this feature adds no new heavy
  dependencies (no date/chart libs needed here).
- All styling from `src/theme/tokens.ts` only, matching every other screen.

## Acceptance criteria (qa-agent)
- Settings is reachable from both Sidebar (desktop) and BottomNav (mobile).
- Signed-in state shows the correct username/email and a working change-
  password form; signed-out/offline state shows a working path back to
  `LoginScreen`.
- Logging out from Settings behaves identically to the old Sidebar button
  (verify against `app.tsx`'s `handleLogout` — same end state: `authPhase`
  returns to `'needsAuth'`).
- Export produces a valid JSON file containing all current tasks and
  sessions.
- Clear local data requires a confirmation step and does not fire on a
  single accidental tap.
- Reduce-motion toggle persists across a reload and visibly disables at
  least one transition (Sidebar/BottomNav tab switching).
- No hardcoded design values — verify against `design-tokens.json`.
- Typecheck, lint, and existing tests all still pass.

## Explicitly out of scope for this pass
- Delete account.
- Notification settings.
- Dark mode / theming.
- Customizable moment durations or priority/difficulty scale editing.
