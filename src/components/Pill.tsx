import type { MomentDuration } from '../types'
import { color, radius, motion, typography } from '../theme/tokens'

interface PillProps {
  label: string
  selected?: boolean
  onClick: () => void
}

export function Pill({ label, selected = false, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '11px',
        border: `1px solid ${selected ? color.moment['30min'] : color.line}`,
        background: selected ? color.moment['30min'] : color.surface,
        color: selected ? color.white : color.ink,
        borderRadius: radius.pill,
        padding: '3px 9px',
        minHeight: '44px',
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: typography.bodyFont,
        transition: `background ${motion.duration} ${motion.easing}, color ${motion.duration} ${motion.easing}, border-color ${motion.duration} ${motion.easing}`,
      }}
    >
      {label}
    </button>
  )
}

interface TimePillProps {
  duration: MomentDuration
  selected: boolean
  onClick: () => void
}

export function TimePill({ duration, selected, onClick }: TimePillProps) {
  return <Pill label={`${duration}m`} selected={selected} onClick={onClick} />
}
