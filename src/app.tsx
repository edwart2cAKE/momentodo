import { color, typography, layout } from './theme/tokens'

export function App() {
  return (
    <div
      style={{
        maxWidth: layout.maxWidth,
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: typography.bodyFont,
        background: color.background,
        minHeight: '100svh',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          fontFamily: typography.headingFont,
          fontSize: typography.sizes.screenTitle,
          fontWeight: 600,
          color: color.ink,
          margin: '0 0 16px',
        }}
      >
        Momentodo
      </h1>
      <p style={{ color: color.inkSoft }}>
        Phase 0 scaffold complete — ready for Phase 1.
      </p>
    </div>
  )
}
