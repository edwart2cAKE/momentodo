import { create } from 'zustand'

const STORAGE_KEY = 'momentodo_settings'

interface SettingsState {
  reduceMotion: boolean
  setReduceMotion: (value: boolean) => void
}

function loadSettings(): { reduceMotion: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { reduceMotion: !!parsed.reduceMotion }
    }
  } catch { /* ignore */ }
  return { reduceMotion: false }
}

function saveSettings(state: { reduceMotion: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...loadSettings(),
  setReduceMotion: (value: boolean) => {
    set(() => {
      saveSettings({ reduceMotion: value })
      return { reduceMotion: value }
    })
  },
}))
