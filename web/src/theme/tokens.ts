// 常量层 —— 任何预设与明暗模式都不得覆盖

export const semantic = {
  light: { danger: '#E74C3C', warning: '#F0AD4E', success: '#20A53A', info: '#1677FF' },
  dark:  { danger: '#FF6B5E', warning: '#FFC53D', success: '#49C963', info: '#4C8DF6' },
};

export const semanticSurface = {
  light: {
    info:    { bg: '#E6F0FF', border: '#91B8FF', text: '#0958D9' },
    warning: { bg: '#FFFBE6', border: '#FFE58F', text: '#AD6800' },
    success: { bg: '#F6FFED', border: '#B7EB8F', text: '#237804' },
    danger:  { bg: '#FFF2F0', border: '#FFCCC7', text: '#CF1322' },
  },
  dark: {
    info:    { bg: '#111D33', border: '#1E3A5F', text: '#4C8DF6' },
    warning: { bg: '#2A2116', border: '#5C4118', text: '#FFC53D' },
    success: { bg: '#12261A', border: '#1F4D2A', text: '#49C963' },
    danger:  { bg: '#2A1514', border: '#5C2018', text: '#FF6B5E' },
  },
};

export const terminal = { bg: '#1E1E1E', fg: '#D4D4D4' };

export const neutral = {
  light: {
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    bodyBg: '#F0F2F5',
    cardBg: '#FFFFFF',
    border: '#E8E8E8',
    borderLight: '#F0F0F0',
    tableHeaderBg: '#FAFAFA',
    rowHoverBg: '#F5F5F5',
    disabled: '#BFBFBF',
    mask: 'rgba(0,0,0,.45)',
  },
  dark: {
    text: '#E6E8EB',
    textSecondary: '#A5ABB3',
    textTertiary: '#6E757D',
    bodyBg: '#14171A',
    cardBg: '#1C2025',
    border: '#2E343B',
    borderLight: '#262C33',
    tableHeaderBg: '#22272E',
    rowHoverBg: '#262C33',
    disabled: '#5A6167',
    mask: 'rgba(0,0,0,.65)',
  },
};

export const fontSize = { xs: 12, sm: 13, base: 14, md: 16, lg: 18, xl: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { control: 4, container: 8 };
export const modalWidth = { xs: 400, sm: 480, md: 600, lg: 720, xl: 900 };
export const drawerWidth = { detail: 720, wide: 1000 };
export const fontFamily =
  "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const monoFontFamily =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const dbTypeColors: Record<string, string> = {
  mysql: '#4C8DF6',
  oracle: '#E8833A',
  sqlserver: '#8B6FE0',
  postgres: '#2FA8A0',
  sqlite: '#D9A521',
  system: '#9AA0A6',
};

export const metricBarColors = [
  'var(--db-primary)',
  '#4C8DF6',
  '#8B6FE0',
  '#D9A521',
];
