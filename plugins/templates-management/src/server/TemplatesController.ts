import { Router, Request, Response } from 'express';
import type { Template, CreateTemplateDTO, UpdateTemplateDTO, TemplateStats } from '../shared/types';

export class TemplatesController {
  private templates: Template[] = [];
  private nextId = 1;
  private router: Router;

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
    const now = new Date();
    this.templates = [
      {
        id: String(this.nextId++),
        name: 'Microservices Architecture',
        description: 'Scalable microservices with API Gateway, service mesh, and distributed tracing',
        category: 'Backend',
        icon: '🏗️',
        complexity: 'Advanced',
        tags: ['Docker', 'Kubernetes', 'Service Mesh'],
        usageCount: 245,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }

  getTemplates(req: Request, res: Response) {
    const { category, complexity, limit } = req.query;
    let filtered = [...this.templates];

    if (category && category !== 'All') {
      filtered = filtered.filter(t => t.category === category);
    }
    if (complexity) {
      filtered = filtered.filter(t => t.complexity === complexity);
    }
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit as string));
    }

    res.json(filtered);
  }

  getTemplateById(req: Request, res: Response) {
    const { id } = req.params;
    const template = this.templates.find(t => t.id === id);
    
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    
    res.json(template);
  }

  createTemplate(req: Request, res: Response) {
    const dto: CreateTemplateDTO = req.body;
    
    if (!dto.name || !dto.description || !dto.category) {
      res.status(400).json({ error: 'Missing required fields: name, description, category' });
      return;
    }

    const now = new Date();
    const newTemplate: Template = {
      id: String(this.nextId++),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      icon: dto.icon || '📄',
      complexity: dto.complexity || 'Beginner',
      tags: dto.tags || [],
      usageCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.templates.push(newTemplate);
    res.status(201).json(newTemplate);
  }

  updateTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const dto: UpdateTemplateDTO = req.body;
    
    const template = this.templates.find(t => t.id === id);
    
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.icon !== undefined) template.icon = dto.icon;
    if (dto.complexity !== undefined) template.complexity = dto.complexity;
    if (dto.tags !== undefined) template.tags = dto.tags;
    template.updatedAt = new Date().toISOString();
    
    res.json(template);
  }

  deleteTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const index = this.templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const deletedTemplate = this.templates[index];
    this.templates.splice(index, 1);
    res.json(deletedTemplate);
  }

  incrementUsage(req: Request, res: Response) {
    const { id } = req.params;
    const template = this.templates.find(t => t.id === id);
    
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    template.usageCount++;
    res.json(template);
  }

  getCategories(req: Request, res: Response) {
    const categories = Array.from(new Set(this.templates.map(t => t.category)));
    res.json(categories);
  }

  getStats(req: Request, res: Response) {
    const byCategory = this.templates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byComplexity = this.templates.reduce((acc, t) => {
      acc[t.complexity] = (acc[t.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats: TemplateStats = {
      total: this.templates.length,
      byCategory,
      byComplexity,
      totalUsage: this.templates.reduce((sum, t) => sum + t.usageCount, 0)
    };
    
    res.json(stats);
  }

  getRouter(): Router {
    return this.router;
  }
}
