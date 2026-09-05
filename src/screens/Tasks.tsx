import { useState } from 'preact/hooks'
import { useTaskStore } from '../store'
import { TaskRow } from '../components'
import { color, radius, typography } from '../theme/tokens'

type StatusFilter = 'all' | 'active' | 'done'
type SortBy = 'default' | 'priority' | 'difficulty' | 'time'

export function Tasks() {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const setTaskField = useTaskStore((s) => s.setTaskField)
  const dismissNeedsDetails = useTaskStore((s) => s.dismissNeedsDetails)

  const [input, setInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('default')

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    addTask(val)
    setInput('')
  }

  let filtered = tasks.slice()
  if (statusFilter === 'active') filtered = filtered.filter((t) => !t.done)
  if (statusFilter === 'done') filtered = filtered.filter((t) => t.done)

  if (sortBy === 'priority') filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  if (sortBy === 'difficulty') filtered.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
  if (sortBy === 'time') filtered.sort((a, b) => (a.estimatedMinutes || 999) - (b.estimatedMinutes || 999))

  const filterBtnStyle = (active: boolean) => ({
    border: `1px solid ${active ? color.ink : color.line}`,
    background: active ? color.ink : color.surface,
    color: active ? '#FFFFFF' : color.inkSoft,
    borderRadius: '10px',
    padding: '6px 12px',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
  })

  return (
    <div style={{ paddingBottom: '84px' }}>
      <div style={{ padding: '22px 20px 6px' }}>
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontSize: typography.sizes.screenTitle,
            fontWeight: 600,
            color: color.ink,
            margin: '0 0 2px',
          }}
        >
          Tasks
        </h1>
        <p style={{ margin: 0, color: color.inkSoft, fontSize: '13px' }}>Everything on your plate.</p>
      </div>

      {/* Quick-add */}
      <div style={{ display: 'flex', gap: '8px', padding: '8px 20px 4px' }}>
        <input
          type="text"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          placeholder="Add a task..."
          style={{
            flex: 1,
            background: color.surface,
            border: `1px solid ${color.line}`,
            borderRadius: radius.pill,
            padding: '10px 14px',
            fontSize: '14px',
            color: color.ink,
            fontFamily: typography.bodyFont,
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            background: color.ink,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: radius.pill,
            padding: '0 16px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: typography.bodyFont,
          }}
        >
          Add
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', padding: '6px 20px 10px' }}>
        {(['all', 'active', 'done'] as const).map((f) => (
          <button key={f} style={filterBtnStyle(statusFilter === f)} onClick={() => setStatusFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 10px' }}>
        <span style={{ fontSize: '12.5px', color: color.inkSoft, fontWeight: 600 }}>Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as SortBy)}
          style={{
            border: `1px solid ${color.line}`,
            borderRadius: '10px',
            padding: '6px 10px',
            fontSize: '12.5px',
            color: color.ink,
            background: color.surface,
            fontFamily: typography.bodyFont,
          }}
        >
          <option value="default">Added order</option>
          <option value="priority">Priority</option>
          <option value="difficulty">Difficulty</option>
          <option value="time">Time needed</option>
        </select>
      </div>

      {/* Task list */}
      <div style={{ padding: '0 20px' }}>
        {filtered.length > 0 ? (
          filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSetField={setTaskField}
              onDismissDetails={dismissNeedsDetails}
              showDelete
            />
          ))
        ) : (
          <div
            style={{
              padding: '14px',
              textAlign: 'center',
              color: color.inkSoft,
              fontSize: '13px',
              background: color.surface,
              borderRadius: '22px',
              boxShadow: '0 8px 20px rgba(31,58,46,0.08)',
            }}
          >
            Nothing here.
          </div>
        )}
      </div>
    </div>
  )
}
