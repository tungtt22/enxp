import React from 'react';
import { Card, Typography, Form, Input, Button, Switch, Space } from 'antd';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Settings</Title>
      <Card>
        <Form layout="vertical">
          <Form.Item label="Display Name" name="displayName">
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="Enter your email" />
          </Form.Item>
          <Form.Item label="Notifications" name="notifications" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">Save Changes</Button>
              <Button>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
