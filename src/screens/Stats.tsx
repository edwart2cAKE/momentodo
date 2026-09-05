import {
  useCompletedToday,
  useTotalToday,
  useCompletionPercentage,
  useDifficultyBreakdown,
  usePriorityBreakdown,
} from '../store'
import { difficultyLabels, priorityLabels } from '../store/config'
import { Ring } from '../components'
import { color, typography, radius, shadow } from '../theme/tokens'
import type { Difficulty, Priority } from '../types'

const weekMock = [
  { l: 'Mon', n: 2 },
  { l: 'Tue', n: 4 },
  { l: 'Wed', n: 1 },
  { l: 'Thu', n: 5 },
  { l: 'Fri', n: 3 },
  { l: 'Sat', n: 0 },
  { l: 'Sun', n: 1 },
]

function BreakdownBar({ label, count, max, barColor }: { label: string; count: number; max: number; barColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12.5px', color: color.inkSoft }}>
      <div style={{ width: '60px', flex: 'none', fontWeight: 600 }}>{label}</div>
      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: color.background, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: max > 0 ? `${Math.round((100 * count) / max)}%` : '0%',
            background: barColor,
            borderRadius: '4px',
          }}
        />
      </div>
      <div style={{ width: '20px', textAlign: 'right', fontWeight: 700, color: color.ink }}>{count}</div>
    </div>
  )
}

export function Stats() {
  const completed = useCompletedToday()
  const total = useTotalToday()
  const pct = useCompletionPercentage()
  const diffBreakdown = useDifficultyBreakdown()
  const priBreakdown = usePriorityBreakdown()

  const maxDiff = Math.max(1, ...Object.values(diffBreakdown))
  const maxPri = Math.max(1, ...Object.values(priBreakdown))
  const maxWeek = Math.max(1, ...weekMock.map((w) => w.n))

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

      {/* Ring + summary */}
      <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Ring percentage={pct} />
        <div style={{ fontSize: '13px', color: color.inkSoft, fontWeight: 600 }}>
          <span style={{ display: 'block', fontSize: '20px', color: color.ink, fontFamily: typography.headingFont }}>
            {completed}/{total}
          </span>
          tasks completed today
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div
        style={{
          margin: '6px 20px 14px',
          padding: '14px',
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
        }}
      >
        <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: color.ink, fontFamily: typography.headingFont }}>
          By difficulty
        </h3>
        {([1, 2, 3] as Difficulty[]).map((d) => (
          <BreakdownBar
            key={d}
            label={difficultyLabels[d]}
            count={diffBreakdown[d]}
            max={maxDiff}
            barColor={color.moment['30min']}
          />
        ))}
      </div>

      {/* Priority breakdown */}
      <div
        style={{
          margin: '6px 20px 14px',
          padding: '14px',
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
        }}
      >
        <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: color.ink, fontFamily: typography.headingFont }}>
          By priority
        </h3>
        {([3, 2, 1] as Priority[]).map((p) => (
          <BreakdownBar
            key={p}
            label={priorityLabels[p]}
            count={priBreakdown[p]}
            max={maxPri}
            barColor={color.moment['60min']}
          />
        ))}
      </div>

      {/* Week chart */}
      <div style={{ padding: '4px 20px 8px', fontSize: '12px', fontWeight: 700, color: color.inkSoft }}>
        This week
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: '90px',
          margin: '6px 20px 4px',
          padding: '12px 14px',
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
        }}
      >
        {weekMock.map((w) => (
          <div
            key={w.l}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'flex-end',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '60%',
                borderRadius: '6px 6px 3px 3px',
                background: color.moment['30min'],
                height: w.n === 0 ? '2px' : `${Math.round((100 * w.n) / maxWeek)}%`,
              }}
            />
            <div style={{ fontSize: '10.5px', color: color.inkSoft, fontWeight: 600 }}>{w.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
