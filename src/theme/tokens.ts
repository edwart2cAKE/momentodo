/**
 * Design tokens — generated from design-tokens.json.
 * Source of truth: design-tokens.json (Warm & Tactile polish, Polish B state).
 * Do not hand-edit values here; update the JSON and re-generate.
 */

export const color = {
  background: '#EEF4EE',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  ink: '#1F3A2E',
  inkSoft: '#6C8578',
  line: '#DCE8E0',
  needsDetailsBg: '#FFF7E0',
  ringEmpty: '#E4EDE6',
  moment: {
    '5min': '#FFCA4D',
    '15min': '#04C495',
    '30min': '#4C9CE0',
    '60min': '#FF5A3D',
  },
  priorityTag: {
    low: { bg: '#D4EDDA', text: '#1A5C3A' },
    med: { bg: '#FFF0C8', text: '#7A5500' },
    high: { bg: '#FFD6CC', text: '#8B2E15' },
  },
  heatmap: {
    level0: '#EEF4EE',
    level0Text: '#DCE8E0',
    level1: '#E4F3EA',
    level1Text: '#04C495',
    level2: '#B8EDCF',
    level2Text: '#04A67A',
    level3: '#04C495',
    level3Text: '#FFFFFF',
  },
  difficultyBar: {
    easy: '#A9C9EA',
    medium: '#5AA9E6',
    hard: '#1D6FB8',
  },
  priorityBar: {
    low: '#F2AA9C',
    med: '#FF6F59',
    high: '#D8452A',
  },
  dueDate: {
    overdue: { bg: '#FFD6CC', text: '#8B2E15' },
    today: { bg: '#FFF0C8', text: '#7A5500' },
    tomorrow: { bg: '#D6E0F0', text: '#1E3A6A' },
    default: { bg: '#D4EDDA', text: '#1A5C3A' },
  },
  chipBg: '#f8faf8',
} as const

export const radius = {
  card: '22px',
  pill: '14px',
  modeToggle: '20px',
  filterBtn: '10px',
  select: '10px',
  heatmapDot: '8px',
  stackedBar: '10px',
  chip: '14px',
} as const

export const shadow = {
  cardDefault: '0 8px 20px rgba(31,58,46,0.08)',
  cardSmall: '0 2px 8px rgba(0,0,0,0.04)',
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
  momentGridColumns: 2,
  momentGridGap: '10px',
  heatmapDotSize: '28px',
  stackedBarHeight: '20px',
  timerRingSize: '160px',
  timerRingStroke: '10',
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
