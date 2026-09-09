import { create } from 'zustand'
import type { TimerSession } from '../types'
import { repository, onRepositoryChange } from './persistence'
import { useTaskStore } from './taskStore'

const FOCUS_SECONDS = 25 * 60

interface TimerState {
  mode: 'focus' | 'stopwatch'
  remaining: number
  elapsed: number
  running: boolean
  selectedTaskId: string | null
  sessions: TimerSession[]
  hydrated: boolean
  intervalId: ReturnType<typeof setInterval> | null

  init: () => Promise<void>
  setMode: (mode: 'focus' | 'stopwatch') => void
  setSelectedTaskId: (id: string | null) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  logSession: () => void
}

function persistSessions(sessions: TimerSession[]): void {
  repository.saveSessions(sessions).catch((err) => {
    console.error('Failed to save timer sessions:', err)
  })
}

export const useTimerStore = create<TimerState>((set, get) => {
  onRepositoryChange(() => {
    set({ hydrated: false, sessions: [] })
    get().init()
  })

  return {
    mode: 'focus',
    remaining: FOCUS_SECONDS,
    elapsed: 0,
    running: false,
    selectedTaskId: null,
    sessions: [],
    hydrated: false,
    intervalId: null,

    init: async () => {
      const sessions = await repository.getSessions()
      set({ sessions, hydrated: true })
    },

    setMode: (mode) => {
      const state = get()
      if (state.intervalId) clearInterval(state.intervalId)
      set({ mode, remaining: FOCUS_SECONDS, elapsed: 0, running: false, intervalId: null })
    },

    setSelectedTaskId: (id) => set({ selectedTaskId: id }),

    start: () => {
      const state = get()
      if (state.running) return
      const id = setInterval(() => get().tick(), 1000)
      set({ running: true, intervalId: id })
    },

    pause: () => {
      const state = get()
      if (state.intervalId) clearInterval(state.intervalId)
      set({ running: false, intervalId: null })
    },

    reset: () => {
      const state = get()
      if (state.running || state.elapsed > 0 || (state.mode === 'focus' && state.remaining < FOCUS_SECONDS)) {
        state.logSession()
      }
      if (state.intervalId) clearInterval(state.intervalId)
      set({ remaining: FOCUS_SECONDS, elapsed: 0, running: false, intervalId: null })
    },

    tick: () => {
      const state = get()
      if (state.mode === 'focus') {
        if (state.remaining > 0) {
          set({ remaining: state.remaining - 1 })
        } else {
          state.logSession()
          if (state.intervalId) clearInterval(state.intervalId)
          set({ remaining: FOCUS_SECONDS, running: false, intervalId: null })
        }
      } else {
        set({ elapsed: state.elapsed + 1 })
      }
    },

    logSession: () => {
      const state = get()
      const dur = state.mode === 'focus' ? FOCUS_SECONDS - state.remaining : state.elapsed
      if (dur < 1) return
      const session: TimerSession = {
        id: String(Date.now()),
        taskId: state.selectedTaskId,
        mode: state.mode,
        durationSeconds: dur,
        startedAt: new Date(Date.now() - dur * 1000).toISOString(),
        endedAt: new Date().toISOString(),
      }
      const sessions = [session, ...state.sessions]
      persistSessions(sessions)
      set({ sessions })
      if (session.taskId) {
        useTaskStore.getState().addTimeTracked(session.taskId, dur)
      }
    },
  }
})
