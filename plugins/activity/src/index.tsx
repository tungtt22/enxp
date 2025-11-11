import React from 'react';
import { FrontendPlugin } from '@enxp/frontend';

interface ActivityItem {
  id: string;
  type: 'deployment' | 'build' | 'commit' | 'review' | 'issue';
  user: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  details?: string;
}

const ActivityView: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'deployment',
      user: 'Tung Tran',
      action: 'deployed',
      target: 'API Gateway v2.3.1',
      timestamp: '2 minutes ago',
      status: 'success',
      details: 'Production environment'
    },
    {
      id: '2',
      type: 'build',
      user: 'John Doe',
      action: 'built',
      target: 'Auth Service',
      timestamp: '15 minutes ago',
      status: 'in_progress',
      details: 'Build #234'
    },
    {
      id: '3',
      type: 'commit',
      user: 'Sarah Chen',
      action: 'committed',
      target: 'User Dashboard',
      timestamp: '1 hour ago',
      status: 'success',
      details: 'feat: Add user profile page'
    },
    {
      id: '4',
      type: 'review',
      user: 'Mike Johnson',
      action: 'reviewed',
      target: 'Payment Integration',
      timestamp: '2 hours ago',
      status: 'pending',
      details: 'PR #156 - Awaiting approval'
    },
    {
      id: '5',
      type: 'deployment',
      user: 'Emily Davis',
      action: 'deployed',
      target: 'Frontend App v1.2.0',
      timestamp: '3 hours ago',
      status: 'failed',
      details: 'Staging environment - Rollback initiated'
    },
    {
      id: '6',
      type: 'issue',
      user: 'Alex Kim',
      action: 'created issue',
      target: 'Database Migration',
      timestamp: '4 hours ago',
      status: 'pending',
      details: 'Critical: Memory leak in cache layer'
    },
    {
      id: '7',
      type: 'build',
      user: 'Tung Tran',
      action: 'built',
      target: 'Notification Service',
      timestamp: '5 hours ago',
      status: 'success',
      details: 'Build #187'
    },
    {
      id: '8',
      type: 'commit',
      user: 'John Doe',
      action: 'committed',
      target: 'API Gateway',
      timestamp: '6 hours ago',
      status: 'success',
      details: 'fix: Rate limiting edge cases'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deployment': return '🚀';
      case 'build': return '🔨';
      case 'commit': return '💾';
      case 'review': return '👀';
      case 'issue': return '🐛';
      default: return '📌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Success';
      case 'failed': return 'Failed';
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Activity Feed</h1>
        <p style={{ color: '#6b7280' }}>Track all activities across your engineering platform</p>
      </div>

      {/* Activity Timeline */}
      <div style={{ maxWidth: '900px' }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              position: 'relative',
              paddingLeft: '48px',
              paddingBottom: index === activities.length - 1 ? '0' : '32px'
            }}
          >
            {/* Timeline Line */}
            {index !== activities.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '19px',
                  top: '40px',
                  bottom: '0',
                  width: '2px',
                  background: '#e5e7eb'
                }}
              />
            )}

            {/* Activity Icon */}
            <div
              style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                zIndex: 1
              }}
            >
              {getActivityIcon(activity.type)}
            </div>

            {/* Activity Card */}
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{activity.user}</span>
                    <span style={{ color: '#6b7280', margin: '0 6px' }}>{activity.action}</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{activity.target}</span>
                  </div>
                  {activity.details && (
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                      {activity.details}
                    </p>
                  )}
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {activity.timestamp}
                  </span>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: getStatusColor(activity.status) + '20',
                    color: getStatusColor(activity.status),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getStatusText(activity.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          style={{
            padding: '10px 24px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            color: '#374151',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
          }}
        >
          Load More Activities
        </button>
      </div>
    </div>
  );
};

export class ActivityPlugin extends FrontendPlugin {
  constructor() {
    super(
      'activity-plugin',
      'Activity Plugin',
      '1.0.0',
      {
        description: 'Track platform activities and events'
      }
    );
  }

  registerComponents() {
    const components = new Map<string, React.ComponentType<any>>();
    components.set('ActivityView', ActivityView);
    return components;
  }

  registerRoutes() {
    return [
      {
        path: '/plugin-activity',
        component: ActivityView,
        exact: true
      }
    ];
  }

  registerMenuItems() {
    return [
      {
        id: 'activity',
        label: 'Activity',
        icon: '🕒',
        path: '/plugin-activity',
        order: 3
      }
    ];
  }
}

export default new ActivityPlugin();
