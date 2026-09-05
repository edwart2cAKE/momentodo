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
