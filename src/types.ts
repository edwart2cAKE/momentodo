export type MomentDuration = 5 | 15 | 30 | 60

export type Difficulty = 1 | 2 | 3
export type Priority = 1 | 2 | 3
export type RecurrencePattern = 'daily' | 'weekdays' | 'weekly' | 'monthly'

export interface Task {
  id: string
  title: string
  estimatedMinutes: number | null
  difficulty: Difficulty | null
  priority: Priority | null
  tags: string[]
  done: boolean
  createdAt: string
  completedAt: string | null
  needsDetails: boolean
  parentId: string | null
  subtaskIds: string[]
  recurrence: RecurrencePattern | null
  dueDate: string | null
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

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  '@work': { bg: '#D4EDDA', text: '#1A5C3A' },
  '@errands': { bg: '#FFF0C8', text: '#7A5500' },
  '@home': { bg: '#D6E0F0', text: '#1E3A6A' },
  '@health': { bg: '#FFD6CC', text: '#8B2E15' },
  '@creative': { bg: '#E8D4E8', text: '#5C1A5C' },
}

const TAGLETTE = ['#038A6B', '#2E78BD', '#D49A00', '#CC4530', '#7A5500', '#8B2E15', '#1A5C3A', '#5C1A5C']

export function tagColor(tag: string): { bg: string; text: string } {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  const color = TAGLETTE[Math.abs(hash) % TAGLETTE.length]
  return { bg: color + '33', text: color }
}
