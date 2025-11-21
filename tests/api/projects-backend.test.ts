import request from 'supertest';
import { TestServer, expectSuccess, expectData, expectError } from '../setup';

describe('Projects Backend API', () => {
  let testServer: TestServer;
  let app: any;

  beforeAll(async () => {
    testServer = new TestServer();
    await testServer.setup();
    app = testServer.getApp();
  });

  afterAll(async () => {
    await testServer.teardown();
  });

  describe('GET /api/plugins/projects/projects', () => {
    it('should return list of projects', async () => {
      const response = await request(app)
        .get('/api/plugins/projects/projects')
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Verify project structure
      const project = data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('status');
      expect(project).toHaveProperty('progress');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/plugins/projects/projects?status=active')
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      data.forEach((project: any) => {
        expect(project.status).toBe('active');
      });
    });
  });

  describe('POST /api/plugins/projects/projects', () => {
    it('should create new project', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'This is a test project',
        status: 'planning',
        progress: 0,
      };

      const response = await request(app)
        .post('/api/plugins/projects/projects')
        .send(newProject)
        .expect(201);

      expectSuccess(response);
      const data = expectData(response);
      expect(data).toMatchObject(newProject);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('createdAt');
    });

    it('should reject invalid project data', async () => {
      const invalidProject = {
        name: '', // Empty name
        description: 'Invalid project',
      };

      const response = await request(app)
        .post('/api/plugins/projects/projects')
        .send(invalidProject)
        .expect(400);

      expectError(response);
    });

    it('should set default values', async () => {
      const minimalProject = {
        name: 'Minimal Project',
        description: 'Project with minimal data',
      };

      const response = await request(app)
        .post('/api/plugins/projects/projects')
        .send(minimalProject)
        .expect(201);

      expectSuccess(response);
      const data = expectData(response);
      expect(data.status).toBe('planning');
      expect(data.progress).toBe(0);
    });
  });

  describe('GET /api/plugins/projects/projects/:id', () => {
    it('should return single project', async () => {
      const response = await request(app)
        .get('/api/plugins/projects/projects/1')
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      expect(data.id).toBe(1);
      expect(data).toHaveProperty('name');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/plugins/projects/projects/999999')
        .expect(404);

      expectError(response);
    });
  });

  describe('PUT /api/plugins/projects/projects/:id', () => {
    it('should update existing project', async () => {
      const updates = {
        name: 'Updated Project Name',
        status: 'active',
        progress: 50,
      };

      const response = await request(app)
        .put('/api/plugins/projects/projects/1')
        .send(updates)
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      expect(data).toMatchObject(updates);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/plugins/projects/projects/999999')
        .send({ name: 'Updated' })
        .expect(404);

      expectError(response);
    });

    it('should validate progress range', async () => {
      const response = await request(app)
        .put('/api/plugins/projects/projects/1')
        .send({ progress: 150 }) // Invalid: > 100
        .expect(400);

      expectError(response);
    });
  });

  describe('DELETE /api/plugins/projects/projects/:id', () => {
    it('should delete existing project', async () => {
      // First create a project to delete
      const createResponse = await request(app)
        .post('/api/plugins/projects/projects')
        .send({
          name: 'Project to Delete',
          description: 'Will be deleted',
        });

      const projectId = createResponse.body.data.id;

      // Delete it
      const deleteResponse = await request(app)
        .delete(`/api/plugins/projects/projects/${projectId}`)
        .expect(200);

      expectSuccess(deleteResponse);

      // Verify it's gone
      await request(app)
        .get(`/api/plugins/projects/projects/${projectId}`)
        .expect(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/plugins/projects/projects/999999')
        .expect(404);

      expectError(response);
    });
  });

  describe('GET /api/plugins/projects/stats', () => {
    it('should return project statistics', async () => {
      const response = await request(app)
        .get('/api/plugins/projects/stats')
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('byStatus');
      expect(data).toHaveProperty('averageProgress');
      
      expect(typeof data.total).toBe('number');
      expect(typeof data.averageProgress).toBe('number');
      expect(data.byStatus).toHaveProperty('planning');
      expect(data.byStatus).toHaveProperty('active');
      expect(data.byStatus).toHaveProperty('completed');
    });
  });
});
