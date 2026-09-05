import { useTimerStore, useTaskStore } from '../store'
import { TimerDisplay } from '../components'
import { color, typography } from '../theme/tokens'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

export function Timer() {
  const mode = useTimerStore((s) => s.mode)
  const remaining = useTimerStore((s) => s.remaining)
  const elapsed = useTimerStore((s) => s.elapsed)
  const selectedTaskId = useTimerStore((s) => s.selectedTaskId)
  const sessions = useTimerStore((s) => s.sessions)
  const setMode = useTimerStore((s) => s.setMode)
  const setSelectedTaskId = useTimerStore((s) => s.setSelectedTaskId)
  const start = useTimerStore((s) => s.start)
  const pause = useTimerStore((s) => s.pause)
  const reset = useTimerStore((s) => s.reset)

  const tasks = useTaskStore((s) => s.tasks)
  const incompleteTasks = tasks.filter((t) => !t.done)

  const displayTime = mode === 'focus' ? formatTime(remaining) : formatTime(elapsed)

  const modeBtnStyle = (active: boolean) => ({
    border: 'none',
    background: active ? color.moment['30min'] : 'transparent',
    color: active ? '#FFFFFF' : color.inkSoft,
    fontSize: '12px',
    fontWeight: 700,
    padding: '7px 16px',
    borderRadius: '16px',
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
  })

  const ctlBtnStyle = (primary: boolean) => ({
    border: 'none',
    borderRadius: '22px',
    padding: '11px 24px',
    fontWeight: 700,
    fontSize: '13.5px',
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
    background: primary ? color.moment['30min'] : color.surface,
    color: primary ? '#FFFFFF' : color.ink,
    boxShadow: primary ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
  })

  return (
    <div style={{ paddingBottom: '84px' }}>
      <div style={{ textAlign: 'center', padding: '30px 20px 20px' }}>
        {/* Mode toggle */}
        <div
          style={{
            display: 'inline-flex',
            gap: '4px',
            background: color.surface,
            padding: '3px',
            borderRadius: '20px',
            marginBottom: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <button style={modeBtnStyle(mode === 'focus')} onClick={() => setMode('focus')}>
            Focus 25
          </button>
          <button style={modeBtnStyle(mode === 'stopwatch')} onClick={() => setMode('stopwatch')}>
            Stopwatch
          </button>
        </div>

        {/* Timer display */}
        <TimerDisplay time={displayTime} />

        {/* Task selector */}
        <div style={{ marginTop: '10px' }}>
          <select
            value={selectedTaskId ?? ''}
            onChange={(e) => {
              const val = (e.target as HTMLSelectElement).value
              setSelectedTaskId(val || null)
            }}
            style={{
              border: `1px solid ${color.line}`,
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '13px',
              color: color.ink,
              background: color.surface,
              fontFamily: typography.bodyFont,
              maxWidth: '260px',
            }}
          >
            <option value="">No task selected</option>
            {incompleteTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
          <button style={ctlBtnStyle(true)} onClick={start}>
            Start
          </button>
          <button style={ctlBtnStyle(false)} onClick={pause}>
            Pause
          </button>
          <button style={ctlBtnStyle(false)} onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {/* Session log */}
      <div style={{ padding: '4px 20px 8px', fontSize: '12px', fontWeight: 700, color: color.inkSoft }}>
        Recent sessions
      </div>
      <div style={{ padding: '8px 20px' }}>
        {sessions.length > 0 ? (
          sessions.map((s) => {
            const task = tasks.find((t) => t.id === s.taskId)
            const name = task ? task.title : 'No task'
            const time = new Date(s.endedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  marginBottom: '6px',
                  fontSize: '13px',
                  background: color.surface,
                  borderRadius: '22px',
                  boxShadow: '0 8px 20px rgba(31,58,46,0.08)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: color.ink }}>{name}</div>
                  <div style={{ color: color.inkSoft, fontSize: '11.5px' }}>
                    {s.mode === 'focus' ? 'Focus' : 'Stopwatch'} · {formatTime(s.durationSeconds)}
                  </div>
                </div>
                <div style={{ color: color.inkSoft, fontSize: '11.5px' }}>{time}</div>
              </div>
            )
          })
        ) : (
          <div
            style={{
              padding: '14px',
              textAlign: 'center',
              color: color.inkSoft,
              fontSize: '13px',
              background: color.surface,
              borderRadius: '22px',
              boxShadow: '0 8px 20px rgba(31,58,46,0.08)',
            }}
          >
            No sessions yet — start a timer above.
          </div>
        )}
      </div>
    </div>
  )
}
