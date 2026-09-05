import { iconography, color, motion, typography } from '../theme/tokens'

type Screen = 'home' | 'tasks' | 'timer' | 'stats'

interface BottomNavProps {
  active: Screen
  onNavigate: (screen: Screen) => void
}

const tabs: { key: Screen; icon: string; label: string }[] = [
  { key: 'home', icon: iconography.home, label: 'Home' },
  { key: 'tasks', icon: iconography.tasks, label: 'Tasks' },
  { key: 'timer', icon: iconography.timer, label: 'Timer' },
  { key: 'stats', icon: iconography.stats, label: 'Stats' },
]

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 0,
        width: '100%',
        maxWidth: '460px',
        background: color.surface,
        borderTop: `1px solid ${color.line}`,
        display: 'flex',
        padding: '8px 6px 12px',
        zIndex: 40,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              color: isActive ? color.moment['30min'] : color.inkSoft,
              fontFamily: typography.bodyFont,
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 0',
              minHeight: '44px',
              transition: `color ${motion.duration} ${motion.easing}`,
            }}
          >
            <span style={{ fontSize: `${Number(iconography.size.replace('px', ''))}px`, lineHeight: 1 }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
