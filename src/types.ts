export type MomentDuration = 5 | 15 | 30 | 60

export type Difficulty = 1 | 2 | 3
export type Priority = 1 | 2 | 3

export interface Task {
  id: string
  title: string
  estimatedMinutes: MomentDuration | null
  difficulty: Difficulty | null
  priority: Priority | null
  done: boolean
  createdAt: string
  completedAt: string | null
  needsDetails: boolean
}

export interface TimerSession {
  id: string
  taskId: string | null
  mode: 'focus' | 'stopwatch'
  durationSeconds: number
  startedAt: string
  endedAt: string
}

export type TaskField = 'estimatedMinutes' | 'difficulty' | 'priority'

export const MOMENT_DURATIONS: MomentDuration[] = [5, 15, 30, 60]
