import { useState } from 'preact/hooks'
import type { MomentDuration } from '../types'
import { useTaskStore, useUpNext, useCompletedToday, useTotalToday } from '../store'
import { MomentCard, TaskRow, ProgressBar } from '../components'
import { MOMENT_DURATIONS } from '../types'
import { color, typography, layout, radius, shadow, motion } from '../theme/tokens'

interface HomeProps {
  onNavigateToTasks: () => void
}

export function Home({ onNavigateToTasks }: HomeProps) {
  const [momentFilter, setMomentFilter] = useState<MomentDuration | null>(null)
  const tasks = useTaskStore((s) => s.tasks)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const setTaskField = useTaskStore((s) => s.setTaskField)
  const dismissNeedsDetails = useTaskStore((s) => s.dismissNeedsDetails)
  const upNext = useUpNext(3)
  const completed = useCompletedToday()
  const total = useTotalToday()

  const matchingTasks = momentFilter !== null
    ? tasks.filter((t) => !t.done && t.estimatedMinutes !== null && t.estimatedMinutes <= momentFilter)
    : []

  const progress = total > 0 ? completed / total : 0

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
          Momentodo
        </h1>
        <p style={{ margin: 0, color: color.inkSoft, fontSize: '13px' }}>
          Tap how much time you've got.
        </p>
      </div>

      {/* Moment grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.momentGridColumns}, 1fr)`,
          gap: layout.momentGridGap,
          padding: '12px 20px',
        }}
      >
        {MOMENT_DURATIONS.map((d) => (
          <MomentCard
            key={d}
            duration={d}
            selected={momentFilter === d}
            onClick={() => setMomentFilter(momentFilter === d ? null : d)}
          />
        ))}
      </div>

      {/* Accordion */}
      {momentFilter !== null && (
        <div
          style={{
            margin: '0 20px 14px',
            padding: '12px 14px',
            background: color.surface,
            borderRadius: radius.card,
            boxShadow: shadow.cardDefault,
            animation: `fadeSlide ${motion.duration} ${motion.easing}`,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: color.inkSoft,
              marginBottom: '8px',
            }}
          >
            Fits in {momentFilter} minutes
          </div>
          {matchingTasks.length > 0 ? (
            matchingTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '6px 0',
                  fontSize: '13.5px',
                  color: color.ink,
                }}
              >
                <span>{t.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: color.inkSoft, fontWeight: 600 }}>
                  {t.estimatedMinutes}m
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '6px 0', fontSize: '13.5px', color: color.inkSoft }}>
              Nothing fits yet — add a shorter task?
            </div>
          )}
        </div>
      )}

      {/* Progress strip */}
      <div
        style={{
          margin: '4px 20px 6px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
        }}
      >
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: color.inkSoft, whiteSpace: 'nowrap' }}>
          {completed}/{total} today
        </span>
        <ProgressBar value={progress} />
      </div>

      {/* Up next */}
      <div style={{ padding: '4px 20px 8px', fontSize: '12px', fontWeight: 700, color: color.inkSoft }}>
        Up next
      </div>
      <div style={{ padding: '4px 20px' }}>
        {upNext.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onToggle={toggleTask}
            onSetField={setTaskField}
            onDismissDetails={dismissNeedsDetails}
            showDelete={false}
          />
        ))}
      </div>
      <div
        onClick={onNavigateToTasks}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '8px',
          color: color.moment['30min'],
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        See all tasks →
      </div>
    </div>
  )
}
