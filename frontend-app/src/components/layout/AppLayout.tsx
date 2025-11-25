import { useState, useMemo, useCallback } from 'react';
import { Layout, theme } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const contentStyle = useMemo(
    () => ({
      margin: '24px 16px',
      padding: 24,
      minHeight: 280,
      background: colorBgContainer,
      borderRadius: borderRadiusLG,
    }),
    [colorBgContainer, borderRadiusLG]
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} onToggle={handleToggle} />
        <Content style={contentStyle}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
