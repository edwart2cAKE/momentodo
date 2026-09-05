import { useState } from 'preact/hooks'
import type { Task, Difficulty, Priority, TaskField } from '../types'
import { Pill, TimePill } from './Pill'
import { color, radius } from '../theme/tokens'
import { difficultyLabels, priorityLabels, difficultyOptions, priorityOptions } from '../store/config'
import { MOMENT_DURATIONS } from '../types'

interface NeedsDetailsPromptProps {
  task: Task
  onSetField: (id: string, field: TaskField, value: number | Difficulty | Priority) => void
  onDismiss: (id: string) => void
}

export function NeedsDetailsPrompt({ task, onSetField, onDismiss }: NeedsDetailsPromptProps) {
  const [customTime, setCustomTime] = useState(
    task.estimatedMinutes !== null && !(MOMENT_DURATIONS as readonly number[]).includes(task.estimatedMinutes)
      ? String(task.estimatedMinutes)
      : '',
  )

  const handleCustomTime = (val: string) => {
    setCustomTime(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num > 0) {
      onSetField(task.id, 'estimatedMinutes', num)
    }
  }

  const isQuickTime = task.estimatedMinutes !== null && (MOMENT_DURATIONS as readonly number[]).includes(task.estimatedMinutes)

  return (
    <div
      style={{
        background: color.needsDetailsBg,
        borderRadius: '10px',
        padding: '8px',
        marginTop: '6px',
        fontSize: '12px',
        color: color.ink,
        fontWeight: 600,
      }}
    >
      Quick — got a sec to fill this in?
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px', alignItems: 'center' }}>
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
        {difficultyOptions.map((d) => (
          <Pill
            key={d}
            label={difficultyLabels[d]}
            selected={task.difficulty === d}
            onClick={() => onSetField(task.id, 'difficulty', d)}
          />
        ))}
        {priorityOptions.map((p) => (
          <Pill
            key={p}
            label={priorityLabels[p]}
            selected={task.priority === p}
            onClick={() => onSetField(task.id, 'priority', p)}
          />
        ))}
        <Pill label="Done" onClick={() => onDismiss(task.id)} />
      </div>
    </div>
  )
}
