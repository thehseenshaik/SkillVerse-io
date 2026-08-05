import type { Theme } from "./types";

// Predefined theme presets
export const themePresets: Record<string, Theme> = {
  default: {
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#06b6d4',
      text: '#1f2937',
      background: '#ffffff',
    },
    headingStyle: {
      size: 'medium',
      weight: 'semibold',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'normal',
      borders: true,
      borderColor: '#e5e7eb',
      background: '#ffffff',
    },
    icons: {
      enabled: true,
      style: 'outlined',
    },
  },
  professional: {
    typography: {
      fontFamily: 'Roboto',
      headingFont: 'Roboto',
      bodyFont: 'Roboto',
    },
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#0ea5e9',
      text: '#1f2937',
      background: '#ffffff',
    },
    headingStyle: {
      size: 'medium',
      weight: 'bold',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'normal',
      borders: true,
      borderColor: '#d1d5db',
      background: '#ffffff',
    },
    icons: {
      enabled: true,
      style: 'outlined',
    },
  },
  modern: {
    typography: {
      fontFamily: 'Poppins',
      headingFont: 'Poppins',
      bodyFont: 'Poppins',
    },
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#14b8a6',
      text: '#374151',
      background: '#ffffff',
    },
    headingStyle: {
      size: 'large',
      weight: 'semibold',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'spacious',
      borders: false,
      borderColor: '#e5e7eb',
      background: '#ffffff',
    },
    icons: {
      enabled: true,
      style: 'filled',
    },
  },
  minimal: {
    typography: {
      fontFamily: 'Arial',
      headingFont: 'Arial',
      bodyFont: 'Arial',
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      text: '#000000',
      background: '#ffffff',
    },
    headingStyle: {
      size: 'small',
      weight: 'normal',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'compact',
      borders: false,
      borderColor: '#000000',
      background: '#ffffff',
    },
    icons: {
      enabled: false,
      style: 'minimal',
    },
  },
  creative: {
    typography: {
      fontFamily: 'Playfair Display',
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
    },
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f59e0b',
      text: '#1f2937',
      background: '#ffffff',
    },
    headingStyle: {
      size: 'large',
      weight: 'bold',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'spacious',
      borders: true,
      borderColor: '#fca5a5',
      background: '#ffffff',
    },
    icons: {
      enabled: true,
      style: 'filled',
    },
  },
  tech: {
    typography: {
      fontFamily: 'JetBrains Mono',
      headingFont: 'JetBrains Mono',
      bodyFont: 'JetBrains Mono',
    },
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#a855f7',
      text: '#d1d5db',
      background: '#111827',
    },
    headingStyle: {
      size: 'medium',
      weight: 'semibold',
      transform: 'none',
    },
    sectionStyle: {
      spacing: 'normal',
      borders: true,
      borderColor: '#374151',
      background: '#1f2937',
    },
    icons: {
      enabled: true,
      style: 'outlined',
    },
  },
};

// Font family options
export const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Lato', value: 'Lato' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Source Sans Pro', value: 'Source Sans Pro' },
];

// Heading size options
export const headingSizeOptions = [
  { label: 'Small', value: 'small' as const },
  { label: 'Medium', value: 'medium' as const },
  { label: 'Large', value: 'large' as const },
];

// Heading weight options
export const headingWeightOptions = [
  { label: 'Normal', value: 'normal' as const },
  { label: 'Semibold', value: 'semibold' as const },
  { label: 'Bold', value: 'bold' as const },
];

// Text transform options
export const textTransformOptions = [
  { label: 'None', value: 'none' as const },
  { label: 'Uppercase', value: 'uppercase' as const },
];

// Spacing options
export const spacingOptions = [
  { label: 'Compact', value: 'compact' as const },
  { label: 'Normal', value: 'normal' as const },
  { label: 'Spacious', value: 'spacious' as const },
];

// Icon style options
export const iconStyleOptions = [
  { label: 'Outlined', value: 'outlined' as const },
  { label: 'Filled', value: 'filled' as const },
  { label: 'Minimal', value: 'minimal' as const },
];

// Preset color palettes
export const colorPalettes = [
  {
    name: 'Purple',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#06b6d4',
  },
  {
    name: 'Blue',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#0ea5e9',
  },
  {
    name: 'Green',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
  },
  {
    name: 'Red',
    primary: '#dc2626',
    secondary: '#ef4444',
    accent: '#f87171',
  },
  {
    name: 'Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#fb923c',
  },
  {
    name: 'Pink',
    primary: '#db2777',
    secondary: '#ec4899',
    accent: '#f472b6',
  },
  {
    name: 'Teal',
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#2dd4bf',
  },
  {
    name: 'Indigo',
    primary: '#4338ca',
    secondary: '#6366f1',
    accent: '#818cf8',
  },
];

// Get theme preset by name
export function getThemePreset(name: string): Theme {
  return themePresets[name] || themePresets.default;
}

// Get all theme preset names
export function getThemePresetNames(): string[] {
  return Object.keys(themePresets);
}

// Apply color palette to theme
export function applyColorPalette(theme: Theme, palette: typeof colorPalettes[0]): Theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
    },
  };
}

// Validate theme
export function validateTheme(theme: Theme): boolean {
  try {
    // Check required properties
    if (!theme.typography || !theme.colors || !theme.headingStyle || !theme.sectionStyle || !theme.icons) {
      return false;
    }
    
    // Check color format (hex)
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(theme.colors.primary) || 
        !hexRegex.test(theme.colors.secondary) || 
        !hexRegex.test(theme.colors.accent)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
