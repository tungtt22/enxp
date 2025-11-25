import { memo, useMemo, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePluginContext } from '@enxp/frontend';

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
    order: 0,
  },
  {
    key: '/projects',
    icon: <FolderOutlined />,
    label: 'Projects',
    order: 10,
  },
  {
    key: '/templates',
    icon: <FileTextOutlined />,
    label: 'Templates',
    order: 20,
  },
  {
    key: '/activity',
    icon: <ClockCircleOutlined />,
    label: 'Activity',
    order: 30,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    order: 100,
  },
] as const;

const AppSidebar = memo<AppSidebarProps>(({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pluginManager } = usePluginContext();

  const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      navigate(key);
    },
    [navigate]
  );

  // Get plugin menu items from manifests
  const pluginMenuItems = useMemo(() => {
    const items: Array<{ key: string; icon: any; label: string; order: number }> = [];
    const plugins = pluginManager.getPlugins();
    
    plugins.forEach(plugin => {
      const manifest = (plugin as any).getManifest?.();
      if (manifest?.contributes?.menus) {
        manifest.contributes.menus.forEach((menu: any) => {
          items.push({
            key: menu.path,
            icon: <RocketOutlined />,
            label: menu.label,
            order: menu.order || 50,
          });
        });
      }
    });
    
    return items;
  }, [pluginManager]);

  // Combine static and plugin menu items and sort by order
  const allMenuItems = useMemo(() => {
    const combined = [
      ...(MENU_ITEMS as any),
      ...pluginMenuItems,
    ];
    return combined.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [pluginMenuItems]);

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
        items={allMenuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
