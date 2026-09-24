export type Edition = 'community' | 'web' | 'desktop';

export interface EditionConfig {
  label: string;
  defaultPreset: string;
  allowed: string[];
}

// 白名单见 ui-unification-design.md 3.8（v2.5 决策 D1/D3）：
// - graphite 与明暗模式免费给 community（留存与口碑）
// - usercenter 不开放其他预设（独立仓库，不在此文件）
export const editions: Record<Edition, EditionConfig> = {
  community: {
    label: 'Community',
    defaultPreset: 'green',
    allowed: ['green', 'teal', 'graphite'],
  },
  web: {
    label: 'Web',
    defaultPreset: 'green',
    allowed: ['green', 'teal', 'indigo', 'graphite', 'amber'],
  },
  desktop: {
    label: 'Desktop',
    defaultPreset: 'teal',
    allowed: ['green', 'teal', 'indigo', 'graphite', 'amber'],
  },
} as const;

// 回退规则：desktop 由打包脚本注入 __DBRIDGE_EDITION__='desktop'；
// community 仓库在自身 index.html 注入 'community'；
// pro 的 Web 部署不注入 → 回退 'web'（此前错误回退到 community，
// 导致 pro Web 以 community 的白名单运行）。
function detectEdition(): Edition {
  const marker = (window as unknown as { __DBRIDGE_EDITION__?: string }).__DBRIDGE_EDITION__;
  if (marker === 'desktop' || marker === 'community' || marker === 'web') {
    return marker;
  }
  return 'web';
}

export const currentEdition: Edition = detectEdition();
