import { create } from 'zustand'
import type { Task, Difficulty, Priority, TaskField, RecurrencePattern } from '../types'
import { repository } from './persistence'
import { parseQuickAdd } from '../utils/nlp'

interface TaskState {
  tasks: Task[]
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  setTaskField: (id: string, field: TaskField, value: number | Difficulty | Priority) => void
  dismissNeedsDetails: (id: string) => void
  tasksFittingMinutes: (minutes: number) => Task[]
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  availableTags: () => string[]
  addSubtask: (parentId: string, title: string) => void
  deleteSubtask: (parentId: string, subtaskId: string) => void
  subtasksOf: (taskId: string) => Task[]
  setRecurrence: (id: string, pattern: RecurrencePattern) => void
  skipNextOccurrence: (id: string) => void
  setDueDate: (id: string, date: string | null) => void
  quickAddParsed: (input: string) => void
}

let nextId = Date.now()
function genId(): string {
  return String(nextId++)
}

function makeTask(title: string): Task {
  return {
    id: genId(),
    title,
    estimatedMinutes: null,
    difficulty: null,
    priority: null,
    tags: [],
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    needsDetails: true,
    parentId: null,
    subtaskIds: [],
    recurrence: null,
    dueDate: null,
  }
}

function computeNextDueDate(pattern: RecurrencePattern, from: Date): string {
  const next = new Date(from)
  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekdays':
      next.setDate(next.getDate() + 1)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1)
      }
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
  }
  return next.toISOString().split('T')[0]
}

