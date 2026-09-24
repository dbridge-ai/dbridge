import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  DatabaseOutlined, SyncOutlined, CodeOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { dashboardAPI } from '../api';

interface Stats {
  data_source_count: number;
  sync_task_count: number;
  query_count: number;
  success_rate: number;
  audit_log_count: number;
  running_syncs: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t: tr } = useTranslation();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.stats();
      setStats(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>{tr('nav.dashboard')}</h2>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card hoverable style={{ borderLeft: '3px solid var(--db-primary)' }} styles={{ body: { padding: '20px 24px' } }}>
              <Statistic title={<span style={{ color: 'var(--db-text-secondary)' }}>{tr('dashboards.dataSources')}</span>}
                value={stats?.data_source_count ?? 0} prefix={<DatabaseOutlined style={{ color: 'var(--db-primary)' }} />}
                valueStyle={{ color: 'var(--db-text-primary)', fontWeight: 600 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ borderLeft: '3px solid var(--db-info)' }} styles={{ body: { padding: '20px 24px' } }}>
              <Statistic title={<span style={{ color: 'var(--db-text-secondary)' }}>{tr('dashboards.syncTasks')}</span>}
                value={stats?.sync_task_count ?? 0} prefix={<SyncOutlined style={{ color: 'var(--db-info)' }} />}
                valueStyle={{ color: 'var(--db-text-primary)', fontWeight: 600 }} />
              {stats && stats.running_syncs > 0 && (
                <div style={{ fontSize: 12, color: 'var(--db-info)', marginTop: 4 }}>{stats.running_syncs} {tr('dashboards.running')}</div>
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ borderLeft: '3px solid #722ed1' }} styles={{ body: { padding: '20px 24px' } }}>
              <Statistic title={<span style={{ color: 'var(--db-text-secondary)' }}>{tr('dashboards.queryCount')}</span>}
                value={stats?.query_count ?? 0} prefix={<CodeOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: 'var(--db-text-primary)', fontWeight: 600 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ borderLeft: '3px solid var(--db-primary)' }} styles={{ body: { padding: '20px 24px' } }}>
              <Statistic title={<span style={{ color: 'var(--db-text-secondary)' }}>{tr('dashboards.successRate')}</span>}
                value={stats?.success_rate ?? 100} precision={1} suffix="%"
                prefix={<CheckCircleOutlined style={{ color: 'var(--db-primary)' }} />}
                valueStyle={{ color: 'var(--db-text-primary)', fontWeight: 600 }} />
            </Card>
          </Col>
        </Row>
      </Spin>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={tr('dashboards.systemInfo')} size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--db-border-light)' }}>
                  <span style={{ color: 'var(--db-text-tertiary)' }}>{tr('dashboards.sysVersion')}:</span>
                  <span style={{ color: 'var(--db-text-primary)' }}>DBridge v1.0.0</span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--db-border-light)' }}>
                  <span style={{ color: 'var(--db-text-tertiary)' }}>{tr('dashboards.runStatus')}:</span>
                  <span style={{ color: 'var(--db-primary)' }}>{tr('dashboards.normal')}</span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--db-border-light)' }}>
                  <span style={{ color: 'var(--db-text-tertiary)' }}>{tr('dashboards.auditLogs')}:</span>
                  <span style={{ color: 'var(--db-text-primary)' }}>{stats?.audit_log_count ?? 0} {tr('common.rows')}</span>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
