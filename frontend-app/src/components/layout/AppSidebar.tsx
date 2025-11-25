import { memo, useMemo, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

// Define menu items outside component to prevent recreation
const MENU_ITEMS = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: '/projects',
    icon: <FolderOutlined />,
    label: 'Projects',
  },
  {
    key: '/templates',
    icon: <FileTextOutlined />,
    label: 'Templates',
  },
  {
    key: '/activity',
    icon: <ClockCircleOutlined />,
    label: 'Activity',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
] as const;

const AppSidebar = memo<AppSidebarProps>(({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      navigate(key);
    },
    [navigate]
  );

  const siderStyle = useMemo(
    () => ({
      overflow: 'auto' as const,
      height: '100vh',
      position: 'sticky' as const,
      top: 0,
      left: 0,
    }),
    []
  );

  const logoStyle = useMemo(
    () => ({
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: collapsed ? '18px' : '20px',
      fontWeight: 'bold' as const,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'font-size 0.2s',
    }),
    [collapsed]
  );

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
      <div style={logoStyle}>
        {collapsed ? 'E' : 'ENXP'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={MENU_ITEMS}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
