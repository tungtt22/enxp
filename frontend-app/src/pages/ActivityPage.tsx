import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ActivityPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Activity</Title>
      <Card>
        <Empty
          image={<ClockCircleOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="No recent activity"
        />
      </Card>
    </div>
  );
};

export default ActivityPage;
