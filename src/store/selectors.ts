import { useShallow } from 'zustand/react/shallow'
import { useTaskStore } from './taskStore'
import type { Difficulty, Priority } from '../types'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useCompletedToday(): number {
  const today = todayStr()
  return useTaskStore((s) =>
    s.tasks.filter((t) => t.done && t.completedAt && t.dueDate === today).length,
  )
}

export function useTotalToday(): number {
  const today = todayStr()
  return useTaskStore((s) => s.tasks.filter((t) => t.dueDate === today).length)
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

export function useWeeklyCompletionKey(): string {
  return useTaskStore((s) =>
    s.tasks
      .filter((t) => t.done && t.completedAt)
      .map((t) => t.completedAt)
      .sort()
      .join(','),
  )
}
