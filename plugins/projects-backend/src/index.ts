import { BackendPlugin } from '@enxp/backend';
import { Router, Request, Response } from 'express';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  tech: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export class ProjectsBackendPlugin extends BackendPlugin {
  private projects: Project[] = [];
  private nextId = 1;

  constructor() {
    super(
      'projects-backend',
      'Projects Backend API',
      '1.0.0',
      {
        description: 'Backend API for project management'
      }
    );
  }

  async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Projects Backend Plugin');
    
    // Initialize with sample data
    this.projects = [
      {
        id: this.nextId++,
        name: 'E-Commerce Platform',
        description: 'Microservices architecture for online retail',
        status: 'active',
        tech: ['Kubernetes', 'Node.js', 'PostgreSQL'],
        progress: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: this.nextId++,
        name: 'Analytics Dashboard',
        description: 'Real-time data visualization and reporting',
        status: 'planning',
        tech: ['React', 'D3.js', 'WebSocket'],
        progress: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: this.nextId++,
        name: 'Mobile App Backend',
        description: 'Serverless API for mobile applications',
        status: 'completed',
        tech: ['AWS Lambda', 'DynamoDB', 'API Gateway'],
        progress: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async onActivate(): Promise<void> {
    this.log('info', 'Projects Backend Plugin activated');
  }

  registerRoutes(router: Router): void {
    // GET /api/plugins/projects-backend/projects - Get all projects
    router.get('/projects', (req: Request, res: Response) => {
      this.log('info', 'GET /projects');
      res.json({
        success: true,
        data: this.projects,
        total: this.projects.length
      });
    });

    // GET /api/plugins/projects-backend/projects/:id - Get project by ID
    router.get('/projects/:id', (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const project = this.projects.find(p => p.id === id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      
      this.log('info', `GET /projects/${id}`);
      res.json({
        success: true,
        data: project
      });
    });

    // POST /api/plugins/projects-backend/projects - Create new project
    router.post('/projects', (req: Request, res: Response) => {
      const { name, description, status, tech, progress } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          error: 'Name and description are required'
        });
      }

      const newProject: Project = {
        id: this.nextId++,
        name,
        description,
        status: status || 'planning',
        tech: tech || [],
        progress: progress || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.projects.push(newProject);
      this.log('info', `POST /projects - Created project: ${newProject.name}`);
      
      res.status(201).json({
        success: true,
        data: newProject,
        message: 'Project created successfully'
      });
    });

    // PUT /api/plugins/projects-backend/projects/:id - Update project
    router.put('/projects/:id', (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const projectIndex = this.projects.findIndex(p => p.id === id);
      
      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const { name, description, status, tech, progress } = req.body;
      const updatedProject = {
        ...this.projects[projectIndex],
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(tech && { tech }),
        ...(progress !== undefined && { progress }),
        updatedAt: new Date().toISOString()
      };

      this.projects[projectIndex] = updatedProject;
      this.log('info', `PUT /projects/${id} - Updated project: ${updatedProject.name}`);
      
      res.json({
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      });
    });

    // DELETE /api/plugins/projects-backend/projects/:id - Delete project
    router.delete('/projects/:id', (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const projectIndex = this.projects.findIndex(p => p.id === id);
      
      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const deletedProject = this.projects[projectIndex];
      this.projects.splice(projectIndex, 1);
      this.log('info', `DELETE /projects/${id} - Deleted project: ${deletedProject.name}`);
      
      res.json({
        success: true,
        message: 'Project deleted successfully',
        data: deletedProject
      });
    });

    // GET /api/plugins/projects-backend/stats - Get project statistics
    router.get('/stats', (req: Request, res: Response) => {
      const stats = {
        total: this.projects.length,
        active: this.projects.filter(p => p.status === 'active').length,
        planning: this.projects.filter(p => p.status === 'planning').length,
        completed: this.projects.filter(p => p.status === 'completed').length,
        averageProgress: this.projects.length > 0 
          ? Math.round(this.projects.reduce((sum, p) => sum + p.progress, 0) / this.projects.length)
          : 0
      };
      
      this.log('info', 'GET /stats');
      res.json({
        success: true,
        data: stats
      });
    });
  }
}

export default new ProjectsBackendPlugin();
