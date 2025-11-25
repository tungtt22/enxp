import React from 'react';
import { Card, Typography } from 'antd';
import { DynamicPluginLoader } from '../components/DynamicPluginLoader';

const { Title, Paragraph } = Typography;

/**
 * Plugins Page - Shows loaded remote plugins
 */
const PluginsPage: React.FC = () => {
  const handlePluginsLoaded = (plugins: any[]) => {
    console.log('[PluginsPage] Plugins loaded:', plugins);
  };

  return (
    <div className="plugins-page">
      <Card>
        <Title level={2}>🔌 Remote Plugins</Title>
        <Paragraph>
          This page shows all remote plugins loaded via Module Federation.
          Each plugin runs independently on its own port and is dynamically loaded into the host app.
        </Paragraph>
      </Card>

      <div style={{ marginTop: '24px' }}>
        <DynamicPluginLoader onPluginsLoaded={handlePluginsLoaded} />
      </div>
    </div>
  );
};

export default PluginsPage;
