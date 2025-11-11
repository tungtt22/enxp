import { BackendPlugin } from '@enxp/backend';
import { Router, Request, Response } from 'express';

interface ActivityItem {
  id: string;
  type: 'deployment' | 'build' | 'commit' | 'review' | 'issue';
  user: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  details?: string;
  createdAt: string;
}

export class ActivityBackendPlugin extends BackendPlugin {
  private activities: ActivityItem[] = [];
  private nextId = 1;

  constructor() {
    super(
      'activity-backend',
      'Activity Backend API',
      '1.0.0',
      {
        description: 'Backend API for activity tracking'
      }
    );
  }

  async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Activity Backend Plugin');
    
    // Initialize with sample data
    const now = new Date();
    this.activities = [
      {
        id: String(this.nextId++),
        type: 'deployment',
        user: 'Tung Tran',
        action: 'deployed',
        target: 'API Gateway v2.3.1',
        timestamp: '2 minutes ago',
        status: 'success',
        details: 'Production environment',
        createdAt: new Date(now.getTime() - 2 * 60000).toISOString()
      },
      {
        id: String(this.nextId++),
        type: 'build',
        user: 'John Doe',
        action: 'built',
        target: 'Auth Service',
        timestamp: '15 minutes ago',
        status: 'in_progress',
        details: 'Build #234',
        createdAt: new Date(now.getTime() - 15 * 60000).toISOString()
      },
      {
        id: String(this.nextId++),
        type: 'commit',
        user: 'Sarah Chen',
        action: 'committed',
        target: 'User Dashboard',
        timestamp: '1 hour ago',
        status: 'success',
        details: 'feat: Add user profile page',
        createdAt: new Date(now.getTime() - 60 * 60000).toISOString()
      },
      {
        id: String(this.nextId++),
        type: 'review',
        user: 'Mike Johnson',
        action: 'reviewed',
        target: 'Payment Integration',
        timestamp: '2 hours ago',
        status: 'pending',
        details: 'PR #156 - Awaiting approval',
        createdAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString()
      },
      {
        id: String(this.nextId++),
        type: 'deployment',
        user: 'Emily Davis',
        action: 'deployed',
        target: 'Frontend App v1.2.0',
        timestamp: '3 hours ago',
        status: 'failed',
        details: 'Staging environment - Rollback initiated',
        createdAt: new Date(now.getTime() - 3 * 60 * 60000).toISOString()
      }
    ];
  }

  async onActivate(): Promise<void> {
    this.log('info', 'Activity Backend Plugin activated');
  }

  registerRoutes(router: Router): void {
    // GET /api/plugins/activity-backend/activities - Get all activities
    router.get('/activities', (req: Request, res: Response) => {
      const { type, status, limit } = req.query;
      let filtered = [...this.activities];

      if (type) {
        filtered = filtered.filter(a => a.type === type);
      }
      if (status) {
        filtered = filtered.filter(a => a.status === status);
      }
      if (limit) {
        filtered = filtered.slice(0, parseInt(limit as string));
      }

      this.log('info', `GET /activities - Returned ${filtered.length} items`);
      res.json({
        success: true,
        data: filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        total: filtered.length
      });
    });

    // GET /api/plugins/activity-backend/activities/:id - Get activity by ID
    router.get('/activities/:id', (req: Request, res: Response) => {
      const { id } = req.params;
      const activity = this.activities.find(a => a.id === id);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          error: 'Activity not found'
        });
      }
      
      this.log('info', `GET /activities/${id}`);
      res.json({
        success: true,
        data: activity
      });
    });

    // POST /api/plugins/activity-backend/activities - Create new activity
    router.post('/activities', (req: Request, res: Response) => {
      const { type, user, action, target, status, details } = req.body;
      
      if (!type || !user || !action || !target) {
        return res.status(400).json({
          success: false,
          error: 'Type, user, action, and target are required'
        });
      }

      const now = new Date();
      const newActivity: ActivityItem = {
        id: String(this.nextId++),
        type,
        user,
        action,
        target,
        timestamp: 'just now',
        status: status || 'pending',
        details,
        createdAt: now.toISOString()
      };

      this.activities.unshift(newActivity); // Add to beginning
      this.log('info', `POST /activities - Created: ${newActivity.action} ${newActivity.target}`);
      
      res.status(201).json({
        success: true,
        data: newActivity,
        message: 'Activity created successfully'
      });
    });

    // PUT /api/plugins/activity-backend/activities/:id - Update activity
    router.put('/activities/:id', (req: Request, res: Response) => {
      const { id } = req.params;
      const activityIndex = this.activities.findIndex(a => a.id === id);
      
      if (activityIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Activity not found'
        });
      }

      const { type, user, action, target, status, details } = req.body;
      const updatedActivity = {
        ...this.activities[activityIndex],
        ...(type && { type }),
        ...(user && { user }),
        ...(action && { action }),
        ...(target && { target }),
        ...(status && { status }),
        ...(details !== undefined && { details })
      };

      this.activities[activityIndex] = updatedActivity;
      this.log('info', `PUT /activities/${id} - Updated`);
      
      res.json({
        success: true,
        data: updatedActivity,
        message: 'Activity updated successfully'
      });
    });

    // DELETE /api/plugins/activity-backend/activities/:id - Delete activity
    router.delete('/activities/:id', (req: Request, res: Response) => {
      const { id } = req.params;
      const activityIndex = this.activities.findIndex(a => a.id === id);
      
      if (activityIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Activity not found'
        });
      }

      const deletedActivity = this.activities[activityIndex];
      this.activities.splice(activityIndex, 1);
      this.log('info', `DELETE /activities/${id} - Deleted`);
      
      res.json({
        success: true,
        message: 'Activity deleted successfully',
        data: deletedActivity
      });
    });

    // GET /api/plugins/activity-backend/stats - Get activity statistics
    router.get('/stats', (req: Request, res: Response) => {
      const stats = {
        total: this.activities.length,
        byType: {
          deployment: this.activities.filter(a => a.type === 'deployment').length,
          build: this.activities.filter(a => a.type === 'build').length,
          commit: this.activities.filter(a => a.type === 'commit').length,
          review: this.activities.filter(a => a.type === 'review').length,
          issue: this.activities.filter(a => a.type === 'issue').length
        },
        byStatus: {
          success: this.activities.filter(a => a.status === 'success').length,
          failed: this.activities.filter(a => a.status === 'failed').length,
          pending: this.activities.filter(a => a.status === 'pending').length,
          in_progress: this.activities.filter(a => a.status === 'in_progress').length
        }
      };
      
      this.log('info', 'GET /stats');
      res.json({
        success: true,
        data: stats
      });
    });
  }
}

export default new ActivityBackendPlugin();
