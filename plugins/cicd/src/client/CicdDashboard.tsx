import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, message } from 'antd';
import { 
  RocketOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  SyncOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Pipeline {
  id: number;
  name: string;
  repository: string;
  branch: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  lastRun: string;
  duration: number;
  createdAt: string;
}

interface Stats {
  totalPipelines: number;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  byStatus: {
    running: number;
    success: number;
    failed: number;
    pending: number;
  };
}

/**
 * CICD Dashboard Component
 */
export const CicdDashboard: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/plugins/cicd/pipelines');
      const result = await response.json();
      if (result.success) {
        setPipelines(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
      message.error('Failed to load pipelines');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/plugins/cicd/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPipelines(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRunPipeline = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/plugins/cicd/pipelines/${id}/run`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        message.success(`Pipeline triggered! Execution ID: ${result.executionId}`);
        fetchPipelines();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to run pipeline:', error);
      message.error('Failed to trigger pipeline');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      success: { color: 'success', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', icon: <CloseCircleOutlined /> },
      running: { color: 'processing', icon: <SyncOutlined spin /> },
      pending: { color: 'default', icon: <ClockCircleOutlined /> },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Tag icon={config.icon} color={config.color}>{status.toUpperCase()}</Tag>;
  };

  const columns: ColumnsType<Pipeline> = [
    {
      title: 'Pipeline',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Pipeline) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {record.repository} ({record.branch})
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}s`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Pipeline) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunPipeline(record.id)}
            disabled={record.status === 'running'}
          >
            Run
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          <RocketOutlined style={{ marginRight: '8px' }} />
          CI/CD Management
        </h1>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          Manage and monitor your CI/CD pipelines
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Pipelines"
                value={stats.totalPipelines}
                prefix={<RocketOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Executions"
                value={stats.totalExecutions}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={stats.successRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: stats.successRate >= 70 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Duration"
                value={stats.avgDuration}
                suffix="s"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Pipelines Table */}
      <Card title="Pipelines" extra={
        <Button icon={<SyncOutlined />} onClick={() => { fetchPipelines(); fetchStats(); }}>
          Refresh
        </Button>
      }>
        <Table
          columns={columns}
          dataSource={pipelines}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default CicdDashboard;
