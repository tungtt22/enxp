// Common types shared across plugins
export interface BaseItem {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
}

export interface StatusItem extends BaseItem {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'planning' | 'failed' | 'success' | 'in_progress';
}

export interface TaggedItem extends BaseItem {
  tags: string[];
}

export interface TimestampedItem extends BaseItem {
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserItem extends BaseItem {
  user: string;
  userId?: string;
}

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: '#10b981',
    success: '#10b981',
    completed: '#6366f1',
    planning: '#f59e0b',
    warning: '#f59e0b',
    pending: '#f59e0b',
    inactive: '#6b7280',
    failed: '#ef4444',
    error: '#ef4444',
    in_progress: '#3b82f6',
    info: '#3b82f6'
  };
  return colorMap[status] || '#6b7280';
};

// Helper function to get status variant for Badge component
export const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const variantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    active: 'success',
    success: 'success',
    completed: 'info',
    planning: 'warning',
    pending: 'warning',
    failed: 'error',
    error: 'error',
    in_progress: 'info'
  };
  return variantMap[status] || 'default';
};
