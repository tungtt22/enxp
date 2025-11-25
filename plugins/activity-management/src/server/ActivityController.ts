import { Router, Request, Response } from 'express';
import type { ActivityItem, CreateActivityDTO, UpdateActivityDTO, ActivityStats } from '../shared/types';

export class ActivityController {
  private activities: Map<string, ActivityItem> = new Map();
  private router: Router;
  private statsCache: { data: ActivityStats; timestamp: number } | null = null;
  private readonly STATS_CACHE_TTL = 10000; // 10s

  constructor() {
    this.router = Router();
    this.initializeRoutes();
    this.initializeSampleData();
  }

  private initializeRoutes() {
    this.router.get('/activities', this.getActivities.bind(this));
    this.router.get('/activities/:id', this.getActivityById.bind(this));
    this.router.post('/activities', this.createActivity.bind(this));
    this.router.put('/activities/:id', this.updateActivity.bind(this));
    this.router.delete('/activities/:id', this.deleteActivity.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
  }

  private initializeSampleData() {
    const samples: ActivityItem[] = [
      {
        id: '1',
        type: 'deployment',
        status: 'success',
        title: 'Deploy to Production',
        description: 'Successfully deployed version 1.2.0 to production',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        metadata: { version: '1.2.0', environment: 'production' }
      },
      {
        id: '2',
        type: 'build',
        status: 'success',
        title: 'Build #123',
        description: 'Build completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        metadata: { buildNumber: 123, duration: '5m 30s' }
      },
      {
        id: '3',
        type: 'commit',
        status: 'success',
        title: 'Feature: User authentication',
        description: 'Added JWT-based authentication',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        metadata: { author: 'John Doe', branch: 'feature/auth' }
      },
      {
        id: '4',
        type: 'review',
        status: 'pending',
        title: 'PR #45 - Add new dashboard',
        description: 'Waiting for code review',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        metadata: { pullRequest: 45, reviewers: ['Alice', 'Bob'] }
      },
      {
        id: '5',
        type: 'issue',
        status: 'in_progress',
        title: 'Fix login bug',
        description: 'Users unable to login with SSO',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        metadata: { assignee: 'Jane Smith', priority: 'high' }
      }
    ];
    samples.forEach(a => this.activities.set(a.id, a));
  }

  getActivities(req: Request, res: Response) {
    const { type, status } = req.query;
    let filtered = Array.from(this.activities.values());
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    res.json(filtered);
  }

  getActivityById(req: Request, res: Response) {
    const { id } = req.params;
    const activity = this.activities.get(id);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    res.json(activity);
  }

  createActivity(req: Request, res: Response) {
    const dto: CreateActivityDTO = req.body;
    if (!dto.title || dto.title.trim().length === 0) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const newActivity: ActivityItem = {
      id: String(this.activities.size + 1),
      type: dto.type,
      status: dto.status,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      timestamp: new Date().toISOString(),
      metadata: dto.metadata
    };
    this.activities.set(newActivity.id, newActivity);
    this.statsCache = null; // invalidate
    res.status(201).json(newActivity);
  }

  updateActivity(req: Request, res: Response) {
    const { id } = req.params;
    const dto: UpdateActivityDTO = req.body;
    const activity = this.activities.get(id);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    if (dto.type !== undefined) activity.type = dto.type;
    if (dto.status !== undefined) activity.status = dto.status;
    if (dto.title !== undefined) activity.title = dto.title.trim();
    if (dto.description !== undefined) activity.description = dto.description.trim();
    if (dto.metadata !== undefined) activity.metadata = dto.metadata;
    this.statsCache = null; // invalidate
    res.json(activity);
  }

  deleteActivity(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = this.activities.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    this.statsCache = null; // invalidate
    res.status(204).send();
  }

  getStats(req: Request, res: Response) {
    const now = Date.now();
    if (this.statsCache && now - this.statsCache.timestamp < this.STATS_CACHE_TTL) {
      res.json(this.statsCache.data);
      return;
    }
    const stats: ActivityStats = {
      total: this.activities.size,
      byType: {
        deployment: 0,
        build: 0,
        commit: 0,
        review: 0,
        issue: 0
      },
      byStatus: {
        success: 0,
        failed: 0,
        pending: 0,
        in_progress: 0
      }
    };
    for (const activity of this.activities.values()) {
      stats.byType[activity.type]++;
      stats.byStatus[activity.status]++;
    }
    this.statsCache = { data: stats, timestamp: now };
    res.json(stats);
  }

  getRouter(): Router {
    return this.router;
  }
}
