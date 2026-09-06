import { useTimerStore, useTaskStore } from '../store'
import { useMediaQuery, DESKTOP_BREAKPOINT } from '../hooks'
import { color, typography, radius, shadow } from '../theme/tokens'

const FOCUS_SECONDS = 25 * 60
const RING_RADIUS = 70
const RING_STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

export function Timer() {
  const mode = useTimerStore((s) => s.mode)
  const remaining = useTimerStore((s) => s.remaining)
  const elapsed = useTimerStore((s) => s.elapsed)
  const running = useTimerStore((s) => s.running)
  const selectedTaskId = useTimerStore((s) => s.selectedTaskId)
  const sessions = useTimerStore((s) => s.sessions)
  const setMode = useTimerStore((s) => s.setMode)
  const setSelectedTaskId = useTimerStore((s) => s.setSelectedTaskId)
  const start = useTimerStore((s) => s.start)
  const pause = useTimerStore((s) => s.pause)
  const reset = useTimerStore((s) => s.reset)
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  const tasks = useTaskStore((s) => s.tasks)
  const incompleteTasks = tasks.filter((t) => !t.done)

  const displayTime = mode === 'focus' ? formatTime(remaining) : formatTime(elapsed)

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null
  const taskName = selectedTask ? selectedTask.title : 'no task'

  const progress = mode === 'focus'
    ? (FOCUS_SECONDS - remaining) / FOCUS_SECONDS
    : Math.min(elapsed / FOCUS_SECONDS, 1)

  const isPaused = !running && (elapsed > 0 || (mode === 'focus' && remaining < FOCUS_SECONDS))
  const ringColor = running ? color.moment['15min'] : isPaused ? color.moment['5min'] : color.ringEmpty
  const ringOffset = CIRCUMFERENCE * (1 - progress)

  const modeBtnStyle = (active: boolean) => ({
    border: 'none',
    background: active ? color.moment['30min'] : 'transparent',
    color: active ? color.white : color.inkSoft,
    fontSize: '12px',
    fontWeight: 700 as const,
    padding: '7px 16px',
    minHeight: '44px',
    borderRadius: radius.modeToggle,
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
  })

  const actionBtnStyle = {
    border: 'none',
    borderRadius: radius.card,
    padding: '11px 24px',
    minHeight: '44px',
    fontWeight: 700 as const,
    fontSize: '13.5px',
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
    background: running ? color.moment['5min'] : color.moment['30min'],
    color: running ? color.ink : color.white,
    minWidth: '100px',
  }

  const resetBtnStyle = {
    border: 'none',
    borderRadius: radius.card,
    padding: '11px 24px',
    minHeight: '44px',
    fontWeight: 700 as const,
    fontSize: '13.5px',
    cursor: 'pointer' as const,
    fontFamily: typography.bodyFont,
    background: color.surface,
    color: color.ink,
    boxShadow: shadow.cardSmall,
  }

  return (
    <div style={{ paddingBottom: isDesktop ? '22px' : '84px' }}>
      <div style={{ textAlign: 'center', padding: isDesktop ? '30px 24px 20px' : '30px 20px 20px' }}>
        {/* Mode toggle */}
        <div
          style={{
            display: 'inline-flex',
            gap: '4px',
            background: color.surface,
            padding: '3px',
            borderRadius: radius.modeToggle,
            marginBottom: '18px',
            boxShadow: shadow.cardSmall,
          }}
        >
          <button style={modeBtnStyle(mode === 'focus')} onClick={() => setMode('focus')}>
            Focus 25
          </button>
          <button style={modeBtnStyle(mode === 'stopwatch')} onClick={() => setMode('stopwatch')}>
            Stopwatch
          </button>
        </div>

        {/* Timer area: ring + task chip on desktop, ring only on mobile */}
        <div
          style={{
            display: isDesktop ? 'flex' : 'block',
            alignItems: isDesktop ? 'center' : undefined,
            justifyContent: isDesktop ? 'center' : undefined,
            gap: isDesktop ? '24px' : undefined,
            margin: '16px 0',
          }}
        >
          {/* Progress ring */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                stroke={color.ringEmpty}
                strokeWidth={RING_STROKE}
              />
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: typography.headingFont,
                fontSize: '42px',
                fontWeight: 700,
                color: color.ink,
              }}
            >
              {displayTime}
            </div>
            {/* Task name inside ring — mobile only */}
            {!isDesktop && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: running ? color.moment['15min'] : color.inkSoft,
                  whiteSpace: 'nowrap',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {taskName}
              </div>
            )}
          </div>

          {/* Active task chip — desktop only, NEXT TO ring */}
          {isDesktop && selectedTask && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: color.surface,
                border: `2px solid ${color.moment['15min']}`,
                borderRadius: '16px',
                padding: '12px 16px',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color.moment['15min'],
                  flex: 'none',
                }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: color.ink }}>{selectedTask.title}</div>
                <div style={{ fontSize: '11px', color: color.inkSoft, marginTop: '2px' }}>
                  {mode === 'focus' ? 'Focus session' : 'Stopwatch'} · {displayTime} {mode === 'focus' ? 'remaining' : 'elapsed'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task selector */}
        <div style={{ marginTop: '8px' }}>
          <select
            value={selectedTaskId ?? ''}
            onChange={(e) => {
              const val = (e.target as HTMLSelectElement).value
              setSelectedTaskId(val || null)
            }}
            style={{
              border: `1px solid ${color.line}`,
              borderRadius: radius.select,
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
          <button
            style={actionBtnStyle}
            onClick={running ? pause : start}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button style={resetBtnStyle} onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {/* Session log */}
      <div style={{ padding: isDesktop ? '4px 24px 8px' : '4px 20px 8px', fontSize: '12px', fontWeight: 700, color: color.inkSoft }}>
        Recent sessions
      </div>
      <div style={{ padding: isDesktop ? '8px 24px' : '8px 20px' }}>
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
                  borderRadius: radius.card,
                  boxShadow: shadow.cardDefault,
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
              borderRadius: radius.card,
              boxShadow: shadow.cardDefault,
            }}
          >
            No sessions yet — start a timer above.
          </div>
        )}
      </div>
    </div>
  )
}
