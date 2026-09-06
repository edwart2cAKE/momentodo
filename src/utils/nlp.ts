import type { Difficulty, Priority, RecurrencePattern } from '../types'

export interface ParsedTask {
  title: string
  estimatedMinutes: number | null
  difficulty: Difficulty | null
  priority: Priority | null
  tags: string[]
  recurrence: RecurrencePattern | null
  dueDate: string | null
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

const MONTH_NAMES: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
}

function parseDuration(text: string): number | null {
  for (const [re, multiplier] of DURATION_PATTERNS) {
    const m = text.match(re)
    if (m) {
      return parseInt(m[1], 10) * multiplier
    }
  }
  // Skip bare number extraction if text contains a decimal or range (e.g. "2.7-2.8")
  if (/\d+\.\d+/.test(text)) return null
  // Bare number followed by nothing or a word boundary — assume minutes
  const bare = text.match(/\b(\d+)(?!\.)/)
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

  // Numeric: due M/D/YYYY
  const mdy = lower.match(/(?:due\s+)?(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdy) {
    const month = parseInt(mdy[1], 10) - 1
    const day = parseInt(mdy[2], 10)
    const year = parseInt(mdy[3], 10)
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day)
      return d.toISOString().split('T')[0]
    }
  }

  // Numeric: due M/D (no year — assume current year, but if that date already passed, use next year)
  const md = lower.match(/(?:due\s+)?(\d{1,2})\/(\d{1,2})(?!\d|\/)/)
  if (md) {
    const month = parseInt(md[1], 10) - 1
    const day = parseInt(md[2], 10)
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const year = today.getFullYear()
      const d = new Date(year, month, day)
      // If the date already passed this year, assume next year
      if (d < today) d.setFullYear(year + 1)
      return d.toISOString().split('T')[0]
    }
  }

  // Word month: due Sep 9 or due September 9 2026
  const wordMonth = lower.match(/(?:due\s+)?([a-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?/)
  if (wordMonth) {
    const monthIndex = MONTH_NAMES[wordMonth[1]]
    if (monthIndex !== undefined) {
      const day = parseInt(wordMonth[2], 10)
      if (day >= 1 && day <= 31) {
        const year = wordMonth[3] ? parseInt(wordMonth[3], 10) : today.getFullYear()
        const d = new Date(year, monthIndex, day)
        if (!wordMonth[3] && d < today) d.setFullYear(year + 1)
        return d.toISOString().split('T')[0]
      }
    }
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

  // Extract due date FIRST — protects date numbers from duration extraction
  const dueDate = parseNextDueDate(remaining)
  if (dueDate) {
    // Remove word-based date references
    remaining = remaining.replace(/\b(today|tomorrow|next\s+week|(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/gi, '').trim()
    // Remove numeric dates (M/D, M/D/YYYY)
    remaining = remaining.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g, '').trim()
    // Remove word-month dates (sep 9, september 9 2026)
    remaining = remaining.replace(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(?:\s+\d{4})?\b/gi, '').trim()
    // Remove "due" keyword if it's left dangling
    remaining = remaining.replace(/\bdue\b/gi, '').trim()
  }

  // Extract duration
  const estimatedMinutes = parseDuration(remaining)
  if (estimatedMinutes !== null) {
    remaining = remaining.replace(/\b\d+\s*(?:h(?:ours?)?|min(?:utes?)?|m)\b/gi, '').trim()
    remaining = remaining.replace(/\b\d+(?!\.)/, '').trim()
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

  // Clean up title — remove extra whitespace
  const title = remaining.replace(/\s+/g, ' ').trim()

  return {
    title,
    estimatedMinutes,
    difficulty,
    priority,
    tags,
    recurrence,
    dueDate,
  }
}
