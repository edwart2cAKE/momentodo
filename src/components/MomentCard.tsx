import type { MomentDuration } from '../types'
import { color, radius, shadow, motion, typography } from '../theme/tokens'

interface MomentCardProps {
  duration: MomentDuration
  selected: boolean
  onClick: () => void
}

const bgMap: Record<MomentDuration, string> = {
  5: color.moment['5min'],
  15: color.moment['15min'],
  30: color.moment['30min'],
  60: color.moment['60min'],
}

const glowMap: Record<MomentDuration, string> = {
  5: shadow.momentCardGlow['5min'],
  15: shadow.momentCardGlow['15min'],
  30: shadow.momentCardGlow['30min'],
  60: shadow.momentCardGlow['60min'],
}

export function MomentCard({ duration, selected, onClick }: MomentCardProps) {
  const isLight = duration === 5
  const textColor = isLight ? color.ink : color.white

  return (
    <button
      onClick={onClick}
      style={{
        background: bgMap[duration],
        color: textColor,
        border: selected ? `3px solid ${color.ink}` : '3px solid transparent',
        borderRadius: radius.card,
        padding: '16px 12px',
        textAlign: 'center',
        cursor: 'pointer',
        fontFamily: typography.headingFont,
        fontWeight: 600,
        fontSize: '13px',
        boxShadow: selected
          ? `0 0 0 3px ${color.ink} inset`
          : glowMap[duration],
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        transition: `transform ${motion.duration} ${motion.easing}, box-shadow ${motion.duration} ${motion.easing}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      <span
        style={{
          fontSize: '26px',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {duration}
      </span>
      <span style={{ fontSize: '11px', opacity: 0.8 }}>minutes</span>
    </button>
  )
}
