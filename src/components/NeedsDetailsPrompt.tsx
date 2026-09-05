import type { Task, MomentDuration, Difficulty, Priority, TaskField } from '../types'
import { Pill, TimePill } from './Pill'
import { color } from '../theme/tokens'
import { difficultyLabels, priorityLabels, difficultyOptions, priorityOptions } from '../store/config'
import { MOMENT_DURATIONS } from '../types'

interface NeedsDetailsPromptProps {
  task: Task
  onSetField: (id: string, field: TaskField, value: MomentDuration | Difficulty | Priority) => void
  onDismiss: (id: string) => void
}

export function NeedsDetailsPrompt({ task, onSetField, onDismiss }: NeedsDetailsPromptProps) {
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
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
        {MOMENT_DURATIONS.map((d) => (
          <TimePill
            key={d}
            duration={d}
            selected={task.estimatedMinutes === d}
            onClick={() => onSetField(task.id, 'estimatedMinutes', d)}
          />
        ))}
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
