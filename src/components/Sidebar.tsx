import { iconography, color, motion, typography } from '../theme/tokens'

type Screen = 'home' | 'tasks' | 'timer' | 'stats'

interface SidebarProps {
  active: Screen
  onNavigate: (screen: Screen) => void
}

const tabs: { key: Screen; icon: string; label: string }[] = [
  { key: 'home', icon: iconography.home, label: 'Home' },
  { key: 'tasks', icon: iconography.tasks, label: 'Tasks' },
  { key: 'timer', icon: iconography.timer, label: 'Timer' },
  { key: 'stats', icon: iconography.stats, label: 'Stats' },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: '180px',
        background: color.ink,
        padding: '20px 0',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: typography.headingFont,
          fontSize: '18px',
          fontWeight: 600,
          color: color.white,
          padding: '0 16px 24px',
        }}
      >
        Momentodo
      </div>
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              color: isActive ? color.white : '#8A9A8E',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderLeft: isActive ? '3px solid #4C9CE0' : '3px solid transparent',
              fontFamily: typography.bodyFont,
              transition: `all ${motion.duration} ${motion.easing}`,
              textAlign: 'left',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', lineHeight: 1 }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </aside>
  )
}
