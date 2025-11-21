export interface ActivityItem {
  id: string;
  type: 'deployment' | 'build' | 'commit' | 'review' | 'issue';
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreateActivityDTO {
  type: ActivityItem['type'];
  status: ActivityItem['status'];
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateActivityDTO {
  type?: ActivityItem['type'];
  status?: ActivityItem['status'];
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ActivityStats {
  total: number;
  byType: Record<ActivityItem['type'], number>;
  byStatus: Record<ActivityItem['status'], number>;
}
