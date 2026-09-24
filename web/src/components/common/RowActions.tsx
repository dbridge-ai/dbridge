import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

export interface RowAction {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** hidden: 无权限等场景下完全不渲染；仅“置灰”用 disabled（5.4） */
  hidden?: boolean;
}

export interface RowActionsProps {
  actions: RowAction[];
  /** 直接展示的操作数上限，超出收进「···」（默认 3） */
  maxVisible?: number;
}

/** 行内操作（5.4）：Button type="link" + 固定顺序 + 超量收进 Dropdown */
const RowActions: React.FC<RowActionsProps> = ({ actions, maxVisible = 3 }) => {
  const visible = actions.filter((a) => !a.hidden);
  const primary = visible.slice(0, maxVisible);
  const overflow = visible.slice(maxVisible);

  const overflowItems: MenuProps['items'] = overflow.map((a) => ({
    key: a.key,
    icon: a.icon,
    label: a.label,
    danger: a.danger,
    disabled: a.disabled,
    onClick: a.onClick,
  }));

  return (
    <Space size={0}>
      {primary.map((a) => (
        <Button
          key={a.key}
          type="link"
          size="small"
          icon={a.icon}
          danger={a.danger}
          disabled={a.disabled}
          onClick={a.onClick}
          style={{ paddingInline: 6 }}
        >
          {a.label}
        </Button>
      ))}
      {overflow.length > 0 && (
        <Dropdown menu={{ items: overflowItems }} trigger={['click']}>
          <Button type="link" size="small" icon={<MoreOutlined />} aria-label="more" />
        </Dropdown>
      )}
    </Space>
  );
};

export default RowActions;
