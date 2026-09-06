import type { Task, TimerSession, Difficulty, Priority, RecurrencePattern } from '../types'
import { supabase } from '../supabaseClient'

// NOTE: methods are now async (return Promises). LocalStorageTaskRepository
// still does everything synchronously under the hood — it just wraps the
// result in Promise.resolve() so both implementations share one interface.
export interface TaskRepository {
  getTasks(): Promise<Task[]>
  saveTasks(tasks: Task[]): Promise<void>
  getSessions(): Promise<TimerSession[]>
  saveSessions(sessions: TimerSession[]): Promise<void>
}

const TASKS_KEY = 'momentodo_tasks'
const SESSIONS_KEY = 'momentodo_sessions'

function migrateTask(raw: Record<string, unknown>): Task {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    estimatedMinutes: typeof raw.estimatedMinutes === 'number' ? raw.estimatedMinutes : null,
    difficulty: typeof raw.difficulty === 'number' ? (raw.difficulty as Difficulty) : null,
    priority: typeof raw.priority === 'number' ? (raw.priority as Priority) : null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    done: Boolean(raw.done),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    needsDetails: Boolean(raw.needsDetails),
    parentId: typeof raw.parentId === 'string' ? raw.parentId : null,
    subtaskIds: Array.isArray(raw.subtaskIds) ? raw.subtaskIds : [],
    recurrence: typeof raw.recurrence === 'string' ? (raw.recurrence as RecurrencePattern) : null,
    dueDate:
      typeof raw.dueDate === 'string'
        ? raw.dueDate
        : typeof raw.nextDueDate === 'string'
          ? raw.nextDueDate
          : null,
  }
}

export class LocalStorageTaskRepository implements TaskRepository {
  async getTasks(): Promise<Task[]> {
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

  async saveTasks(tasks: Task[]): Promise<void> {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }

  async getSessions(): Promise<TimerSession[]> {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  async saveSessions(sessions: TimerSession[]): Promise<void> {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  }
}

// --- Supabase-backed repository -------------------------------------------

interface TaskRow {
  id: string
  user_id: string
  title: string
  estimated_minutes: number | null
  difficulty: number | null
  priority: number | null
  tags: string[]
  done: boolean
  created_at: string
  completed_at: string | null
  needs_details: boolean
  parent_id: string | null
  subtask_ids: string[]
  recurrence: string | null
  due_date: string | null
}

interface SessionRow {
  id: string
  user_id: string
  task_id: string | null
  mode: string
  duration_seconds: number
  started_at: string
  ended_at: string
}

function taskToRow(task: Task, userId: string): TaskRow {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    estimated_minutes: task.estimatedMinutes,
    difficulty: task.difficulty,
    priority: task.priority,
    tags: task.tags,
    done: task.done,
    created_at: task.createdAt,
    completed_at: task.completedAt,
    needs_details: task.needsDetails,
    parent_id: task.parentId,
    subtask_ids: task.subtaskIds,
    recurrence: task.recurrence,
    due_date: task.dueDate,
  }
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    estimatedMinutes: row.estimated_minutes,
    difficulty: row.difficulty as Difficulty | null,
    priority: row.priority as Priority | null,
    tags: row.tags ?? [],
    done: row.done,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    needsDetails: row.needs_details,
    parentId: row.parent_id,
    subtaskIds: row.subtask_ids ?? [],
    recurrence: row.recurrence as RecurrencePattern | null,
    dueDate: row.due_date,
  }
}

function sessionToRow(session: TimerSession, userId: string): SessionRow {
  return {
    id: session.id,
    user_id: userId,
    task_id: session.taskId,
    mode: session.mode,
    duration_seconds: session.durationSeconds,
    started_at: session.startedAt,
    ended_at: session.endedAt,
  }
}

function rowToSession(row: SessionRow): TimerSession {
  return {
    id: row.id,
    taskId: row.task_id,
    mode: row.mode as 'focus' | 'stopwatch',
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }
}

/**
 * Backed by Supabase Postgres, scoped to one user via RLS + user_id.
 *
 * saveTasks/saveSessions do a full-table upsert-and-prune: upsert everything
 * passed in, then delete any row belonging to this user that ISN'T in the
 * list. This matches the existing call pattern (every store mutation calls
 * saveTasks with the FULL current task list, not a diff), so behavior stays
 * identical to the localStorage version.
 */
export class SupabaseTaskRepository implements TaskRepository {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as TaskRow[]).map(rowToTask)
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const rows = tasks.map((t) => taskToRow(t, this.userId))
    if (rows.length > 0) {
      const { error } = await supabase.from('tasks').upsert(rows)
      if (error) throw error
    }
    const keepIds = tasks.map((t) => t.id)
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', this.userId)
      .not('id', 'in', keepIds.length > 0 ? `(${keepIds.join(',')})` : '()')
    if (deleteError) throw deleteError
  }

  async getSessions(): Promise<TimerSession[]> {
    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('started_at', { ascending: false })
    if (error) throw error
    return (data as SessionRow[]).map(rowToSession)
  }

  async saveSessions(sessions: TimerSession[]): Promise<void> {
    const rows = sessions.map((s) => sessionToRow(s, this.userId))
    if (rows.length > 0) {
      const { error } = await supabase.from('timer_sessions').upsert(rows)
      if (error) throw error
    }
  }
}

// --- Active repository, swappable at login/logout --------------------------

let activeRepository: TaskRepository = new LocalStorageTaskRepository()
const listeners = new Set<() => void>()

export function getRepository(): TaskRepository {
  return activeRepository
}

/** Call this after login (with the Supabase user id) or logout (with null). */
export function setActiveRepository(userId: string | null): void {
  activeRepository = userId ? new SupabaseTaskRepository(userId) : new LocalStorageTaskRepository()
  for (const listener of listeners) listener()
}

/** Stores subscribe here so they know to re-hydrate when the repository changes. */
export function onRepositoryChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Kept for anything that imported the old singleton export directly.
export const repository = {
  getTasks: () => getRepository().getTasks(),
  saveTasks: (tasks: Task[]) => getRepository().saveTasks(tasks),
  getSessions: () => getRepository().getSessions(),
  saveSessions: (sessions: TimerSession[]) => getRepository().saveSessions(sessions),
}
