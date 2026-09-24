import React from 'react';

interface HalfCircleIconProps {
  status: 'source_only' | 'target_only' | 'both';
  size?: number;
}

const HalfCircleIcon: React.FC<HalfCircleIconProps> = ({ status, size = 14 }) => {
  const half = size / 2;
  const strokeW = 1.5;
  const r = half - strokeW;

  const colors: Record<string, { left: string; right: string }> = {
    source_only: { left: 'var(--db-primary)', right: 'var(--db-border)' },  // orange left + grey right
    target_only: { left: 'var(--db-border)', right: 'var(--db-primary)' },  // grey left + blue right
    both:       { left: 'var(--db-primary)', right: 'var(--db-primary)'},   // green both
  };

  const c = colors[status];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ verticalAlign: 'middle' }}>
      {/* Left half */}
      <path
        d={`M ${half} ${strokeW} A ${r} ${r} 0 0 0 ${half} ${size - strokeW}`}
        fill={c.left}
        stroke={c.left}
        strokeWidth={strokeW}
        strokeLinecap="butt"
      />
      {/* Right half */}
      <path
        d={`M ${half} ${strokeW} A ${r} ${r} 0 0 1 ${half} ${size - strokeW}`}
        fill={c.right}
        stroke={c.right}
        strokeWidth={strokeW}
        strokeLinecap="butt"
      />
      {/* Vertical divider line */}
      <line x1={half} y1={strokeW + 1} x2={half} y2={size - strokeW - 1} stroke="var(--db-border)" strokeWidth={0.0} />
    </svg>
  );
};

export default HalfCircleIcon;
