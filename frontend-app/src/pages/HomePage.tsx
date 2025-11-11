import React from 'react';
import { Card, Button, Empty, Typography, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2}>Architectures</Title>
        <Paragraph type="secondary">
          Create and manage your cloud architectures
        </Paragraph>
      </div>

      <Card>
        <Empty
          image={<AppstoreOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <Space direction="vertical" size="small">
              <Typography.Text strong>No architectures yet</Typography.Text>
              <Typography.Text type="secondary">
                Get started by creating your first architecture
              </Typography.Text>
            </Space>
          }
        >
          <Button type="primary" icon={<PlusOutlined />}>
            Create architecture
          </Button>
        </Empty>
      </Card>
    </Space>
  );
};

export default HomePage;
