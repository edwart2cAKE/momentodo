import { useEffect, useState } from 'preact/hooks'
import { Home, Tasks, Timer, Stats, Settings } from './screens'
import { LoginScreen } from './screens/LoginScreen'
import { BottomNav, Sidebar } from './components'
import { useMediaQuery, DESKTOP_BREAKPOINT } from './hooks'
import { color, layout, typography } from './theme/tokens'
import { useTaskStore, useTimerStore } from './store'
import { setActiveRepository } from './store/persistence'
import { getCurrentUserId, signOut } from './supabaseClient'

type Screen = 'home' | 'tasks' | 'timer' | 'stats' | 'settings'

// Remembers a choice to use the app without an account, so we don't nag
// on every visit. Cleared on logout.
const SKIP_AUTH_KEY = 'momentodo_skip_auth'

type AuthPhase = 'checking' | 'needsAuth' | 'ready'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  const [authPhase, setAuthPhase] = useState<AuthPhase>('checking')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const taskHydrated = useTaskStore((s) => s.hydrated)
  const timerHydrated = useTimerStore((s) => s.hydrated)

  // Resolve auth state once on startup: if there's an existing Supabase
  // session, use it; if the user previously chose to skip auth, respect
  // that; otherwise show the login screen.
  useEffect(() => {
    let cancelled = false

    async function resolveAuth() {
      const userId = await getCurrentUserId()
      if (cancelled) return

      if (userId) {
        setActiveRepository(userId)
        setIsAuthenticated(true)
        setAuthPhase('ready')
        return
      }

      if (localStorage.getItem(SKIP_AUTH_KEY) === 'true') {
        setIsAuthenticated(false)
        setAuthPhase('ready')
        return
      }

      setAuthPhase('needsAuth')
    }

    resolveAuth()
    return () => {
      cancelled = true
    }
  }, [])

  // Hydrate stores once we know which repository to read from.
  useEffect(() => {
    if (authPhase !== 'ready') return
    useTaskStore.getState().init()
    useTimerStore.getState().init()
  }, [authPhase])

  const handleLogout = async () => {
    await signOut().catch(() => {
      // Even if the network call fails, still drop local session state
      // and fall back to offline mode so the user isn't stuck.
    })
    localStorage.removeItem(SKIP_AUTH_KEY)
    setActiveRepository(null)
    setIsAuthenticated(false)
    setAuthPhase('needsAuth')
  }

  if (authPhase === 'checking') {
    return <div style={{ minHeight: '100svh', background: color.background }} />
  }

  if (authPhase === 'needsAuth') {
    return (
      <LoginScreen
        onAuthenticated={() => {
          setIsAuthenticated(true)
          setAuthPhase('ready')
        }}
        onContinueOffline={() => {
          localStorage.setItem(SKIP_AUTH_KEY, 'true')
          setIsAuthenticated(false)
          setAuthPhase('ready')
        }}
      />
    )
  }

  if (!taskHydrated || !timerHydrated) {
    return <div style={{ minHeight: '100svh', background: color.background }} />
  }

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
      {isDesktop && (
        <Sidebar
          active={screen}
          onNavigate={setScreen}
        />
      )}
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
          {screen === 'settings' && (
            <Settings
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onShowLogin={() => setAuthPhase('needsAuth')}
            />
          )}
        </div>
      </main>
      {!isDesktop && <BottomNav active={screen} onNavigate={setScreen} />}
    </div>
  )
}
