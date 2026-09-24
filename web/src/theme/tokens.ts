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

// 对比度实测修正（WCAG AA，见 ui-unification-design.md 附录 C / v2.5 修订 F2）：
// - light textTertiary：#999999 在白卡仅 2.85:1 → #6E6E6E
// - dark textTertiary：#6E757D 在卡片上仅 3.86:1（#7C848C 也不够）→ #8A8F96（对 body/卡片/浮层均 ≥4.5:1）
// - dark disabled：#5A6167 仅 2.86:1 → #666C72
export const neutral = {
  light: {
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#6E6E6E',
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
    textTertiary: '#8A8F96',
    bodyBg: '#14171A',
    cardBg: '#1C2025',
    border: '#2E343B',
    borderLight: '#262C33',
    tableHeaderBg: '#22272E',
    rowHoverBg: '#262C33',
    disabled: '#666C72',
    mask: 'rgba(0,0,0,.65)',
  },
};

export const fontSize = { xs: 12, sm: 13, base: 14, md: 16, lg: 18, xl: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

// 圆角随端变（产品决策 D5）：不随 accent 切换，由 edition 决定
export const radiusByEdition: Record<string, { control: number; container: number }> = {
  web:       { control: 4, container: 8 },
  community: { control: 4, container: 8 },
  desktop:   { control: 6, container: 8 },
};
// 兼容别名（= web/community）
export const radius = radiusByEdition.web;

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
