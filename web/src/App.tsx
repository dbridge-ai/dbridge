import React, { useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { buildAntdTheme } from './theme';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataSources from './pages/DataSources';
import SQLEditor from './pages/SQLEditor';
import Compare from './pages/Compare';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Files from './pages/Files';
import StorageManagement from './pages/StorageManagement';
import ExportTasks from './pages/ExportTasks';
import ScriptManagement from './pages/ScriptManagement';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const ThemeAwareApp: React.FC = () => {
  const { i18n } = useTranslation();
  const { mode, preset } = useTheme();
  const antLocale = useMemo(() => i18n.language === 'en-US' ? enUS : zhCN, [i18n.language]);
  const theme = useMemo(() => buildAntdTheme(preset, mode), [preset, mode]);
  return (
    <ConfigProvider
      locale={antLocale}
      theme={theme}
    >
      <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="datasources" element={<DataSources />} />
            <Route path="query" element={<SQLEditor />} />
            <Route path="scripts" element={<ScriptManagement />} />
            <Route path="compare" element={<Compare />} />
            <Route path="files" element={<Files />} />
            <Route path="settings/storage" element={<StorageManagement />} />
            <Route path="export-tasks" element={<ExportTasks />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemeAwareApp />
    </ThemeProvider>
  );
};

export default App;
