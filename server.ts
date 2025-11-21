import { BackendServer } from './packages/backend/src';
import path from 'path';

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
    // Load Projects Management Plugin
    const projectsManagementPath = path.join(__dirname, 'plugins/projects-management');
    await server.loadPlugin(projectsManagementPath);
    await server.activatePlugin('projects-management');
    console.log('✅ Projects Management Plugin loaded');

    // Load Activity Management Plugin
    const activityManagementPath = path.join(__dirname, 'plugins/activity-management');
    await server.loadPlugin(activityManagementPath);
    await server.activatePlugin('activity-management');
    console.log('✅ Activity Management Plugin loaded');

    // Load Templates Management Plugin
    const templatesManagementPath = path.join(__dirname, 'plugins/templates-management');
    await server.loadPlugin(templatesManagementPath);
    await server.activatePlugin('templates-management');
    console.log('✅ Templates Management Plugin loaded');

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
