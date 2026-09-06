import type { Task, TimerSession, Difficulty, Priority, RecurrencePattern } from '../types'

export interface TaskRepository {
  getTasks(): Task[]
  saveTasks(tasks: Task[]): void
  getSessions(): TimerSession[]
  saveSessions(sessions: TimerSession[]): void
}

const TASKS_KEY = 'momentodo_tasks'
const SESSIONS_KEY = 'momentodo_sessions'

function migrateTask(raw: Record<string, unknown>): Task {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    estimatedMinutes: typeof raw.estimatedMinutes === 'number' ? raw.estimatedMinutes : null,
    difficulty: typeof raw.difficulty === 'number' ? raw.difficulty as Difficulty : null,
    priority: typeof raw.priority === 'number' ? raw.priority as Priority : null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    done: Boolean(raw.done),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    needsDetails: Boolean(raw.needsDetails),
    parentId: typeof raw.parentId === 'string' ? raw.parentId : null,
    subtaskIds: Array.isArray(raw.subtaskIds) ? raw.subtaskIds : [],
    recurrence: typeof raw.recurrence === 'string' ? raw.recurrence as RecurrencePattern : null,
    nextDueDate: typeof raw.nextDueDate === 'string' ? raw.nextDueDate : null,
  }
}

export class LocalStorageTaskRepository implements TaskRepository {
  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(TASKS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.map((t: Record<string, unknown>) => migrateTask(t))
    } catch {
      return []
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }

  getSessions(): TimerSession[] {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  saveSessions(sessions: TimerSession[]): void {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  }
}

export const repository: TaskRepository = new LocalStorageTaskRepository()
