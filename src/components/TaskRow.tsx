import type { Task, Difficulty, Priority, TaskField, RecurrencePattern } from '../types'
import { color, radius, shadow, motion, typography } from '../theme/tokens'
import { difficultyLabels, priorityLabels } from '../store/config'
import { tagColor } from '../types'
import { NeedsDetailsPrompt } from './NeedsDetailsPrompt'

interface TaskRowProps {
  task: Task
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  onSetField?: (id: string, field: TaskField, value: number | Difficulty | Priority) => void
  onDismissDetails?: (id: string) => void
  onAddTag?: (id: string, tag: string) => void
  onRemoveTag?: (id: string, tag: string) => void
  availableTags?: string[]
  onAddSubtask?: (parentId: string, title: string) => void
  onSetRecurrence?: (id: string, pattern: RecurrencePattern) => void
  showDelete?: boolean
  depth?: number
}

const priorityTagStyle: Record<number, { bg: string; text: string }> = {
  1: color.priorityTag.low,
  2: color.priorityTag.med,
  3: color.priorityTag.high,
}

export function TaskRow({
  task,
  onToggle,
  onDelete,
  onSetField,
  onDismissDetails,
  onAddTag,
  onRemoveTag,
  availableTags = [],
  onAddSubtask,
  onSetRecurrence,
  showDelete = false,
  depth = 0,
}: TaskRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        padding: '11px 12px',
        marginBottom: '8px',
        background: color.surface,
        borderRadius: radius.card,
        boxShadow: shadow.cardDefault,
        marginLeft: depth > 0 ? `${depth * 20}px` : undefined,
      }}
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
        style={{
          width: '20px',
          height: '20px',
          minWidth: '44px',
          minHeight: '44px',
          borderRadius: '50%',
          border: `2px solid ${color.moment['30min']}`,
          background: task.done ? color.moment['30min'] : 'transparent',
          color: task.done ? color.white : 'transparent',
          flex: 'none',
          marginTop: '1px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          transform: task.done ? 'scale(1)' : undefined,
          animation: task.done ? `popCheck ${motion.duration} ${motion.easing}` : undefined,
        }}
      >
        {task.done ? '✓' : ''}
      </button>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: typography.sizes.taskTitle,
            fontWeight: 600,
            color: task.done ? color.inkSoft : color.ink,
            textDecoration: task.done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
          {task.estimatedMinutes !== null && (
            <Tag label={`${task.estimatedMinutes} min`} />
          )}
          {task.difficulty !== null && (
            <Tag label={difficultyLabels[task.difficulty]} />
          )}
          {task.priority !== null && (
            <Tag
              label={`${priorityLabels[task.priority]} priority`}
              style={{
                background: priorityTagStyle[task.priority].bg,
                color: priorityTagStyle[task.priority].text,
              }}
            />
          )}
          {task.tags && task.tags.map((tag) => {
            const tc = tagColor(tag)
            return (
              <Tag
                key={tag}
                label={tag}
                style={{ background: tc.bg, color: tc.text }}
              />
            )
          })}
          {task.recurrence && (
            <Tag
              label={`🔄 ${task.recurrence}`}
              style={{ background: '#E4E8F3', text: '#2F4F7B' }}
            />
          )}
        </div>
        {task.needsDetails && onSetField && onDismissDetails && (
          <NeedsDetailsPrompt
            task={task}
            onSetField={onSetField}
            onDismiss={onDismissDetails}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            availableTags={availableTags}
            onAddSubtask={onAddSubtask}
            onSetRecurrence={onSetRecurrence}
          />
        )}
      </div>

      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          style={{
            border: 'none',
            background: 'none',
            color: color.inkSoft,
            cursor: 'pointer',
            fontSize: '15px',
            alignSelf: 'center',
            padding: '4px',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function Tag({ label, style }: { label: string; style?: preact.CSSProperties }) {
  return (
    <span
      style={{
        fontSize: typography.sizes.tag,
        padding: '2px 8px',
        borderRadius: '8px',
        background: color.background,
        color: color.inkSoft,
        fontWeight: 700,
        ...style,
      }}
    >
      {label}
    </span>
  )
}
