import type { Difficulty, Priority } from '../types'

export const difficultyLabels: Record<Difficulty, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
}

export const priorityLabels: Record<Priority, string> = {
  1: 'Low',
  2: 'Med',
  3: 'High',
}

export const difficultyOptions: Difficulty[] = [1, 2, 3]
export const priorityOptions: Priority[] = [1, 2, 3]
