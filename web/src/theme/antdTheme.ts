import type { ThemeConfig } from 'antd';
import {
  semantic, neutral, fontSize, spacing, fontFamily,
  radiusByEdition, modalWidth,
} from './tokens';
import { presets } from './presets';
import { editions, currentEdition } from './edition';

// P0.5 / 5.9：Modal 默认值只含语言无关项（okText/cancelText 由 ConfigProvider locale + t() 提供）
const modalDefaults = {
  titleFontSize: fontSize.md,
  headerBg: neutral.light.cardBg, // 由下方 token.colorBgContainer 覆盖为对应模式的值
  maskClosable: false,
  destroyOnHidden: true,
  width: modalWidth.md,
};

export function buildAntdTheme(
  preset?: string,
  mode: 'light' | 'dark' = 'light',
): ThemeConfig {
  // 未显式指定预设时取当前端的默认预设（desktop = teal）
  const presetName = preset ?? editions[currentEdition].defaultPreset;
  const p = presets[presetName]?.[mode] ?? presets.green.light;
  const n = neutral[mode];
  const s = semantic[mode];

  return {
    token: {
      colorPrimary: p.primary,
      // F1：链接/文字使用专用档，白底 ≥4.5:1；按钮填充仍用品牌亮色
      colorLink: p.text,
      colorLinkHover: p.hover,
      colorSuccess: s.success,
      colorError: s.danger,
      colorWarning: s.warning,
      colorInfo: s.info,
      // 圆角随端变（D5）
      borderRadius: radiusByEdition[currentEdition].control,
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
        ...modalDefaults,
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
