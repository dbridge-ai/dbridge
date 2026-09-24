export type Mode = 'light' | 'dark';

export interface AccentSet {
  primary: string;
  hover: string;
  active: string;
  bg: string;
  border: string;
  siderBg: string;
  siderSubBg: string;
}

export const presets: Record<string, Record<Mode, AccentSet>> = {
  green: {
    light: {
      primary: '#20A53A',
      hover: '#23B640',
      active: '#1B8C31',
      bg: '#F6FFED',
      border: '#B7EB8F',
      siderBg: '#3A3F4A',
      siderSubBg: '#33383F',
    },
    dark: {
      primary: '#49C963',
      hover: '#63D97A',
      active: '#3AA653',
      bg: '#16281A',
      border: '#2C5233',
      siderBg: '#2A2E35',
      siderSubBg: '#24282E',
    },
  },
  teal: {
    light: {
      primary: '#0F8B8D',
      hover: '#12A0A2',
      active: '#0B6F71',
      bg: '#E6F6F6',
      border: '#9ED9DA',
      siderBg: '#22272E',
      siderSubBg: '#1B2027',
    },
    dark: {
      primary: '#2FB0B2',
      hover: '#4CC7C9',
      active: '#1F9395',
      bg: '#102628',
      border: '#2A5153',
      siderBg: '#191D23',
      siderSubBg: '#14181D',
    },
  },
};
