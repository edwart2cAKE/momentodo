import { useState } from 'preact/hooks'
import { useTaskStore } from '../store'
import { TaskRow } from '../components'
import { color, radius, shadow, typography } from '../theme/tokens'
import type { Task } from '../types'

type StatusFilter = 'all' | 'active' | 'done'
type SortBy = 'default' | 'priority' | 'difficulty' | 'time' | 'due'

export function Tasks() {
  const tasks = useTaskStore((s) => s.tasks)
  const quickAddParsed = useTaskStore((s) => s.quickAddParsed)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const setTaskField = useTaskStore((s) => s.setTaskField)
  const dismissNeedsDetails = useTaskStore((s) => s.dismissNeedsDetails)
  const addTag = useTaskStore((s) => s.addTag)
  const removeTag = useTaskStore((s) => s.removeTag)
  const availableTags = useTaskStore((s) => s.availableTags)
  const addSubtask = useTaskStore((s) => s.addSubtask)
  const setRecurrence = useTaskStore((s) => s.setRecurrence)
  const setDueDate = useTaskStore((s) => s.setDueDate)

  const [input, setInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('default')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    quickAddParsed(val)
    setInput('')
  }

  const today = new Date().toISOString().split('T')[0]

  // Top-level tasks only (no parent)
  let topLevel = tasks.filter((t) => t.parentId === null)
  if (statusFilter === 'active') topLevel = topLevel.filter((t) => !t.done)
  if (statusFilter === 'done') topLevel = topLevel.filter((t) => t.done)
  if (tagFilter) topLevel = topLevel.filter((t) => t.tags && t.tags.includes(tagFilter))

  if (sortBy === 'priority') topLevel.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  if (sortBy === 'difficulty') topLevel.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
  if (sortBy === 'time') topLevel.sort((a, b) => (a.estimatedMinutes || 999) - (b.estimatedMinutes || 999))
  if (sortBy === 'due') {
    topLevel.sort((a, b) => {
      // Overdue first
      if (a.dueDate && a.dueDate < today && (!b.dueDate || b.dueDate >= today)) return -1
      if (b.dueDate && b.dueDate < today && (!a.dueDate || a.dueDate >= today)) return 1
      // Due today second
      if (a.dueDate === today && b.dueDate !== today) return -1
      if (b.dueDate === today && a.dueDate !== today) return 1
      // Then by date (earliest first), nulls last
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })
  }

  const allTags = availableTags()

  const filterBtnStyle = (active: boolean) => ({
    border: `1px solid ${active ? color.ink : color.line}`,
    background: active ? color.ink : color.surface,
    color: active ? color.white : color.inkSoft,
    borderRadius: radius.filterBtn,
    padding: '6px 12px',
    minHeight: '44px',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
  })

  function renderTaskWithSubtasks(task: Task, depth: number) {
    const subtasks = tasks.filter((t) => t.parentId === task.id)
    return (
      <div key={task.id}>
        <TaskRow
          task={task}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onSetField={setTaskField}
          onDismissDetails={dismissNeedsDetails}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          availableTags={allTags}
          onAddSubtask={addSubtask}
          onSetRecurrence={setRecurrence}
          onSetDueDate={setDueDate}
          showDelete
          depth={depth}
        />
        {subtasks.map((st) => renderTaskWithSubtasks(st, depth + 1))}
      </div>
    )
  }

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
          placeholder="Add a task... (try: call dentist 15m @errands)"
          aria-label="Quick add task"
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
            color: color.white,
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
      <div style={{ display: 'flex', gap: '8px', padding: '6px 20px 10px', flexWrap: 'wrap' }}>
        {(['all', 'active', 'done'] as const).map((f) => (
          <button key={f} style={filterBtnStyle(statusFilter === f)} onClick={() => setStatusFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {allTags.map((tag) => (
          <button
            key={tag}
            style={filterBtnStyle(tagFilter === tag)}
            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 10px' }}>
        <span style={{ fontSize: '12.5px', color: color.inkSoft, fontWeight: 600 }}>Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as SortBy)}
          aria-label="Sort tasks by"
          style={{
            border: `1px solid ${color.line}`,
            borderRadius: radius.select,
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
          <option value="due">Due date</option>
        </select>
      </div>

      {/* Task list */}
      <div style={{ padding: '0 20px' }}>
        {topLevel.length > 0 ? (
          topLevel.map((t) => renderTaskWithSubtasks(t, 0))
        ) : (
          <div
            style={{
              padding: '14px',
              textAlign: 'center',
              color: color.inkSoft,
              fontSize: '13px',
              background: color.surface,
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
            }}
          >
            Nothing here.
          </div>
        )}
      </div>
    </div>
  )
}
