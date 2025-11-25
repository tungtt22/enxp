import { BackendServer } from './packages/backend/src';
import path from 'path';
import fs from 'fs/promises';

async function main() {
  console.log('🚀 Starting ENXP Platform...\n');

  // Create server instance
  const server = new BackendServer(3000, {
    name: 'ENXP Platform',
    version: '1.0.0',
  });

  // Load backend plugins
  console.log('📦 Loading backend plugins...\n');
  
  try {
    // Auto-scan and load all plugins from plugins/ folder
    const pluginsDir = path.join(__dirname, 'plugins');
    const pluginFolders = await fs.readdir(pluginsDir);
    
    for (const folder of pluginFolders) {
      const pluginPath = path.join(pluginsDir, folder);
      const stat = await fs.stat(pluginPath);
      
      if (!stat.isDirectory()) continue;
      
      // Check if plugin.json exists
      const manifestPath = path.join(pluginPath, 'plugin.json');
      try {
        await fs.access(manifestPath);
        
        // Load and activate plugin
        await server.loadPlugin(pluginPath);
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
        await server.activatePlugin(manifest.id);
        console.log(`✅ ${manifest.name} Plugin loaded`);
      } catch (err) {
        console.warn(`⚠️  Skipping ${folder}: No valid plugin.json`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to load plugins:', error);
  }

  // Start server
  await server.start();

  console.log('\n✅ Server started successfully!');
  console.log('\n📡 Available Endpoints:');
  console.log('   - GET  http://localhost:3000/health');
  console.log('\n🔌 Plugin API Endpoints:');
  console.log('\n   Projects Management (projects-management):');
  console.log('     - GET    http://localhost:3000/api/plugins/projects/projects');
  console.log('     - POST   http://localhost:3000/api/plugins/projects/projects');
  console.log('     - GET    http://localhost:3000/api/plugins/projects/projects/:id');
  console.log('     - PUT    http://localhost:3000/api/plugins/projects/projects/:id');
  console.log('     - DELETE http://localhost:3000/api/plugins/projects/projects/:id');
  console.log('\n   Activity Management (activity-management):');
  console.log('     - GET    http://localhost:3000/api/plugins/activity-management/activities');
  console.log('     - POST   http://localhost:3000/api/plugins/activity-management/activities');
  console.log('     - GET    http://localhost:3000/api/plugins/activity-management/activities/:id');
  console.log('     - PUT    http://localhost:3000/api/plugins/activity-management/activities/:id');
  console.log('     - DELETE http://localhost:3000/api/plugins/activity-management/activities/:id');
  console.log('     - GET    http://localhost:3000/api/plugins/activity-management/stats');
  console.log('\n   Templates Management (templates-management):');
  console.log('     - GET    http://localhost:3000/api/plugins/templates-management/templates');
  console.log('     - POST   http://localhost:3000/api/plugins/templates-management/templates');
  console.log('     - GET    http://localhost:3000/api/plugins/templates-management/templates/:id');
  console.log('     - PUT    http://localhost:3000/api/plugins/templates-management/templates/:id');
  console.log('     - DELETE http://localhost:3000/api/plugins/templates-management/templates/:id');
  console.log('     - POST   http://localhost:3000/api/plugins/templates-management/templates/:id/use');
  console.log('     - GET    http://localhost:3000/api/plugins/templates-management/categories');
  console.log('     - GET    http://localhost:3000/api/plugins/templates-management/stats');
  console.log('\n🛑 Press Ctrl+C to stop the server\n');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
