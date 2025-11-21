import request from 'supertest';
import { BackendServer } from '../packages/backend/src';
import path from 'path';

export class TestServer {
  private server!: BackendServer;
  private app!: any;

  async setup(): Promise<void> {
    // Create server instance
    this.server = new BackendServer(3001, {
      name: 'ENXP Test Server',
      version: '1.0.0',
    });

    // Load plugins
    const projectsBackendPath = path.join(__dirname, '../plugins/projects-backend/dist/index.js');
    await this.server.loadPlugin(projectsBackendPath);
    await this.server.activatePlugin('projects-backend');

    const activityBackendPath = path.join(__dirname, '../plugins/activity-backend/dist/index.js');
    await this.server.loadPlugin(activityBackendPath);
    await this.server.activatePlugin('activity-backend');

    const templatesBackendPath = path.join(__dirname, '../plugins/templates-backend/dist/index.js');
    await this.server.loadPlugin(templatesBackendPath);
    await this.server.activatePlugin('templates-backend');

    this.app = this.server.getApp();
  }

  getApp(): any {
    return this.app;
  }

  async teardown(): Promise<void> {
    await this.server.shutdown();
  }
}

export const expectSuccess = (response: request.Response) => {
  expect(response.body).toHaveProperty('success', true);
};

export const expectError = (response: request.Response) => {
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');
};

export const expectData = (response: request.Response) => {
  expect(response.body).toHaveProperty('data');
  return response.body.data;
};
