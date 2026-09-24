import React from 'react';
import { Tag } from 'antd';
import { dbTypeColors } from '../../theme';

export interface DBTypeTagProps {
  /** 数据库类型：mysql / oracle / sqlserver / postgres / sqlite / system */
  dbType: string;
  label?: React.ReactNode;
}

/**
 * 数据库类型标签（5.x：灰底标签 + 彩色圆点，降彩度）。
 * 色值唯一来源 tokens.ts dbTypeColors；品牌绿禁止用作类型色。
 */
const DBTypeTag: React.FC<DBTypeTagProps> = ({ dbType, label }) => {
  const color = dbTypeColors[dbType] ?? dbTypeColors.system;
  return (
    <Tag style={{ background: 'var(--db-card-bg)', borderColor: 'var(--db-border)' }}>
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          marginRight: 6,
          verticalAlign: 'middle',
        }}
      />
      {label ?? dbType}
    </Tag>
  );
};

export default DBTypeTag;
