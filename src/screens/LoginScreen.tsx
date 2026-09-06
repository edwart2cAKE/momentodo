import { useState } from 'preact/hooks'
import type { JSX } from 'preact'
import { signIn, signUp, getCurrentUserId } from '../supabaseClient'
import { setActiveRepository } from '../store/persistence'
import { color, radius, shadow, typography, layout } from '../theme/tokens'

type Mode = 'signIn' | 'signUp'

interface LoginScreenProps {
  onAuthenticated: () => void
  onContinueOffline: () => void
}

export function LoginScreen({ onAuthenticated, onContinueOffline }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>('signIn')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    if (!trimmedUsername || !password) {
      setError('Enter a username and password.')
      return
    }
    if (mode === 'signUp' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signUp') {
        await signUp(trimmedUsername, password)
      } else {
        await signIn(trimmedUsername, password)
      }
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('Signed in, but no session was found. Please try again.')
      }
      setActiveRepository(userId)
      onAuthenticated()
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: color.background,
        fontFamily: typography.bodyFont,
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          background: color.surface,
          borderRadius: radius.card,
          boxShadow: shadow.cardDefault,
          padding: '32px 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
          <h1
            style={{
              fontFamily: typography.headingFont,
              fontSize: typography.sizes.screenTitle,
              fontWeight: 600,
              color: color.ink,
              margin: 0,
            }}
          >
            Momentodo
          </h1>
          <p style={{ color: color.inkSoft, fontSize: '13px', marginTop: '4px' }}>
            {mode === 'signIn' ? 'Log in to sync across your devices' : 'Create an account to sync across devices'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={fieldLabelStyle}>
            Username
            <input
              type="text"
              value={username}
              onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
              autoComplete="username"
              placeholder="yourname"
              style={inputStyle}
            />
          </label>

          <label style={fieldLabelStyle}>
            Password
            <input
              type="password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              style={inputStyle}
            />
          </label>

          {error && (
            <div
              style={{
                background: color.dueDate.overdue.bg,
                color: color.dueDate.overdue.text,
                borderRadius: radius.filterBtn,
                padding: '10px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
            {submitting ? 'Please wait…' : mode === 'signIn' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode(mode === 'signIn' ? 'signUp' : 'signIn')
          }}
          style={linkButtonStyle}
        >
          {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>

        <button type="button" onClick={onContinueOffline} style={{ ...linkButtonStyle, color: color.inkSoft }}>
          Continue without an account
        </button>
      </div>
    </div>
  )
}

function messageFor(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  // Supabase's default copy mentions "email" since usernames are stored as
  // fake emails internally — reword the common cases so they make sense
  // for a username-based UI.
  if (/invalid login credentials/i.test(raw)) return 'Incorrect username or password.'
  if (/user already registered/i.test(raw)) return 'That username is already taken.'
  if (/email/i.test(raw)) return raw.replace(/email/gi, 'username')
  return raw
}

const fieldLabelStyle: JSX.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: color.inkSoft,
}

const inputStyle: JSX.CSSProperties = {
  border: `1px solid ${color.line}`,
  borderRadius: radius.filterBtn,
  padding: '12px 14px',
  fontSize: '14.5px',
  fontFamily: typography.bodyFont,
  color: color.ink,
  minHeight: '44px',
  outline: 'none',
}

function primaryButtonStyle(disabled: boolean): JSX.CSSProperties {
  return {
    marginTop: '4px',
    border: 'none',
    borderRadius: radius.filterBtn,
    padding: '12px',
    minHeight: '44px',
    fontSize: '14.5px',
    fontWeight: 700,
    fontFamily: typography.bodyFont,
    color: color.white,
    background: disabled ? color.inkSoft : color.moment['15min'],
    cursor: disabled ? 'default' : 'pointer',
    boxShadow: disabled ? 'none' : shadow.momentCardGlow['15min'],
  }
}

const linkButtonStyle: JSX.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  color: color.ink,
  fontSize: '12.5px',
  fontWeight: 600,
  fontFamily: typography.bodyFont,
  marginTop: '16px',
  cursor: 'pointer',
  textDecoration: 'underline',
}
