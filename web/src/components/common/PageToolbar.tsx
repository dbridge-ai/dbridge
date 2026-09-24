import React from 'react';
import { Space } from 'antd';

export interface PageToolbarProps {
  /** 左侧：筛选 / 搜索 */
  filters?: React.ReactNode;
  /** 右侧：新建 / 导入导出等页面级操作 */
  actions?: React.ReactNode;
}

/** 页面级操作区（5.8）：筛选居左、操作居右，统一间距 */
const PageToolbar: React.FC<PageToolbarProps> = ({ filters, actions }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    }}
  >
    <Space wrap>{filters}</Space>
    <Space wrap>{actions}</Space>
  </div>
);

export default PageToolbar;
