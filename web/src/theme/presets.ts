export type Mode = 'light' | 'dark';

export interface AccentSet {
  /** 交互强调色：按钮填充、选中态（不用于小字号文字 / 链接） */
  primary: string;
  hover: string;
  active: string;
  /** 文字/链接专用档：白底实测 ≥4.5:1（WCAG AA），colorLink 使用（修订 F1） */
  text: string;
  bg: string;
  border: string;
  siderBg: string;
  siderSubBg: string;
}

// 完整色值见 ui-unification-design.md 附录 C；text 档为强调色最小压暗达标值
// （dark 下 text = primary，已实测达标）
export const presets: Record<string, Record<Mode, AccentSet>> = {
  green: {
    light: {
      primary: '#20A53A', hover: '#23B640', active: '#1B8C31', text: '#1A8730',
      bg: '#F6FFED', border: '#B7EB8F', siderBg: '#3A3F4A', siderSubBg: '#33383F',
    },
    dark: {
      primary: '#49C963', hover: '#63D97A', active: '#3AA653', text: '#49C963',
      bg: '#16281A', border: '#2C5233', siderBg: '#2A2E35', siderSubBg: '#24282E',
    },
  },
  teal: {
    light: {
      primary: '#0F8B8D', hover: '#12A0A2', active: '#0B6F71', text: '#0E8486',
      bg: '#E6F6F6', border: '#9ED9DA', siderBg: '#22272E', siderSubBg: '#1B2027',
    },
    dark: {
      primary: '#2FB0B2', hover: '#4CC7C9', active: '#1F9395', text: '#2FB0B2',
      bg: '#102628', border: '#2A5153', siderBg: '#191D23', siderSubBg: '#14181D',
    },
  },
  indigo: {
    light: {
      primary: '#4F46E5', hover: '#6366F1', active: '#4338CA', text: '#4F46E5',
      bg: '#EEF2FF', border: '#C7D2FE', siderBg: '#0F172A', siderSubBg: '#1E293B',
    },
    dark: {
      primary: '#818CF8', hover: '#A5B4FC', active: '#6366F1', text: '#818CF8',
      bg: '#1B1B3A', border: '#3730A3', siderBg: '#12182B', siderSubBg: '#1A2138',
    },
  },
  graphite: {
    light: {
      primary: '#3B82F6', hover: '#60A5FA', active: '#2563EB', text: '#3472D8',
      bg: '#EFF6FF', border: '#BFDBFE', siderBg: '#1A1D21', siderSubBg: '#24282E',
    },
    dark: {
      primary: '#60A5FA', hover: '#93C5FD', active: '#3B82F6', text: '#60A5FA',
      bg: '#14212F', border: '#1E3A5F', siderBg: '#121517', siderSubBg: '#1A1D21',
    },
  },
  amber: {
    light: {
      primary: '#C77800', hover: '#E18A00', active: '#A66200', text: '#A96600',
      bg: '#FFF7E6', border: '#FFD591', siderBg: '#2B2721', siderSubBg: '#221F1A',
    },
    dark: {
      primary: '#E8A33D', hover: '#F5B85C', active: '#C77800', text: '#E8A33D',
      bg: '#2A2116', border: '#5C4118', siderBg: '#1F1C18', siderSubBg: '#191714',
    },
  },
};
