import { useState, useEffect } from 'preact/hooks'
import { getCurrentUser, updatePassword } from '../supabaseClient'
import { useSettingsStore } from '../store/settingsStore'
import { repository } from '../store/persistence'
import { color, radius, shadow, typography } from '../theme/tokens'

interface SettingsProps {
  isAuthenticated: boolean
  onLogout: () => void
  onShowLogin: () => void
}

export function Settings({ isAuthenticated, onLogout, onShowLogin }: SettingsProps) {
  return (
    <div style={{ paddingBottom: '84px' }}>
      <div style={{ padding: '22px 20px 6px' }}>
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontSize: typography.sizes.screenTitle,
            fontWeight: 600,
            color: color.ink,
            margin: '0 0 12px',
          }}
        >
          Settings
        </h1>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AccountSection isAuthenticated={isAuthenticated} onLogout={onLogout} onShowLogin={onShowLogin} />
        <DataSection />
        <PreferencesSection />
        <AboutSection />
      </div>
    </div>
  )
}

function AccountSection({
  isAuthenticated,
  onLogout,
  onShowLogin,
}: {
  isAuthenticated: boolean
  onLogout: () => void
  onShowLogin: () => void
}) {
  const [user, setUser] = useState<{ id: string; username: string | null } | null>(null)
  const [newPw, setNewPw] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [pwError, setPwError] = useState('')
  const [showPwForm, setShowPwForm] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser().then(setUser)
    }
  }, [isAuthenticated])

  const handleChangePassword = async (e: Event) => {
    e.preventDefault()
    if (!newPw) return
    setPwStatus('submitting')
    setPwError('')
    try {
      await updatePassword(newPw)
      setPwStatus('success')
      setNewPw('')
      setTimeout(() => setPwStatus('idle'), 3000)
    } catch (err) {
      setPwStatus('error')
      setPwError(err instanceof Error ? err.message : 'Failed to update password.')
    }
  }

  return (
    <SectionCard title="Account">
      {isAuthenticated ? (
        <>
          <div style={{ fontSize: '13px', color: color.ink, marginBottom: '12px' }}>
            Signed in as <strong>{user?.username ?? '...'}</strong>
          </div>

          {!showPwForm ? (
            <button
              type="button"
              onClick={() => setShowPwForm(true)}
              style={secondaryButtonStyle}
            >
              Change password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="password"
                placeholder="New password"
                value={newPw}
                onInput={(e) => setNewPw((e.target as HTMLInputElement).value)}
                style={inputStyle}
              />
              <button type="submit" disabled={pwStatus === 'submitting'} style={primaryButtonStyle(pwStatus === 'submitting')}>
                {pwStatus === 'submitting' ? 'Saving...' : 'Update password'}
              </button>
              {pwStatus === 'success' && (
                <div style={{ fontSize: '12px', color: color.moment['15min'], fontWeight: 600 }}>
                  Password updated.
                </div>
              )}
              {pwStatus === 'error' && (
                <div style={{ fontSize: '12px', color: color.dueDate.overdue.text, fontWeight: 600 }}>
                  {pwError}
                </div>
              )}
              <button
                type="button"
                onClick={() => { setShowPwForm(false); setPwStatus('idle'); setPwError('') }}
                style={{ ...secondaryButtonStyle, marginTop: 0 }}
              >
                Cancel
              </button>
            </form>
          )}

          <button type="button" onClick={onLogout} style={{ ...secondaryButtonStyle, marginTop: '8px', color: color.dueDate.overdue.text }}>
            Log out
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '13px', color: color.inkSoft, marginBottom: '12px' }}>
            Not signed in
          </div>
          <button type="button" onClick={onShowLogin} style={primaryButtonStyle(false)}>
            Log in / Sign up
          </button>
        </>
      )}
    </SectionCard>
  )
}

function DataSection() {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleExport = async () => {
    const tasks = await repository.getTasks()
    const sessions = await repository.getSessions()
    const data = { tasks, sessions, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `momentodo-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearLocal = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    localStorage.removeItem('momentodo_tasks')
    localStorage.removeItem('momentodo_sessions')
    window.location.reload()
  }

  return (
    <SectionCard title="Data">
      <button type="button" onClick={handleExport} style={secondaryButtonStyle}>
        Export data as JSON
      </button>

      <div style={{ marginTop: '8px' }}>
        {!confirmClear ? (
          <button type="button" onClick={handleClearLocal} style={secondaryButtonStyle}>
            Clear local data
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '12px', color: color.dueDate.overdue.text, fontWeight: 600 }}>
              This will delete all local tasks and sessions. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleClearLocal}
                style={{ ...primaryButtonStyle(false), flex: 1, background: color.dueDate.overdue.text }}
              >
                Confirm clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                style={{ ...secondaryButtonStyle, flex: 1, marginTop: 0 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function PreferencesSection() {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion)

  return (
    <SectionCard title="Preferences">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '44px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: color.ink, fontWeight: 600 }}>Reduce motion</div>
          <div style={{ fontSize: '11px', color: color.inkSoft }}>Disables transitions and animations</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
          style={{
            width: '48px',
            height: '28px',
            borderRadius: '14px',
            border: 'none',
            background: reduceMotion ? color.moment['15min'] : color.line,
            cursor: 'pointer',
            position: 'relative',
            transition: `background ${reduceMotion ? '0ms' : '150ms'}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '3px',
              left: reduceMotion ? '23px' : '3px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: color.white,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: reduceMotion ? 'none' : 'left 150ms',
            }}
          />
        </button>
      </div>
    </SectionCard>
  )
}

function AboutSection() {
  return (
    <SectionCard title="About">
      <div style={{ fontSize: '13px', color: color.ink, fontWeight: 600 }}>Momentodo v0.1.0</div>
      <a
        href="https://github.com/anomalyco/opencode"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '12px',
          color: color.moment['30min'],
          textDecoration: 'underline',
          fontWeight: 600,
        }}
      >
        View on GitHub
      </a>
    </SectionCard>
  )
}

function SectionCard({ title, children }: { title: string; children: preact.ComponentChildren }) {
  return (
    <div
      style={{
        background: color.surface,
        borderRadius: radius.card,
        boxShadow: shadow.cardDefault,
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: color.inkSoft,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '10px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

const inputStyle: preact.CSSProperties = {
  border: `1px solid ${color.line}`,
  borderRadius: radius.filterBtn,
  padding: '10px 12px',
  fontSize: '13px',
  fontFamily: typography.bodyFont,
  color: color.ink,
  minHeight: '44px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function primaryButtonStyle(disabled: boolean): preact.CSSProperties {
  return {
    border: 'none',
    borderRadius: radius.filterBtn,
    padding: '10px 12px',
    minHeight: '44px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: typography.bodyFont,
    color: color.white,
    background: disabled ? color.inkSoft : color.moment['15min'],
    cursor: disabled ? 'default' : 'pointer',
    width: '100%',
  }
}

const secondaryButtonStyle: preact.CSSProperties = {
  border: `1px solid ${color.line}`,
  borderRadius: radius.filterBtn,
  padding: '10px 12px',
  minHeight: '44px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: typography.bodyFont,
  color: color.ink,
  background: color.surface,
  cursor: 'pointer',
  width: '100%',
  marginTop: '6px',
}
