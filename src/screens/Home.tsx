import { useState } from 'preact/hooks'
import type { MomentDuration } from '../types'
import { useTaskStore, useUpNext, useCompletedToday, useTotalToday, useCompletionPercentage } from '../store'
import { MomentCard, Ring } from '../components'
import { MOMENT_DURATIONS } from '../types'
import { useMediaQuery, DESKTOP_BREAKPOINT } from '../hooks'
import { color, typography, layout, radius, shadow, motion } from '../theme/tokens'

interface HomeProps {
  onNavigateToTasks: () => void
}

export function Home({ onNavigateToTasks }: HomeProps) {
  const [momentFilter, setMomentFilter] = useState<MomentDuration | null>(null)
  const tasks = useTaskStore((s) => s.tasks)
  const upNext = useUpNext(4)
  const completed = useCompletedToday()
  const total = useTotalToday()
  const pct = useCompletionPercentage()
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  const matchingTasks = momentFilter !== null
    ? tasks.filter((t) => !t.done && t.estimatedMinutes !== null && t.estimatedMinutes <= momentFilter)
    : []

  return (
    <div style={{ paddingBottom: isDesktop ? '22px' : '84px' }}>
      <div style={{ padding: isDesktop ? '22px 24px 6px' : '22px 20px 6px' }}>
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
        <p style={{ margin: 0, color: color.inkSoft, fontSize: '12.5px' }}>
          Tap how much time you've got.
        </p>
      </div>

      {/* Moment grid — 4-col on desktop, 2-col on mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : `repeat(${layout.momentGridColumns}, 1fr)`,
          gap: layout.momentGridGap,
          padding: isDesktop ? '14px 24px' : '14px 20px',
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

      {/* Inline expansion — task chips */}
      {momentFilter !== null && (
        <div
          style={{
            margin: isDesktop ? '-6px 24px 12px' : '-6px 20px 12px',
            padding: '14px',
            background: color.surface,
            borderRadius: '18px',
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
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: '#f8faf8',
                  borderRadius: radius.chip,
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: color.ink,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color.line,
                    flex: 'none',
                  }}
                />
                <span style={{ flex: 1 }}>{t.title}</span>
                <span style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600 }}>
                  {t.estimatedMinutes}m
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: color.inkSoft, fontSize: '13px', padding: '8px 0' }}>
              Nothing fits yet
            </div>
          )}
        </div>
      )}

      {/* Two-column: ring + up next on desktop, stacked on mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: '16px',
          margin: isDesktop ? '0 24px 14px' : '0 20px 14px',
        }}
      >
        {/* Progress ring + text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px',
            background: color.surface,
            borderRadius: radius.card,
            boxShadow: shadow.cardDefault,
          }}
        >
          <Ring percentage={pct} size={isDesktop ? 56 : 56} innerSize={isDesktop ? 42 : 42} fontSize="13px" />
          <div style={{ fontSize: '13px', color: color.inkSoft, fontWeight: 600 }}>
            <span
              style={{
                display: 'block',
                fontSize: '18px',
                color: color.ink,
                fontFamily: typography.headingFont,
              }}
            >
              {completed}/{total}
            </span>
            tasks completed today
          </div>
        </div>

        {/* Up next */}
        <div
          style={{
            padding: '14px',
            background: color.surface,
            borderRadius: radius.card,
            boxShadow: shadow.cardDefault,
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: color.inkSoft, marginBottom: '8px' }}>
            Up next
          </div>
          {upNext.length > 0 ? (
            upNext.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: color.ink,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: color.line,
                    flex: 'none',
                  }}
                />
                <span style={{ flex: 1 }}>{t.title}</span>
                <span style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600 }}>
                  {t.estimatedMinutes}m
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: color.inkSoft, fontSize: '13px' }}>All clear</div>
          )}
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
      </div>

      {/* Quick add */}
      <div
        style={{
          margin: isDesktop ? '0 24px' : '0 20px',
          padding: '14px',
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: color.inkSoft, marginBottom: '8px' }}>
          Quick add
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Add a task..."
            style={{
              flex: 1,
              border: `1px solid ${color.line}`,
              borderRadius: radius.chip,
              padding: '10px 14px',
              fontSize: '14px',
              fontFamily: typography.bodyFont,
              color: color.ink,
              outline: 'none',
            }}
          />
          <button
            style={{
              background: color.moment['30min'],
              color: color.white,
              border: 'none',
              borderRadius: radius.chip,
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: typography.bodyFont,
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
