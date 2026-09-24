import type { ThemeConfig } from 'antd';
import { semantic, neutral, fontSize, spacing, radius, fontFamily } from './tokens';
import { presets } from './presets';

export function buildAntdTheme(
  preset: string = 'green',
  mode: 'light' | 'dark' = 'light',
): ThemeConfig {
  const p = presets[preset]?.[mode] ?? presets.green.light;
  const n = neutral[mode];
  const s = semantic[mode];

  return {
    token: {
      colorPrimary: p.primary,
      colorSuccess: s.success,
      colorError: s.danger,
      colorWarning: s.warning,
      colorInfo: s.info,
      borderRadius: radius.control,
      colorBgLayout: n.bodyBg,
      fontFamily,
      fontSize: fontSize.base,
      colorText: n.text,
      colorTextSecondary: n.textSecondary,
      controlHeight: 32,
    },
    components: {
      Table: {
        headerBg: n.tableHeaderBg,
        headerColor: n.text,
        borderColor: n.border,
        rowHoverBg: n.rowHoverBg,
      },
      Button: {
        primaryShadow: 'none',
        defaultShadow: 'none',
      },
      Card: {
        paddingLG: spacing.lg,
      },
      Modal: {
        titleFontSize: fontSize.md,
        headerBg: n.cardBg,
      },
      Menu: {
        darkItemBg: p.siderBg,
        darkItemColor: '#ccc',
        darkItemHoverColor: '#fff',
        darkItemSelectedBg: p.primary,
        darkItemSelectedColor: '#fff',
        darkSubMenuItemBg: p.siderSubBg,
      },
      Layout: {
        siderBg: p.siderBg,
        headerBg: n.cardBg,
        bodyBg: n.bodyBg,
        headerHeight: 50,
        headerPadding: '0 16px',
      },
    },
  };
}
