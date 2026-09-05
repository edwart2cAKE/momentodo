import { create } from 'zustand'
import type { Task, MomentDuration, Difficulty, Priority, TaskField } from '../types'
import { repository } from './persistence'

interface TaskState {
  tasks: Task[]
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  setTaskField: (id: string, field: TaskField, value: MomentDuration | Difficulty | Priority) => void
  dismissNeedsDetails: (id: string) => void
  tasksFittingMinutes: (minutes: number) => Task[]
}

let nextId = Date.now()
function genId(): string {
  return String(nextId++)
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: repository.getTasks(),

  addTask: (title: string) => {
    const task: Task = {
      id: genId(),
      title,
      estimatedMinutes: null,
      difficulty: null,
      priority: null,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      needsDetails: true,
    }
    set((state) => {
      const tasks = [task, ...state.tasks]
      repository.saveTasks(tasks)
      return { tasks }
    })
  },

  toggleTask: (id: string) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }
          : t,
      )
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

  setTaskField: (id: string, field: TaskField, value: MomentDuration | Difficulty | Priority) => {
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
    return get().tasks.filter((t) => !t.done && t.estimatedMinutes !== null && t.estimatedMinutes <= minutes)
  },
}))
