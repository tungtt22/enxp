import React, { useEffect, useState } from 'react';
import { ActivityItem } from '../shared';

/**
 * Activity Dashboard Component
 */
export const ActivityDashboard: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/plugins/activity/activities');
      if (!response.ok) {
        console.warn('API not available, using mock data');
        setActivities([
          {
            id: '1',
            type: 'deployment',
            status: 'success',
            title: 'Deploy to Production',
            description: 'Deployed version 1.2.0 to production',
            timestamp: new Date().toISOString(),
            metadata: { version: '1.2.0', environment: 'production' },
          },
          {
            id: '2',
            type: 'build',
            status: 'in_progress',
            title: 'Building Feature Branch',
            description: 'Building feature/user-auth branch',
            timestamp: new Date().toISOString(),
            metadata: { branch: 'feature/user-auth' },
          },
          {
            id: '3',
            type: 'commit',
            status: 'success',
            title: 'Code Review Completed',
            description: 'PR #123 reviewed and approved',
            timestamp: new Date().toISOString(),
            metadata: { pr: 123 },
          },
        ]);
      } else {
        const data = await response.json();
        setActivities(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'deployment':
        return '🚀';
      case 'build':
        return '🔨';
      case 'commit':
        return '📝';
      case 'review':
        return '👀';
      case 'issue':
        return '🐛';
      default:
        return '📋';
    }
  };

  if (loading) {
    return <div className="p-4">Loading activities...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activities</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          New Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow bg-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getTypeIcon(activity.type)}</span>
              <span className="text-xs text-gray-500 font-medium uppercase">
                {activity.type}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
            
            {activity.description && (
              <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No activities yet. Create your first activity!
        </div>
      )}
    </div>
  );
};
