import { typography, color } from '../theme/tokens'

interface TimerDisplayProps {
  time: string
}

export function TimerDisplay({ time }: TimerDisplayProps) {
  return (
    <div
      style={{
        fontFamily: typography.headingFont,
        fontSize: typography.sizes.timerDisplay,
        fontWeight: 700,
        color: color.ink,
        textAlign: 'center',
        lineHeight: 1,
      }}
    >
      {time}
    </div>
  )
}
