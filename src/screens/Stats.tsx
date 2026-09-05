import {
  useCompletedToday,
  useTotalToday,
  useCompletionPercentage,
  useDifficultyBreakdown,
  usePriorityBreakdown,
} from '../store'
import { Ring } from '../components'
import { color, typography, radius, shadow, layout } from '../theme/tokens'

const weekMock = [
  { l: 'Mon', n: 2 },
  { l: 'Tue', n: 4 },
  { l: 'Wed', n: 1 },
  { l: 'Thu', n: 5 },
  { l: 'Fri', n: 3 },
  { l: 'Sat', n: 0 },
  { l: 'Sun', n: 1 },
]

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
          Stats
        </h1>
        <p style={{ margin: 0, color: color.inkSoft, fontSize: '13px' }}>How today's going.</p>
      </div>

      {/* 2-column stat grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '14px 20px',
        }}
      >
        {/* Mini ring + completed */}
        <div
          style={{
            background: color.surface,
            borderRadius: radius.card,
            boxShadow: shadow.cardDefault,
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Ring percentage={pct} size={48} innerSize={36} fontSize="12px" />
          <div>
            <div
              style={{
                fontFamily: typography.headingFont,
                fontSize: '28px',
                fontWeight: 700,
                color: color.ink,
                lineHeight: 1,
              }}
            >
              {completed}/{total}
            </div>
            <div style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600, marginTop: '2px' }}>
              completed
            </div>
          </div>
        </div>

        {/* Total tasks */}
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
            tasks total
          </div>
        </div>

        {/* Medium difficulty */}
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

        {/* High priority */}
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
            {priBreakdown[3]}
          </div>
          <div style={{ fontSize: '11px', color: color.inkSoft, fontWeight: 600, marginTop: '2px' }}>
            high priority
          </div>
        </div>
      </div>

      {/* Stacked difficulty breakdown */}
      <div
        style={{
          margin: '0 20px 14px',
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
          By difficulty
        </h3>
        <StackedBar
          segments={diffSegments}
          legend={diffSegments.map((s) => ({ label: s.label, count: s.count, color: s.color }))}
        />
      </div>

      {/* Stacked priority breakdown */}
      <div
        style={{
          margin: '0 20px 14px',
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
          margin: '0 20px 14px',
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
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          {weekMock.map((w) => {
            const level = heatmapLevel(w.n)
            return (
              <div
                key={w.l}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    width: layout.heatmapDotSize,
                    height: layout.heatmapDotSize,
                    borderRadius: radius.heatmapDot,
                    background: level.bg,
                    color: level.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {w.n}
                </div>
                <div style={{ fontSize: '10px', color: color.inkSoft, fontWeight: 600 }}>{w.l}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