function isTodayOrPast(dateStr: string | null): boolean {
  if (!dateStr) return false
  const today = new Date().toISOString().split('T')[0]
  return dateStr <= today
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function dueDateSortScore(t: Task): number {
  if (!t.dueDate) return 2 // nulls last
  const today = todayStr()
  if (t.dueDate < today) return 0 // overdue first
  if (t.dueDate === today) return 1 // due today second
  return 3 // future
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: repository.getTasks(),

  addTask: (title: string) => {
    const task = makeTask(title)
    set((state) => {
      const tasks = [task, ...state.tasks]
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  toggleTask: (id: string) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return state

      const now = new Date().toISOString()
      const newDone = !task.done

      let tasks = state.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, done: newDone, completedAt: newDone ? now : null }
        }
        return t
      })

      // If completing a parent, complete all subtasks
      if (newDone && task.subtaskIds.length > 0) {
        tasks = tasks.map((t) =>
          task.subtaskIds.includes(t.id)
            ? { ...t, done: true, completedAt: now }
            : t,
        )
      }

      // If uncompleting a parent, uncomplete all subtasks
      if (!newDone && task.subtaskIds.length > 0) {
        tasks = tasks.map((t) =>
          task.subtaskIds.includes(t.id)
            ? { ...t, done: false, completedAt: null }
            : t,
        )
      }

      // If completing a subtask, check if all siblings are done → auto-complete parent
      if (newDone && task.parentId) {
        const parent = tasks.find((t) => t.id === task.parentId)
        if (parent && !parent.done) {
          const allSiblingsDone = parent.subtaskIds.every((sid) => {
            if (sid === id) return true
            const sib = tasks.find((t) => t.id === sid)
            return sib?.done
          })
          if (allSiblingsDone) {
            tasks = tasks.map((t) =>
              t.id === parent.id ? { ...t, done: true, completedAt: now } : t,
            )
          }
        }
      }

      // If completing a recurring task, clone it for the next occurrence
      if (newDone && task.recurrence) {
        const clone: Task = {
          ...task,
          id: genId(),
          done: false,
          completedAt: null,
          needsDetails: false,
          createdAt: now,
          dueDate: computeNextDueDate(task.recurrence, new Date()),
          subtaskIds: [],
        }
        tasks = [clone, ...tasks]
      }

      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  deleteTask: (id: string) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id)
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  setTaskField: (id: string, field: TaskField, value: number | Difficulty | Priority) => {
    set((state) => {
      const tasks = state.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  dismissNeedsDetails: (id: string) => {
    set((state) => {
      const tasks = state.tasks.map((t) => (t.id === id ? { ...t, needsDetails: false } : t))
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  tasksFittingMinutes: (minutes: number) => {
    const fitting = get().tasks.filter((t) => {
      if (t.done) return false
      if (t.estimatedMinutes === null || t.estimatedMinutes > minutes) return false
      // Exclude parent tasks that have incomplete subtasks — show subtasks instead
      if (t.subtaskIds.length > 0) return false
      // For recurring tasks, only show if due date is today or past
      if (t.recurrence && !isTodayOrPast(t.dueDate)) return false
      return true
    })

    // Sort: overdue → today → priority (high first) → difficulty (hard first) → time (shortest first)
    fitting.sort((a, b) => {
      const ds = dueDateSortScore(a) - dueDateSortScore(b)
      if (ds !== 0) return ds
      const pa = a.priority ?? 0
      const pb = b.priority ?? 0
      if (pa !== pb) return pb - pa
      const da = a.difficulty ?? 0
      const db = b.difficulty ?? 0
      if (da !== db) return db - da
      return (a.estimatedMinutes ?? 999) - (b.estimatedMinutes ?? 999)
    })

    return fitting
  },

  addTag: (id: string, tag: string) => {
    const normalized = tag.startsWith('@') ? tag : `@${tag}`
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id && !(t.tags && t.tags.includes(normalized)) ? { ...t, tags: [...(t.tags || []), normalized] } : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  removeTag: (id: string, tag: string) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, tags: (t.tags || []).filter((tg) => tg !== tag) } : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  availableTags: () => {
    const tags = new Set<string>()
    for (const t of get().tasks) {
      if (t.tags) {
        for (const tag of t.tags) tags.add(tag)
      }
    }
    return [...tags].sort()
  },

  addSubtask: (parentId: string, title: string) => {
    const subtask = makeTask(title)
    subtask.parentId = parentId
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === parentId
          ? { ...t, subtaskIds: [...t.subtaskIds, subtask.id] }
          : t,
      )
      tasks.unshift(subtask)
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  deleteSubtask: (parentId: string, subtaskId: string) => {
    set((state) => {
      let tasks = state.tasks.filter((t) => t.id !== subtaskId)
      tasks = tasks.map((t) =>
        t.id === parentId
          ? { ...t, subtaskIds: t.subtaskIds.filter((sid) => sid !== subtaskId) }
          : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  subtasksOf: (taskId: string) => {
    return get().tasks.filter((t) => t.parentId === taskId)
  },

  setRecurrence: (id: string, pattern: RecurrencePattern) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, recurrence: pattern, dueDate: todayStr() }
          : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  skipNextOccurrence: (id: string) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task || !task.recurrence) return state
      const nextDate = computeNextDueDate(task.recurrence, new Date())
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, dueDate: nextDate } : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  setDueDate: (id: string, date: string | null) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, dueDate: date } : t,
      )
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  quickAddParsed: (input: string) => {
    const parsed = parseQuickAdd(input)
    if (!parsed.title) return

    const task: Task = {
      id: genId(),
      title: parsed.title,
      estimatedMinutes: parsed.estimatedMinutes,
      difficulty: parsed.difficulty,
      priority: parsed.priority,
      tags: parsed.tags,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      // If all key fields were parsed, skip needs-details
      needsDetails: parsed.estimatedMinutes === null && parsed.difficulty === null && parsed.priority === null,
      parentId: null,
      subtaskIds: [],
      recurrence: parsed.recurrence,
      dueDate: parsed.dueDate,
    }

    set((state) => {
      const tasks = [task, ...state.tasks]
      repository.saveTasks(tasks)
      return { tasks }
    })
  },
}))
