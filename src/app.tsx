import { useState } from 'preact/hooks'
import { Home, Tasks, Timer, Stats } from './screens'
import { BottomNav, Sidebar } from './components'
import { useMediaQuery, DESKTOP_BREAKPOINT } from './hooks'
import { color, layout, typography } from './theme/tokens'

type Screen = 'home' | 'tasks' | 'timer' | 'stats'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  return (
    <div
      style={{
        display: 'flex',
        height: '100svh',
        fontFamily: typography.bodyFont,
        background: isDesktop ? '#2A2D2A' : color.background,
        overflow: 'hidden',
      }}
    >
      {isDesktop && <Sidebar active={screen} onNavigate={setScreen} />}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          background: color.background,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: isDesktop ? '960px' : layout.maxWidth, margin: '0 auto' }}>
          {screen === 'home' && <Home onNavigateToTasks={() => setScreen('tasks')} />}
          {screen === 'tasks' && <Tasks />}
          {screen === 'timer' && <Timer />}
          {screen === 'stats' && <Stats />}
        </div>
      </main>
      {!isDesktop && <BottomNav active={screen} onNavigate={setScreen} />}
    </div>
  )
}
