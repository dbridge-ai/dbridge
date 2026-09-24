export type Edition = 'community' | 'web' | 'desktop';

export interface EditionConfig {
  label: string;
  defaultPreset: string;
  allowed: string[];
}

export const editions: Record<Edition, EditionConfig> = {
  community: {
    label: 'Community',
    defaultPreset: 'green',
    allowed: ['green', 'teal'],
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

export const currentEdition: Edition =
  (window as unknown as { __DBRIDGE_EDITION__?: string }).__DBRIDGE_EDITION__ === 'desktop'
    ? 'desktop'
    : (window as unknown as { __DBRIDGE_EDITION__?: string }).__DBRIDGE_EDITION__ === 'web'
      ? 'web'
      : 'community';
