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
  nextDueDate: string | null
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
  '@work': { bg: '#E4F3EA', text: '#2F7B57' },
  '@errands': { bg: '#FFF3D6', text: '#A67300' },
  '@home': { bg: '#E4E8F3', text: '#2F4F7B' },
  '@health': { bg: '#FFE3DD', text: '#C1401F' },
  '@creative': { bg: '#F3E4F3', text: '#7B2F7B' },
}

const TAGLETTE = ['#04C495', '#4C9CE0', '#FFCA4D', '#FF5A3D', '#A67300', '#C1401F', '#2F7B57', '#7B2F7B']

export function tagColor(tag: string): { bg: string; text: string } {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  const color = TAGLETTE[Math.abs(hash) % TAGLETTE.length]
  return { bg: color + '22', text: color }
}
