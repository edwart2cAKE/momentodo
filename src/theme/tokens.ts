/**
 * Design tokens — generated from design-tokens.json.
 * Source of truth: design-tokens.json (Warm & Tactile polish, Polish B state).
 * Do not hand-edit values here; update the JSON and re-generate.
 */

export const color = {
  background: '#EEF4EE',
  surface: '#FFFFFF',
  ink: '#1F3A2E',
  inkSoft: '#6C8578',
  line: '#DCE8E0',
  moment: {
    '5min': '#FFCA4D',
    '15min': '#04C495',
    '30min': '#4C9CE0',
    '60min': '#FF5A3D',
  },
  priorityTag: {
    low: { bg: '#E4F3EA', text: '#2F7B57' },
    med: { bg: '#FFF3D6', text: '#A67300' },
    high: { bg: '#FFE3DD', text: '#C1401F' },
  },
} as const

export const radius = {
  card: '22px',
  pill: '14px',
} as const

export const shadow = {
  cardDefault: '0 8px 20px rgba(31,58,46,0.08)',
  momentCardDefault: '0 6px 14px rgba(0,0,0,0.10)',
  momentCardGlow: {
    '5min': '0 6px 16px rgba(255,202,77,0.45)',
    '15min': '0 6px 16px rgba(4,196,149,0.4)',
    '30min': '0 6px 16px rgba(76,156,224,0.4)',
    '60min': '0 6px 16px rgba(255,90,61,0.4)',
  },
} as const

export const motion = {
  duration: '280ms',
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  checkCompletePop: {
    duration: '280ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  momentCardSelected: {
    transform: 'scale(1.05)',
  },
  accordionOpen: {
    duration: '280ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

export const typography = {
  headingFont: "'Poppins', sans-serif",
  bodyFont: "'Inter', sans-serif",
  headingWeights: [500, 600, 700] as const,
  bodyWeights: [400, 500, 600, 700] as const,
  sizes: {
    screenTitle: '22px',
    taskTitle: '14.5px',
    momentCardNumber: '21px',
    timerDisplay: '58px',
    tag: '10.5px',
  },
} as const

export const layout = {
  maxWidth: '460px',
  momentGridColumns: 4,
  momentGridGap: '8px',
} as const

export const iconography = {
  style: 'emoji',
  size: '20px',
  home: '⏳',
  tasks: '✅',
  timer: '⏱️',
  stats: '📊',
} as const

/** All tokens collected into a single object for convenience. */
export const tokens = {
  color,
  radius,
  shadow,
  motion,
  typography,
  layout,
  iconography,
} as const
