import { Router, Request, Response } from 'express';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '../shared';

/**
 * Projects Controller - handles API requests
 */
export class ProjectsController {
  private projects: Project[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with sample data
    this.projects = [
      {
        id: this.nextId++,
        name: 'ENXP Platform',
        description: 'Extensible Engineering Platform',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.nextId++,
        name: 'Plugin System',
        description: 'Core plugin infrastructure',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get all projects
   */
  getProjects = async (req: Request, res: Response): Promise<void> => {
    res.json(this.projects);
  };

  /**
   * Get project by ID
   */
  getProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const project = this.projects.find((p) => p.id === id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  };

  /**
   * Create new project
   */
  createProject = async (req: Request, res: Response): Promise<void> => {
    const data: CreateProjectDTO = req.body;

    const project: Project = {
      id: this.nextId++,
      name: data.name,
      description: data.description,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.push(project);
    res.status(201).json(project);
  };

  /**
   * Update project
   */
  updateProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const data: UpdateProjectDTO = req.body;

    const project = this.projects.find((p) => p.id === id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (data.name !== undefined) project.name = data.name;
    if (data.description !== undefined) project.description = data.description;
    if (data.status !== undefined) project.status = data.status;
    project.updatedAt = new Date().toISOString();

    res.json(project);
  };

  /**
   * Delete project
   */
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const index = this.projects.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    this.projects.splice(index, 1);
    res.status(204).send();
  };

  /**
   * Register routes to Express router
   */
  registerRoutes(router: Router): void {
    router.get('/projects', this.getProjects);
    router.get('/projects/:id', this.getProject);
    router.post('/projects', this.createProject);
    router.put('/projects/:id', this.updateProject);
    router.delete('/projects/:id', this.deleteProject);
  }
}
