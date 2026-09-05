import { color, typography } from '../theme/tokens'

interface RingProps {
  percentage: number
  size?: number
  innerSize?: number
  fontSize?: string
}

export function Ring({ percentage, size = 88, innerSize = 66, fontSize = '16px' }: RingProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const outerBorder = 4
  const actualOuter = size + outerBorder * 2
  const actualInner = innerSize

  return (
    <div
      style={{
        width: `${actualOuter}px`,
        height: `${actualOuter}px`,
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
          width: `${actualInner}px`,
          height: `${actualInner}px`,
          borderRadius: '50%',
          background: color.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: typography.headingFont,
          fontWeight: 700,
          fontSize,
          color: color.ink,
        }}
      >
        {clamped}%
      </div>
    </div>
  )
}
