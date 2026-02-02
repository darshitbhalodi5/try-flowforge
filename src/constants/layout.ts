/**
 * Layout Constants
 * Breakpoints for the application to measure the screen size and dimensions of the canvas in runtime
 */

export const LAYOUT_CONSTANTS = {
  NAVBAR_HEIGHT: 64,

  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },

  SIDEBAR_WIDTHS: {
    CATEGORY: {
      MOBILE: 48,
      TABLET: 48,
      DESKTOP: 56,
    },
    BLOCKS: {
      MOBILE: 140,
      TABLET: 140,
      LAPTOP: 160,
      DESKTOP: 170,
    },
    CONFIG: {
      MOBILE: 280,
      TABLET: 280,
      LAPTOP: 300,
      DESKTOP: 320,
    },
  },

  TOOLBAR: {
    PADDING: {
      MOBILE: 8,
      DESKTOP: 12,
    },
    HEIGHT: {
      MOBILE: 28,
      DESKTOP: 36,
    },
  },

  Z_INDEX: {
    BACKDROP: 40,
    DRAWER: 50,
    TOOLBAR: 10,
  },
} as const;

export const UI_CONSTANTS = {
  TOOLTIP_DELAY: 300,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 150,
} as const;

// Canvas dimensions
export const CANVAS = {
  MIN_HEIGHT: 400,
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2,
  FIT_VIEW_PADDING: 0.2,
} as const;

// Node dimensions
export const NODE = {
  BASE: {
    WIDTH: 64, // w-16
    HEIGHT: 64, // h-16
  },
  SWITCH: {
    WIDTH: 64,
    MIN_HEIGHT: 64,
    MAX_HEIGHT: 120,
    HEIGHT_PER_CASE: 24,
    BASE_HEIGHT: 16,
  },
  HANDLE: {
    SIZE: 16,
    OFFSET: 8,
    INNER_DOT_SIZE: 8,
  },
} as const;

// Extended Z-index layers
export const Z_INDEX = {
  CANVAS_CONTENT: 1,
  TOOLBAR: 10,
  STATUS_BAR: 10,
  MOBILE_BACKDROP: 40,
  MOBILE_DRAWER: 50,
  MODAL_BACKDROP: 50,
  MODAL: 60,
  TOOLTIP: 100,
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  DRAWER_SLIDE: 300,
} as const;

// Spacing scale (matches design system)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  XXL: 32,
} as const;

// Limits for features
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_CONNECTIONS_DISPLAY: 50,
  MAX_CHANNELS_DISPLAY: 100,
  MAX_WORKFLOW_NODES: 100,
  MAX_WORKFLOW_HISTORY: 50,
} as const;
