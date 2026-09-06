import { useState } from 'preact/hooks'
import type { Task, Difficulty, Priority, TaskField, RecurrencePattern } from '../types'
import { Pill, TimePill } from './Pill'
import { color, radius, typography } from '../theme/tokens'
import { difficultyLabels, priorityLabels, difficultyOptions, priorityOptions } from '../store/config'
import { MOMENT_DURATIONS, tagColor } from '../types'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function nextWeekStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

interface TaskEditMenuProps {
  task: Task
  onSetField: (id: string, field: TaskField, value: number | Difficulty | Priority) => void
  onClose: () => void
  onAddTag?: (id: string, tag: string) => void
  onRemoveTag?: (id: string, tag: string) => void
  availableTags?: string[]
  onAddSubtask?: (parentId: string, title: string) => void
  onSetRecurrence?: (id: string, pattern: RecurrencePattern) => void
  onSetDueDate?: (id: string, date: string | null) => void
}

const labelStyle = {
  fontSize: '10.5px',
  fontWeight: 700 as const,
  color: color.inkSoft,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '4px',
}

const rowStyle = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
}

export function TaskEditMenu({
  task,
  onSetField,
  onClose,
  onAddTag,
  onRemoveTag,
  availableTags = [],
  onAddSubtask,
  onSetRecurrence,
  onSetDueDate,
}: TaskEditMenuProps) {
  const [customTime, setCustomTime] = useState(
    task.estimatedMinutes !== null && !(MOMENT_DURATIONS as readonly number[]).includes(task.estimatedMinutes)
      ? String(task.estimatedMinutes)
      : '',
  )
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')

  const handleCustomTime = (val: string) => {
    setCustomTime(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num > 0) {
      onSetField(task.id, 'estimatedMinutes', num)
    }
  }

  const handleAddTag = (tag: string) => {
    const normalized = tag.startsWith('@') ? tag.trim() : `@${tag.trim()}`
    if (normalized.length > 1 && onAddTag) {
      onAddTag(task.id, normalized)
      setTagInput('')
      setShowTagSuggestions(false)
    }
  }

  const handleTagKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const filteredSuggestions = availableTags.filter(
    (t) => !(task.tags && task.tags.includes(t)) && t.includes(tagInput.startsWith('@') ? tagInput : `@${tagInput}`),
  )

  const isQuickTime = task.estimatedMinutes !== null && (MOMENT_DURATIONS as readonly number[]).includes(task.estimatedMinutes)

  return (
    <div
      style={{
        padding: '12px',
        fontSize: '12px',
        color: color.ink,
        fontWeight: 600,
        fontFamily: typography.bodyFont,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: color.ink }}>Edit task</span>
        <button
          onClick={onClose}
          style={{
            fontSize: '12px',
            border: `1px solid ${color.line}`,
            background: color.surface,
            color: color.inkSoft,
            borderRadius: radius.pill,
            padding: '4px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: typography.bodyFont,
            minHeight: '44px',
          }}
        >
          Close
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={labelStyle}>⏱ Time</div>
        <div style={rowStyle}>
          {MOMENT_DURATIONS.map((d) => (
            <TimePill
              key={d}
              duration={d}
              selected={task.estimatedMinutes === d}
              onClick={() => {
                setCustomTime('')
                onSetField(task.id, 'estimatedMinutes', d)
              }}
            />
          ))}
          <input
            type="number"
            min="1"
            max="480"
            placeholder="min"
            value={customTime}
            onInput={(e) => handleCustomTime((e.target as HTMLInputElement).value)}
            style={{
              width: '52px',
              padding: '3px 6px',
              fontSize: '11px',
              border: `1px solid ${!isQuickTime && task.estimatedMinutes !== null ? color.moment['30min'] : color.line}`,
              borderRadius: radius.pill,
              background: color.surface,
              color: color.ink,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              textAlign: 'center',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={labelStyle}>💪 Difficulty</div>
        <div style={rowStyle}>
          {difficultyOptions.map((d) => (
            <Pill
              key={d}
              label={difficultyLabels[d]}
              selected={task.difficulty === d}
              onClick={() => onSetField(task.id, 'difficulty', d)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={labelStyle}>🔥 Priority</div>
        <div style={rowStyle}>
          {priorityOptions.map((p) => (
            <Pill
              key={p}
              label={priorityLabels[p]}
              selected={task.priority === p}
              onClick={() => onSetField(task.id, 'priority', p)}
            />
          ))}
        </div>
      </div>

      {onSetDueDate && (
        <div style={{ marginBottom: '8px' }}>
          <div style={labelStyle}>📅 Due</div>
          <div style={rowStyle}>
            <Pill
              label="Today"
              selected={task.dueDate === todayStr()}
              onClick={() => onSetDueDate(task.id, todayStr())}
            />
            <Pill
              label="Tomorrow"
              selected={task.dueDate === tomorrowStr()}
              onClick={() => onSetDueDate(task.id, tomorrowStr())}
            />
            <Pill
              label="Next week"
              selected={task.dueDate === nextWeekStr()}
              onClick={() => onSetDueDate(task.id, nextWeekStr())}
            />
            <Pill
              label="None"
              selected={task.dueDate === null}
              onClick={() => onSetDueDate(task.id, null)}
            />
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).value
                onSetDueDate(task.id, val || null)
              }}
              style={{
                fontSize: '11px',
                border: `1px solid ${color.line}`,
                borderRadius: radius.pill,
                background: color.surface,
                color: color.ink,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                padding: '3px 6px',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {onAddTag && (
        <div style={{ marginBottom: '8px' }}>
          <div style={labelStyle}>🏷️ Tags</div>
          <div style={rowStyle}>
            {task.tags && task.tags.map((tag) => {
              const tc = tagColor(tag)
              return (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '10.5px',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    background: tc.bg,
                    color: tc.text,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => onRemoveTag && onRemoveTag(task.id, tag)}
                >
                  {tag} ✕
                </span>
              )
            })}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="@tag"
                value={tagInput}
                onInput={(e) => {
                  const val = (e.target as HTMLInputElement).value
                  setTagInput(val)
                  setShowTagSuggestions(val.length > 0)
                }}
                onFocus={() => tagInput.length > 0 && setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                onKeyDown={handleTagKeyDown}
                style={{
                  width: '70px',
                  padding: '3px 6px',
                  fontSize: '11px',
                  border: `1px solid ${color.line}`,
                  borderRadius: radius.pill,
                  background: color.surface,
                  color: color.ink,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                }}
              />
              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: color.surface,
                    border: `1px solid ${color.line}`,
                    borderRadius: '8px',
                    padding: '4px',
                    zIndex: 10,
                    minWidth: '100px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {filteredSuggestions.slice(0, 5).map((s) => (
                    <div
                      key={s}
                      onMouseDown={() => handleAddTag(s)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontWeight: 600,
                        color: color.ink,
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {onSetRecurrence && (
        <div style={{ marginBottom: '8px' }}>
          <div style={labelStyle}>🔄 Repeat</div>
          <div style={rowStyle}>
            <Pill
              label="None"
              selected={task.recurrence === null}
              onClick={() => {
                /* no-op if already none */
              }}
            />
            {(['daily', 'weekdays', 'weekly', 'monthly'] as const).map((p) => (
              <Pill
                key={p}
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                selected={task.recurrence === p}
                onClick={() => onSetRecurrence(task.id, p)}
              />
            ))}
          </div>
        </div>
      )}

      {onAddSubtask && (
        <div style={{ marginBottom: '8px' }}>
          <div style={labelStyle}>📋 Subtasks</div>
          <div style={rowStyle}>
            <input
              type="text"
              placeholder="Add subtask..."
              value={subtaskInput}
              onInput={(e) => setSubtaskInput((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && subtaskInput.trim()) {
                  e.preventDefault()
                  onAddSubtask(task.id, subtaskInput.trim())
                  setSubtaskInput('')
                }
              }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: '11px',
                border: `1px solid ${color.line}`,
                borderRadius: radius.pill,
                background: color.surface,
                color: color.ink,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
