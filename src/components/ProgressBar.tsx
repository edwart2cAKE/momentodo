import { color } from '../theme/tokens'

interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))

  return (
    <div
      style={{
        flex: 1,
        height: '8px',
        background: color.line,
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.round(clamped * 100)}%`,
          background: color.moment['15min'],
          borderRadius: '4px',
          transition: 'width 0.3s',
        }}
      />
    </div>
  )
}
