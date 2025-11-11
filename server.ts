import { BackendServer } from './packages/backend/src';

async function main() {
  console.log('🚀 Starting ENXP Platform...\n');

  // Create server instance
  const server = new BackendServer(3000, {
    name: 'ENXP Platform',
    version: '1.0.0',
  });

  // Start server
  await server.start();

  console.log('\n✅ Server started successfully!');
  console.log('\n📡 Available Endpoints:');
  console.log('   - GET  http://localhost:3000/health');
  console.log('\n🛑 Press Ctrl+C to stop the server\n');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
