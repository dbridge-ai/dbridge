import React from 'react';
import { Card, Typography } from 'antd';

export interface MetricCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  /** 左侧彩条颜色：metricBarColors 之一（或 --db-* 变量） */
  color?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

/** 仪表盘统计卡（5.x）：左侧 3px 彩条为唯一彩色面积 */
const MetricCard: React.FC<MetricCardProps> = ({ title, value, color = 'var(--db-primary)', icon, extra }) => (
  <Card hoverable style={{ borderLeft: `3px solid ${color}` }} styles={{ body: { padding: '20px 24px' } }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography.Text type="secondary" style={{ color: 'var(--db-text-secondary)' }}>
        {icon} {title}
      </Typography.Text>
      {extra}
    </div>
    <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--db-text-primary)', marginTop: 8 }}>
      {value}
    </div>
  </Card>
);

export default MetricCard;
