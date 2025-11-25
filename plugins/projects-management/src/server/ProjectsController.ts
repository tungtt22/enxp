import { Router, Request, Response } from 'express';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '../shared';

/**
 * Projects Controller - handles API requests with optimized lookups
 */
export class ProjectsController {
  private projects: Map<number, Project> = new Map();
  private nextId = 1;
  private listCache: { data: Project[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5000; // 5s cache for list

  constructor() {
    // Initialize with sample data using Map for fast lookup
    const now = new Date().toISOString();
    const project1: Project = {
      id: this.nextId++,
      name: 'ENXP Platform',
      description: 'Extensible Engineering Platform',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const project2: Project = {
      id: this.nextId++,
      name: 'Plugin System',
      description: 'Core plugin infrastructure',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
  }

  /**
   * Get all projects with caching
   */
  getProjects = async (req: Request, res: Response): Promise<void> => {
    const now = Date.now();
    if (!this.listCache || now - this.listCache.timestamp > this.CACHE_TTL) {
      this.listCache = {
        data: Array.from(this.projects.values()),
        timestamp: now
      };
    }
    res.json(this.listCache.data);
  };

  /**
   * Get project by ID with O(1) lookup
   */
  getProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }
    const project = this.projects.get(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  };

  /**
   * Create new project with validation
   */
  createProject = async (req: Request, res: Response): Promise<void> => {
    const data: CreateProjectDTO = req.body;
    if (!data.name || data.name.trim().length === 0) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: this.nextId++,
      name: data.name.trim(),
      description: data.description?.trim(),
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    this.listCache = null; // invalidate cache
    res.status(201).json(project);
  };

  /**
   * Update project with validation
   */
  updateProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }
    const data: UpdateProjectDTO = req.body;
    const project = this.projects.get(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (trimmed.length === 0) {
        res.status(400).json({ error: 'Project name cannot be empty' });
        return;
      }
      project.name = trimmed;
    }
    if (data.description !== undefined) project.description = data.description.trim();
    if (data.status !== undefined) project.status = data.status;
    project.updatedAt = new Date().toISOString();
    this.listCache = null; // invalidate cache
    res.json(project);
  };

  /**
   * Delete project with O(1) removal
   */
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }
    const deleted = this.projects.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    this.listCache = null; // invalidate cache
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
