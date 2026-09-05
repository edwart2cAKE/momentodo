import { useState } from 'preact/hooks'
import { Home, Tasks, Timer, Stats } from './screens'
import { BottomNav } from './components'
import { color, layout, typography } from './theme/tokens'

type Screen = 'home' | 'tasks' | 'timer' | 'stats'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <div
      style={{
        maxWidth: layout.maxWidth,
        margin: '0 auto',
        fontFamily: typography.bodyFont,
        background: color.background,
        minHeight: '100svh',
        boxSizing: 'border-box',
      }}
    >
      {screen === 'home' && <Home onNavigateToTasks={() => setScreen('tasks')} />}
      {screen === 'tasks' && <Tasks />}
      {screen === 'timer' && <Timer />}
      {screen === 'stats' && <Stats />}
      <BottomNav active={screen} onNavigate={setScreen} />
    </div>
  )
}
