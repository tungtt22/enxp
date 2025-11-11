import React from 'react';
import { Layout, Button, Input, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
        />
      </div>

      <Space size="middle">
        <Button type="text" icon={<BellOutlined />} />
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
          T
        </Avatar>
      </Space>
    </Header>
  );
};

export default AppHeader;
