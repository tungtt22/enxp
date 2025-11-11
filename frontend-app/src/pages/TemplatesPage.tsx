import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TemplatesPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Templates</Title>
      <Card>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="No templates available"
        />
      </Card>
    </div>
  );
};

export default TemplatesPage;
