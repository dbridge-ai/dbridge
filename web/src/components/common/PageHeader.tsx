import React from 'react';
import { Typography, Space } from 'antd';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
}

/** 页面标题区（5.2）：Title 一律走本组件，禁止 h2/h3/内联 fontSize */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
      {extra && <Space>{extra}</Space>}
    </div>
    {subtitle && (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Typography.Text>
    )}
  </div>
);

export default PageHeader;
