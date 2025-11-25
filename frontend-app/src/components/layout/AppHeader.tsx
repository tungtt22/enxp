import { memo, useMemo } from 'react';
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

const AppHeader = memo<AppHeaderProps>(({ collapsed, onToggle }) => {
  const headerStyle = useMemo(
    () => ({
      padding: '0 24px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0',
    }),
    []
  );

  const toggleButtonStyle = useMemo(
    () => ({
      fontSize: '16px',
      width: 64,
      height: 64,
    }),
    []
  );

  const searchContainerStyle = useMemo(
    () => ({ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px', 
      flex: 1 
    }),
    []
  );
  return (
    <Header style={headerStyle}>
      <div style={searchContainerStyle}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={toggleButtonStyle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          aria-label="Search"
        />
      </div>

      <Space size="middle">
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          aria-label="Notifications"
        />
        <Avatar 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff' }}
        >
          T
        </Avatar>
      </Space>
    </Header>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;
