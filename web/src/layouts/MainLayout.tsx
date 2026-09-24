import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Space,
  Avatar,
  Dropdown,
  Popover,
  message,
  Modal,
  Form,
  Input,
} from 'antd';
const { Sider, Header, Content } = Layout;
import {
  DashboardOutlined,
  LinkOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  KeyOutlined,
  TranslationOutlined,
  FileOutlined,
  ExportOutlined,
  SwapOutlined,
  SkinOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTheme } from '../theme/ThemeContext';
import { authAPI } from '../api';
import logoSvg from '../assets/logo.svg';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pwdForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { mode, preset, setMode, setPreset, allowedPresets } = useTheme();

  const presetColors: Record<string, string> = {
    green: '#20A53A', teal: '#0F8B8D', graphite: '#3B82F6',
    indigo: '#4F46E5', amber: '#C77800',
  };

  const themePopoverContent = (
    <div style={{ width: 200, padding: '4px 0' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('theme.appearance')}</div>
      <Space style={{ marginBottom: 12 }}>
        <Button
          type={mode === 'light' ? 'primary' : 'default'}
          size="small"
          onClick={() => setMode('light')}
        >
          {t('theme.light')}
        </Button>
        <Button
          type={mode === 'dark' ? 'primary' : 'default'}
          size="small"
          onClick={() => setMode('dark')}
        >
          {t('theme.dark')}
        </Button>
      </Space>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('theme.preset')}</div>
      <Space size={8} wrap>
        {allowedPresets.map((p) => (
          <div
            key={p}
            onClick={() => setPreset(p)}
            title={t(`theme.${p}`)}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: presetColors[p] || '#999',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: preset === p ? '2px solid var(--db-text-primary)' : '2px solid transparent',
              transition: 'border-color 0.2s',
            }}
          >
            {preset === p && <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />}
          </div>
        ))}
      </Space>
    </div>
  );

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const menuItems = useMemo(() => [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { type: 'divider' as const },
    {
      key: 'connect', icon: <LinkOutlined />, label: t('nav.dataConnect'),
      children: [
        { key: '/datasources', label: t('nav.datasourceManage') },
      ],
    },
    {
      key: 'data-ops', icon: <SettingOutlined />, label: t('nav.dataOps'),
      children: [
        { key: '/query', label: t('nav.query') },
        { key: '/scripts', label: t('nav.scripts') },
        { key: '/compare', label: t('nav.compare') },
      ],
    },
    { type: 'divider' as const },
    {
      key: 'migrate', icon: <SwapOutlined />, label: t('nav.migrate'),
      children: [
        { key: '/files', icon: <FileOutlined />, label: t('nav.files', '文件管理') },
        { key: '/export-tasks', icon: <ExportOutlined />, label: t('nav.exportTasks', '导出导入') },
      ],
    },
    { type: 'divider' as const },
    {
      key: 'system', icon: <SettingOutlined />, label: t('nav.systemManage'),
      children: [
        { key: '/audit', label: t('nav.auditLogs') },
        { key: '/settings/storage', label: t('nav.storageManagement', '存储管理') },
        { key: '/settings', label: t('nav.settings') },
      ],
    },
  ], [t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success(t('common.logoutSuccess'));
    navigate('/login');
  };

  const handleChangePassword = async () => {
    const values = await pwdForm.validateFields();
    if (values.new_password !== values.confirm_password) {
      message.error(t('common.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success(t('common.passwordChangeSuccess'));
      setPwdModalOpen(false);
      pwdForm.resetFields();
      handleLogout();
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const userMenuItems = [
    ...(!user.auth_provider ? [{
      key: 'change-password',
      icon: <KeyOutlined />,
      label: t('common.changePassword'),
      onClick: () => { pwdForm.resetFields(); setPwdModalOpen(true); },
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', alignItems: 'stretch' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={60}
        style={{
          background: 'var(--db-sider-bg)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          height: 'auto',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#fff',
            fontWeight: 'bold',
            fontSize: collapsed ? 0 : 18,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            letterSpacing: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <img src={logoSvg} alt="logo" style={{ height: 32, width: 32, flexShrink: 0 }} />
          {!collapsed && <span>DBridge</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => { if (key.startsWith('/')) navigate(key); }}
          style={{ background: 'var(--db-sider-bg)', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            height: 50,
            lineHeight: '50px',
            padding: '0 16px',
            background: 'var(--db-card-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--db-border)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Space>
            <Popover content={themePopoverContent} trigger="click" placement="bottomRight">
              <Button size="small" icon={<SkinOutlined />} />
            </Popover>
            <Button
              size="small"
              icon={<TranslationOutlined />}
              onClick={() => i18n.changeLanguage(i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN')}
            >
              {i18n.language === 'zh-CN' ? 'EN' : '中文'}
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={30}
                src={user.avatar_url || undefined}
                icon={<UserOutlined />}
                style={{ background: 'var(--db-primary)' }}
              >
                {user.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <span style={{ color: 'var(--db-text-primary)' }}>{user.username || t('common.user')}</span>
            </Space>
          </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 20,
            background: 'var(--db-card-bg)',
            borderRadius: 4,
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title={t('common.changePassword')}
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        onOk={handleChangePassword}
        confirmLoading={submitting}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="old_password"
            label={t('common.oldPassword')}
            rules={[{ required: true, message: t('common.requireOldPassword') }]}
          >
            <Input.Password placeholder={t('common.oldPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="new_password"
            label={t('common.newPassword')}
            rules={[
              { required: true, message: t('common.requireNewPassword') },
              { min: 6, message: t('common.passwordMinLen') },
            ]}
          >
            <Input.Password placeholder={t('common.newPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label={t('common.confirmPassword')}
            rules={[{ required: true, message: t('common.requireConfirmPassword') }]}
          >
            <Input.Password placeholder={t('common.confirmPasswordPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
