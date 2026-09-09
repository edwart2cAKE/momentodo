import { useMemo } from 'preact/hooks'
import {
  useCompletedToday,
  useTotalToday,
  useCompletionPercentage,
  useDifficultyBreakdown,
  usePriorityBreakdown,
  useWeeklyCompletionKey,
  useTotalTimeTrackedToday,
} from '../store'
import { Ring } from '../components'
import { useMediaQuery, DESKTOP_BREAKPOINT } from '../hooks'
import { color, typography, radius, shadow, layout } from '../theme/tokens'

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function heatmapLevel(n: number): { bg: string; text: string } {
  if (n === 0) return { bg: color.heatmap.level0, text: color.heatmap.level0Text }
  if (n === 1) return { bg: color.heatmap.level1, text: color.heatmap.level1Text }
  if (n === 2) return { bg: color.heatmap.level2, text: color.heatmap.level2Text }
  return { bg: color.heatmap.level3, text: color.heatmap.level3Text }
}

function StackedBar({
  segments,
  legend,
}: {
  segments: { label: string; count: number; color: string }[]
  legend: { label: string; count: number; color: string }[]
}) {
  const total = segments.reduce((s, seg) => s + seg.count, 0)

  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        style={{
          height: layout.stackedBarHeight,
          borderRadius: radius.stackedBar,
          background: color.background,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {segments.map((seg) => {
          const width = total > 0 ? (seg.count / total) * 100 : 0
          return (
            <div
              key={seg.label}
              style={{
                height: '100%',
                width: `${width}%`,
                background: seg.color,
                transition: 'width 0.3s',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        {legend.map((item) => (
          <div
            key={item.label}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: color.inkSoft }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: item.color,
              }}
            />
            {item.label} {item.count}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Stats() {
  const completed = useCompletedToday()
  const total = useTotalToday()
  const pct = useCompletionPercentage()
  const diffBreakdown = useDifficultyBreakdown()
  const priBreakdown = usePriorityBreakdown()
  const totalTimeToday = useTotalTimeTrackedToday()
  const completionKey = useWeeklyCompletionKey()
  const weekData = useMemo(() => {
    const today = new Date()
    const days: { label: string; date: string; count: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      days.push({ label: SHORT_DAYS[d.getDay()], date: dateStr, count: 0 })
    }

    if (completionKey) {
      for (const iso of completionKey.split(',')) {
        const d = new Date(iso)
        const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const bucket = days.find((day) => day.date === localDateStr)
        if (bucket) bucket.count++
      }
    }

    return days
  }, [completionKey])
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  const diffSegments = [
    { label: 'Easy', count: diffBreakdown[1], color: color.difficultyBar.easy },
    { label: 'Medium', count: diffBreakdown[2], color: color.difficultyBar.medium },
    { label: 'Hard', count: diffBreakdown[3], color: color.difficultyBar.hard },
  ]

  const priSegments = [
    { label: 'Low', count: priBreakdown[1], color: color.priorityBar.low },
    { label: 'Med', count: priBreakdown[2], color: color.priorityBar.med },
    { label: 'High', count: priBreakdown[3], color: color.priorityBar.high },
  ]

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
          Stats
        </h1>
        <p style={{ margin: 0, color: color.inkSoft, fontSize: '13px' }}>How today's going.</p>
      </div>

      {/* Desktop: two-panel layout. Mobile: stacked. */}
      <div
        style={{
          display: isDesktop ? 'grid' : 'block',
          gridTemplateColumns: isDesktop ? '1fr 1.5fr' : undefined,
          gap: isDesktop ? '16px' : undefined,
          padding: isDesktop ? '14px 24px' : '14px 20px',
        }}
      >
        {/* Left panel: ring hero + stat cards */}
        <div>
          {/* Ring hero */}
          <div
            style={{
              background: color.surface,
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
              padding: '20px',
              textAlign: 'center',
              marginBottom: isDesktop ? '14px' : '14px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <Ring percentage={pct} size={isDesktop ? 120 : 48} innerSize={isDesktop ? 90 : 36} fontSize={isDesktop ? '28px' : '12px'} />
            </div>
            <div style={{ fontSize: '13px', color: color.inkSoft, fontWeight: 600 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: isDesktop ? '22px' : '28px',
                  color: color.ink,
                  fontFamily: typography.headingFont,
                }}
              >
                {completed}/{total}
              </span>
              tasks completed today
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div
              style={{
                background: color.surface,
                borderRadius: radius.card,
                boxShadow: shadow.cardDefault,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: typography.headingFont,
                  fontSize: '28px',
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                {total}
              </div>
              <div style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600, marginTop: '2px' }}>
                total
              </div>
            </div>
            <div
              style={{
                background: color.surface,
                borderRadius: radius.card,
                boxShadow: shadow.cardDefault,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: typography.headingFont,
                  fontSize: '28px',
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                {diffBreakdown[2]}
              </div>
              <div style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600, marginTop: '2px' }}>
                medium
              </div>
            </div>
            <div
              style={{
                background: color.surface,
                borderRadius: radius.card,
                boxShadow: shadow.cardDefault,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: typography.headingFont,
                  fontSize: '28px',
                  fontWeight: 700,
                  color: color.ink,
                }}
              >
                {formatDuration(totalTimeToday)}
              </div>
              <div style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600, marginTop: '2px' }}>
                tracked
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: breakdowns + week */}
        <div>
          {/* Difficulty breakdown */}
          <div
            style={{
              padding: '14px',
              background: color.surface,
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
              marginBottom: isDesktop ? '14px' : '14px',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: '13px',
                fontWeight: 700,
                color: color.ink,
                fontFamily: typography.headingFont,
              }}
            >
              By difficulty
            </h3>
            <StackedBar
              segments={diffSegments}
              legend={diffSegments.map((s) => ({ label: s.label, count: s.count, color: s.color }))}
            />
          </div>

          {/* Priority breakdown */}
          <div
            style={{
              padding: '14px',
              background: color.surface,
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
              marginBottom: isDesktop ? '14px' : '14px',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: '13px',
                fontWeight: 700,
                color: color.ink,
                fontFamily: typography.headingFont,
              }}
            >
              By priority
            </h3>
            <StackedBar
              segments={priSegments}
              legend={priSegments.map((s) => ({ label: s.label, count: s.count, color: s.color }))}
            />
          </div>

          {/* Heatmap week chart */}
          <div
            style={{
              padding: '14px',
              background: color.surface,
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: '13px',
                fontWeight: 700,
                color: color.ink,
                fontFamily: typography.headingFont,
              }}
            >
              This week
            </h3>
            <div style={{ display: 'flex', gap: isDesktop ? '10px' : '8px', justifyContent: 'space-between' }}>
              {weekData.map((w) => {
                const level = heatmapLevel(w.count)
                return (
                  <div
                    key={w.date}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: isDesktop ? '32px' : layout.heatmapDotSize,
                        height: isDesktop ? '32px' : layout.heatmapDotSize,
                        borderRadius: radius.heatmapDot,
                        background: level.bg,
                        color: level.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isDesktop ? '11px' : '10px',
                        fontWeight: 700,
                      }}
                    >
                      {w.count}
                    </div>
                    <div style={{ fontSize: '10px', color: color.inkSoft, fontWeight: 600 }}>{w.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
