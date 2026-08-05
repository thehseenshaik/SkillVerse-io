/**
 * SkillVerse Design Tokens
 * Centralized design system documentation and type-safe token access
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Semantic colors (mapped from CSS variables)
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  card: "var(--color-card)",
  "card-foreground": "var(--color-card-foreground)",
  popover: "var(--color-popover)",
  "popover-foreground": "var(--color-popover-foreground)",
  primary: "var(--color-primary)",
  "primary-foreground": "var(--color-primary-foreground)",
  secondary: "var(--color-secondary)",
  "secondary-foreground": "var(--color-secondary-foreground)",
  muted: "var(--color-muted)",
  "muted-foreground": "var(--color-muted-foreground)",
  accent: "var(--color-accent)",
  "accent-foreground": "var(--color-accent-foreground)",
  destructive: "var(--color-destructive)",
  "destructive-foreground": "var(--color-destructive-foreground)",
  border: "var(--color-border)",
  input: "var(--color-input)",
  ring: "var(--color-ring)",

  // Brand colors
  brand: "var(--color-brand)",
  "brand-foreground": "var(--color-brand-foreground)",
  "brand-glow": "var(--color-brand-glow)",
  "accent-2": "var(--color-accent-2)",
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    display: "var(--font-display)",
    sans: "var(--font-sans)",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: "0",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
  "2xl": "calc(var(--radius) + 8px)",
  "3xl": "calc(var(--radius) + 12px)",
  full: "9999px",
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  none: "none",
  soft: "var(--shadow-soft)",
  glow: "var(--shadow-glow)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================

export const zIndex = {
  dropdown: 10,
  sticky: 20,
  navbar: 50,
  modal: 100,
  popover: 200,
  tooltip: 300,
  toast: 400,
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================

export const animation = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  slower: "500ms",
  slowest: "1000ms",
} as const;

// ============================================
// UTILITY CLASSES MAPPING
// ============================================

export const utilities = {
  glass: "glass",
  "text-gradient": "text-gradient",
  "bg-hero": "bg-hero",
  "bg-brand-gradient": "bg-brand-gradient",
  "shadow-elegant": "shadow-elegant",
  "shadow-glow": "shadow-glow",
  "animate-float": "animate-float",
  "animate-pulse-glow": "animate-pulse-glow",
  "animate-fade-up": "animate-fade-up",
  "animate-aurora": "animate-aurora",
  "animate-aurora-2": "animate-aurora-2",
  "animate-grid-pan": "animate-grid-pan",
  "animate-shimmer": "animate-shimmer",
  skeleton: "skeleton",
} as const;

// ============================================
// COMPONENT SPECIFIC TOKENS
// ============================================

export const components = {
  button: {
    height: {
      sm: "2.25rem", // 36px
      md: "2.5rem", // 40px
      lg: "2.75rem", // 44px
    },
    padding: {
      sm: "0.5rem 1rem",
      md: "0.625rem 1.25rem",
      lg: "0.75rem 1.5rem",
    },
  },
  input: {
    height: "2.5rem", // 40px
    padding: "0.5rem 0.75rem",
  },
  card: {
    padding: "1.5rem",
  },
} as const;

// ============================================
// ACCESSIBILITY
// ============================================

export const accessibility = {
  focusRing:
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  skipToContent:
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:foreground",
} as const;
