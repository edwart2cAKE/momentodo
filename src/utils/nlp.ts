import type { Difficulty, Priority, RecurrencePattern } from '../types'

export interface ParsedTask {
  title: string
  estimatedMinutes: number | null
  difficulty: Difficulty | null
  priority: Priority | null
  tags: string[]
  recurrence: RecurrencePattern | null
  nextDueDate: string | null
}

const DURATION_PATTERNS: [RegExp, number][] = [
  [/\b(\d+)\s*h(?:ours?)?\b/i, 60],
  [/\b(\d+)\s*min(?:utes?)?\b/i, 1],
  [/\b(\d+)\s*m\b/i, 1],
]

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  easy: 1,
  simple: 1,
  quick: 1,
  medium: 2,
  med: 2,
  moderate: 2,
  hard: 3,
  difficult: 3,
  complex: 3,
  tough: 3,
}

const PRIORITY_MAP: Record<string, Priority> = {
  low: 1,
  med: 2,
  medium: 2,
  high: 3,
  urgent: 3,
  asap: 3,
}

const RECURRENCE_MAP: Record<string, RecurrencePattern> = {
  daily: 'daily',
  'every day': 'daily',
  'each day': 'daily',
  weekdays: 'weekdays',
  'on weekdays': 'weekdays',
  weekly: 'weekly',
  'every week': 'weekly',
  'each week': 'weekly',
  monthly: 'monthly',
  'every month': 'monthly',
  'each month': 'monthly',
}

const TAG_RE = /@(\w+)/g

function parseDuration(text: string): number | null {
  for (const [re, multiplier] of DURATION_PATTERNS) {
    const m = text.match(re)
    if (m) {
      return parseInt(m[1], 10) * multiplier
    }
  }
  // Bare number followed by nothing or a word boundary — assume minutes
  const bare = text.match(/\b(\d+)\b/)
  if (bare) {
    const n = parseInt(bare[1], 10)
    if (n > 0 && n <= 480) return n
  }
  return null
}

function parseRecurrence(text: string): RecurrencePattern | null {
  const lower = text.toLowerCase()
  for (const [phrase, pattern] of Object.entries(RECURRENCE_MAP)) {
    if (lower.includes(phrase)) return pattern
  }
  return null
}

function parseNextDueDate(text: string): string | null {
  const lower = text.toLowerCase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (lower.includes('today')) {
    return today.toISOString().split('T')[0]
  }
  if (lower.includes('tomorrow')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const d = new Date(today)
      const diff = (i - d.getDay() + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      return d.toISOString().split('T')[0]
    }
  }

  if (lower.includes('next week')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }

  return null
}

export function parseQuickAdd(input: string): ParsedTask {
  let remaining = input

  // Extract tags
  const tags: string[] = []
  let tagMatch
  while ((tagMatch = TAG_RE.exec(input)) !== null) {
    tags.push(`@${tagMatch[1]}`)
  }
  remaining = remaining.replace(TAG_RE, '').trim()

  // Extract duration
  const estimatedMinutes = parseDuration(remaining)
  if (estimatedMinutes !== null) {
    remaining = remaining.replace(/\b\d+\s*(?:h(?:ours?)?|min(?:utes?)?|m)\b/gi, '').trim()
    remaining = remaining.replace(/\b\d+\b/, '').trim()
  }

  // Extract difficulty
  let difficulty: Difficulty | null = null
  for (const [word, level] of Object.entries(DIFFICULTY_MAP)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(remaining)) {
      difficulty = level
      remaining = remaining.replace(re, '').trim()
      break
    }
  }

  // Extract priority
  let priority: Priority | null = null
  for (const [word, level] of Object.entries(PRIORITY_MAP)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(remaining)) {
      priority = level
      remaining = remaining.replace(re, '').trim()
      break
    }
  }

  // Extract recurrence
  const recurrence = parseRecurrence(remaining)
  if (recurrence) {
    for (const phrase of Object.keys(RECURRENCE_MAP)) {
      remaining = remaining.replace(new RegExp(phrase, 'gi'), '').trim()
    }
  }

  // Extract due date
  const nextDueDate = parseNextDueDate(remaining)
  if (nextDueDate) {
    remaining = remaining.replace(/\b(today|tomorrow|next\s+week|(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/gi, '').trim()
  }

  // Clean up title — remove extra whitespace
  const title = remaining.replace(/\s+/g, ' ').trim()

  return {
    title,
    estimatedMinutes,
    difficulty,
    priority,
    tags,
    recurrence,
    nextDueDate,
  }
}
