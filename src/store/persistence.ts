import type { Task, TimerSession } from '../types'

export interface TaskRepository {
  getTasks(): Task[]
  saveTasks(tasks: Task[]): void
  getSessions(): TimerSession[]
  saveSessions(sessions: TimerSession[]): void
}

const TASKS_KEY = 'momentodo_tasks'
const SESSIONS_KEY = 'momentodo_sessions'

export class LocalStorageTaskRepository implements TaskRepository {
  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(TASKS_KEY)
      return raw ? JSON.parse(raw) : []
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
