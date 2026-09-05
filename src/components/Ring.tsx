import { color, typography } from '../theme/tokens'

interface RingProps {
  percentage: number
}

export function Ring({ percentage }: RingProps) {
  const clamped = Math.max(0, Math.min(100, percentage))

  return (
    <div
      style={{
        width: '88px',
        height: '88px',
        borderRadius: '50%',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `conic-gradient(${color.moment['15min']} ${clamped}%, ${color.ringEmpty} 0)`,
      }}
    >
      <div
        style={{
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          background: color.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: typography.headingFont,
          fontWeight: 700,
          fontSize: '16px',
          color: color.ink,
        }}
      >
        {clamped}%
      </div>
    </div>
  )
}
