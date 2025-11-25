import { Router, Request, Response } from 'express';
import type { Template, CreateTemplateDTO, UpdateTemplateDTO, TemplateStats } from '../shared/types';

export class TemplatesController {
  private templates: Map<string, Template> = new Map();
  private nextId = 1;
  private router: Router;
  private statsCache: { data: TemplateStats; timestamp: number } | null = null;
  private categoriesCache: { data: string[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 10000; // 10s

  constructor() {
    this.router = Router();
    this.initializeRoutes();
    this.initializeSampleData();
  }

  private initializeRoutes() {
    this.router.get('/templates', this.getTemplates.bind(this));
    this.router.get('/templates/:id', this.getTemplateById.bind(this));
    this.router.post('/templates', this.createTemplate.bind(this));
    this.router.put('/templates/:id', this.updateTemplate.bind(this));
    this.router.delete('/templates/:id', this.deleteTemplate.bind(this));
    this.router.post('/templates/:id/use', this.incrementUsage.bind(this));
    this.router.get('/categories', this.getCategories.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
  }

  private initializeSampleData() {
    const now = new Date().toISOString();
    const samples: Template[] = [
      {
        id: String(this.nextId++),
        name: 'Microservices Architecture',
        description: 'Scalable microservices with API Gateway, service mesh, and distributed tracing',
        category: 'Backend',
        icon: '🏗️',
        complexity: 'Advanced',
        tags: ['Docker', 'Kubernetes', 'Service Mesh'],
        usageCount: 245,
        createdAt: now,
        updatedAt: now
      },
      {
        id: String(this.nextId++),
        name: 'Serverless API',
        description: 'Event-driven serverless architecture with Lambda functions and API Gateway',
        category: 'Backend',
        icon: '⚡',
        complexity: 'Intermediate',
        tags: ['AWS Lambda', 'API Gateway', 'DynamoDB'],
        usageCount: 189,
        createdAt: now,
        updatedAt: now
      },
      {
        id: String(this.nextId++),
        name: 'React SPA',
        description: 'Modern single-page application with React, TypeScript, and state management',
        category: 'Frontend',
        icon: '⚛️',
        complexity: 'Beginner',
        tags: ['React', 'TypeScript', 'Redux'],
        usageCount: 412,
        createdAt: now,
        updatedAt: now
      },
      {
        id: String(this.nextId++),
        name: 'Event-Driven Architecture',
        description: 'Message-driven architecture with event sourcing and CQRS patterns',
        category: 'Backend',
        icon: '📨',
        complexity: 'Advanced',
        tags: ['Kafka', 'Event Sourcing', 'CQRS'],
        usageCount: 156,
        createdAt: now,
        updatedAt: now
      },
      {
        id: String(this.nextId++),
        name: 'Mobile App Architecture',
        description: 'Cross-platform mobile app with React Native and shared business logic',
        category: 'Mobile',
        icon: '📱',
        complexity: 'Intermediate',
        tags: ['React Native', 'Redux', 'GraphQL'],
        usageCount: 298,
        createdAt: now,
        updatedAt: now
      },
      {
        id: String(this.nextId++),
        name: 'Data Pipeline',
        description: 'ETL pipeline for processing and analyzing large-scale data',
        category: 'Data',
        icon: '🔄',
        complexity: 'Advanced',
        tags: ['Apache Spark', 'Airflow', 'S3'],
        usageCount: 134,
        createdAt: now,
        updatedAt: now
      }
    ];
    samples.forEach(t => this.templates.set(t.id, t));
  }

  getTemplates(req: Request, res: Response) {
    const { category, complexity, limit } = req.query;
    let filtered = Array.from(this.templates.values());
    if (category && category !== 'All') {
      filtered = filtered.filter(t => t.category === category);
    }
    if (complexity) {
      filtered = filtered.filter(t => t.complexity === complexity);
    }
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit as string, 10));
    }
    res.json(filtered);
  }

  getTemplateById(req: Request, res: Response) {
    const { id } = req.params;
    const template = this.templates.get(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json(template);
  }

  createTemplate(req: Request, res: Response) {
    const dto: CreateTemplateDTO = req.body;
    if (!dto.name || dto.name.trim().length === 0) {
      res.status(400).json({ error: 'Template name is required' });
      return;
    }
    if (!dto.description || dto.description.trim().length === 0) {
      res.status(400).json({ error: 'Template description is required' });
      return;
    }
    if (!dto.category || dto.category.trim().length === 0) {
      res.status(400).json({ error: 'Template category is required' });
      return;
    }
    const now = new Date().toISOString();
    const newTemplate: Template = {
      id: String(this.nextId++),
      name: dto.name.trim(),
      description: dto.description.trim(),
      category: dto.category.trim(),
      icon: dto.icon || '📄',
      complexity: dto.complexity || 'Beginner',
      tags: dto.tags || [],
      usageCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.templates.set(newTemplate.id, newTemplate);
    this.statsCache = null;
    this.categoriesCache = null;
    res.status(201).json(newTemplate);
  }

  updateTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const dto: UpdateTemplateDTO = req.body;
    const template = this.templates.get(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    if (dto.name !== undefined) template.name = dto.name.trim();
    if (dto.description !== undefined) template.description = dto.description.trim();
    if (dto.category !== undefined) {
      template.category = dto.category.trim();
      this.categoriesCache = null;
    }
    if (dto.icon !== undefined) template.icon = dto.icon;
    if (dto.complexity !== undefined) template.complexity = dto.complexity;
    if (dto.tags !== undefined) template.tags = dto.tags;
    template.updatedAt = new Date().toISOString();
    this.statsCache = null;
    res.json(template);
  }

  deleteTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const template = this.templates.get(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    this.templates.delete(id);
    this.statsCache = null;
    this.categoriesCache = null;
    res.json(template);
  }

  incrementUsage(req: Request, res: Response) {
    const { id } = req.params;
    const template = this.templates.get(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    template.usageCount++;
    this.statsCache = null; // invalidate stats
    res.json(template);
  }

  getCategories(req: Request, res: Response) {
    const now = Date.now();
    if (this.categoriesCache && now - this.categoriesCache.timestamp < this.CACHE_TTL) {
      res.json(this.categoriesCache.data);
      return;
    }
    const categories = Array.from(new Set(Array.from(this.templates.values()).map(t => t.category)));
    this.categoriesCache = { data: categories, timestamp: now };
    res.json(categories);
  }

  getStats(req: Request, res: Response) {
    const now = Date.now();
    if (this.statsCache && now - this.statsCache.timestamp < this.CACHE_TTL) {
      res.json(this.statsCache.data);
      return;
    }
    const byCategory: Record<string, number> = {};
    const byComplexity: Record<string, number> = {};
    let totalUsage = 0;
    for (const t of this.templates.values()) {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byComplexity[t.complexity] = (byComplexity[t.complexity] || 0) + 1;
      totalUsage += t.usageCount;
    }
    const stats: TemplateStats = {
      total: this.templates.size,
      byCategory,
      byComplexity,
      totalUsage
    };
    this.statsCache = { data: stats, timestamp: now };
    res.json(stats);
  }

  getRouter(): Router {
    return this.router;
  }
}
