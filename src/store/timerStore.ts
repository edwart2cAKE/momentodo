import { create } from 'zustand'
import type { TimerSession } from '../types'
import { repository } from './persistence'

const FOCUS_SECONDS = 25 * 60

interface TimerState {
  mode: 'focus' | 'stopwatch'
  remaining: number
  elapsed: number
  running: boolean
  selectedTaskId: string | null
  sessions: TimerSession[]
  intervalId: ReturnType<typeof setInterval> | null

  setMode: (mode: 'focus' | 'stopwatch') => void
  setSelectedTaskId: (id: string | null) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  logSession: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  remaining: FOCUS_SECONDS,
  elapsed: 0,
  running: false,
  selectedTaskId: null,
  sessions: repository.getSessions(),
  intervalId: null,

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
    repository.saveSessions(sessions)
    set({ sessions })
  },
}))
