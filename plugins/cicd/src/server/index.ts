import { ExtendedPluginContext } from '@enxp/core';
import { Router } from 'express';

// Mock data
let pipelines = [
  {
    id: 1,
    name: 'Build and Deploy',
    repository: 'https://github.com/enxp/platform',
    branch: 'main',
    status: 'success',
    lastRun: new Date('2025-11-25T10:30:00'),
    duration: 120,
    createdAt: new Date('2025-11-01T00:00:00')
  },
  {
    id: 2,
    name: 'Integration Tests',
    repository: 'https://github.com/enxp/platform',
    branch: 'develop',
    status: 'running',
    lastRun: new Date('2025-11-25T11:00:00'),
    duration: 0,
    createdAt: new Date('2025-11-01T00:00:00')
  },
  {
    id: 3,
    name: 'Security Scan',
    repository: 'https://github.com/enxp/platform',
    branch: 'main',
    status: 'failed',
    lastRun: new Date('2025-11-24T22:00:00'),
    duration: 45,
    createdAt: new Date('2025-11-01T00:00:00')
  }
];

let executions = [
  {
    id: 1,
    pipelineId: 1,
    status: 'success',
    startedAt: new Date('2025-11-25T10:30:00'),
    finishedAt: new Date('2025-11-25T10:32:00'),
    duration: 120,
    logs: 'Build completed successfully'
  },
  {
    id: 2,
    pipelineId: 2,
    status: 'running',
    startedAt: new Date('2025-11-25T11:00:00'),
    finishedAt: null,
    duration: 0,
    logs: 'Running tests...'
  }
];

let nextPipelineId = 4;
let nextExecutionId = 3;

export function activateServer(context: ExtendedPluginContext): void {
  const router = Router();

  // Get all pipelines
  router.get('/pipelines', async (req, res) => {
    const { status } = req.query;
    
    let filteredPipelines = pipelines;
    if (status) {
      filteredPipelines = pipelines.filter(p => p.status === status);
    }
    
    res.json({ 
      success: true,
      data: filteredPipelines
    });
  });

  // Get pipeline by ID
  router.get('/pipelines/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const pipeline = pipelines.find(p => p.id === id);
    
    if (!pipeline) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pipeline not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: pipeline
    });
  });

  // Create pipeline
  router.post('/pipelines', async (req, res) => {
    const { name, repository, branch = 'main', steps = [] } = req.body;
    
    if (!name || !repository) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and repository are required' 
      });
    }
    
    const newPipeline = {
      id: nextPipelineId++,
      name,
      repository,
      branch,
      status: 'pending' as const,
      lastRun: new Date(),
      duration: 0,
      createdAt: new Date()
    };
    
    pipelines.push(newPipeline);
    
    res.status(201).json({ 
      success: true,
      data: newPipeline
    });
  });

  // Trigger pipeline
  router.post('/pipelines/:id/run', async (req, res) => {
    const id = parseInt(req.params.id);
    const pipeline = pipelines.find(p => p.id === id);
    
    if (!pipeline) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pipeline not found' 
      });
    }
    
    // Update pipeline status
    pipeline.status = 'running';
    pipeline.lastRun = new Date();
    
    // Create execution record
    const execution = {
      id: nextExecutionId++,
      pipelineId: id,
      status: 'running' as const,
      startedAt: new Date(),
      finishedAt: null,
      duration: 0,
      logs: 'Pipeline started...'
    };
    
    executions.push(execution);
    
    res.json({ 
      success: true,
      message: 'Pipeline triggered',
      executionId: execution.id
    });
  });

  // Get executions
  router.get('/executions', async (req, res) => {
    res.json({ 
      success: true,
      data: executions
    });
  });

  // Get statistics
  router.get('/stats', async (req, res) => {
    const totalPipelines = pipelines.length;
    const totalExecutions = executions.length;
    
    const successfulExecutions = executions.filter(e => e.status === 'success').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const completedExecutions = executions.filter(e => e.finishedAt !== null);
    const avgDuration = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length
      : 0;
    
    const byStatus = {
      running: pipelines.filter(p => p.status === 'running').length,
      success: pipelines.filter(p => p.status === 'success').length,
      failed: pipelines.filter(p => p.status === 'failed').length,
      pending: pipelines.filter(p => p.status === 'pending').length
    };
    
    res.json({ 
      success: true,
      data: {
        totalPipelines,
        totalExecutions,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: Math.round(avgDuration),
        byStatus
      }
    });
  });

  // Get basePath from manifest
  const basePath = context.manifest.contributes?.api?.basePath || `/api/plugins/${context.manifest.id}`;

  // Register router with the platform
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    basePath,
    router,
  });

  context.logger.info(`Registered CI/CD API routes at ${basePath}`);
}
