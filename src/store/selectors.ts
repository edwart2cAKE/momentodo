import { useShallow } from 'zustand/react/shallow'
import { useTaskStore } from './taskStore'
import type { Difficulty, Priority } from '../types'

export function useCompletedToday(): number {
  return useTaskStore((s) => s.tasks.filter((t) => t.done && t.completedAt).length)
}

export function useTotalToday(): number {
  return useTaskStore((s) => s.tasks.length)
}

export function useUpNext(count: number) {
  return useTaskStore(useShallow((s) => s.tasks.filter((t) => !t.done).slice(0, count)))
}

export function useDifficultyBreakdown(): Record<Difficulty, number> {
  return useTaskStore(
    useShallow((s) => {
      const counts: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0 }
      for (const t of s.tasks) {
        if (t.difficulty) counts[t.difficulty]++
      }
      return counts
    }),
  )
}

export function usePriorityBreakdown(): Record<Priority, number> {
  return useTaskStore(
    useShallow((s) => {
      const counts: Record<Priority, number> = { 1: 0, 2: 0, 3: 0 }
      for (const t of s.tasks) {
        if (t.priority) counts[t.priority]++
      }
      return counts
    }),
  )
}

export function useCompletionPercentage(): number {
  const done = useCompletedToday()
  const total = useTotalToday()
  if (total === 0) return 0
  return Math.round((100 * done) / total)
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function useWeeklyCompletions(): { label: string; date: string; count: number }[] {
  return useTaskStore(
    useShallow((s) => {
      const today = new Date()
      const days: { label: string; date: string; count: number }[] = []

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        days.push({ label: SHORT_DAYS[d.getDay()], date: dateStr, count: 0 })
      }

      for (const t of s.tasks) {
        if (!t.completedAt) continue
        const completedDate = new Date(t.completedAt)
        const localDateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`
        const bucket = days.find((d) => d.date === localDateStr)
        if (bucket) bucket.count++
      }

      return days
    }),
  )
}
