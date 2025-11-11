import React from 'react';
import { 
  FrontendPlugin, 
  PageHeader, 
  Card, 
  Badge, 
  ProgressBar,
  getStatusColor,
  getStatusVariant,
  StatusItem,
  TaggedItem
} from '@enxp/frontend';

interface Project extends StatusItem, TaggedItem {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  tech: string[];
  progress: number;
}

export class ProjectsPlugin extends FrontendPlugin {
  constructor() {
    super(
      'projects-plugin',
      'Projects Plugin',
      '1.0.0',
      {
        description: 'Manage and track your projects'
      }
    );
  }

  registerComponents() {
    const components = new Map<string, React.ComponentType<any>>();
    components.set('ProjectsView', ProjectsView);
    return components;
  }

  registerRoutes() {
    return [
      {
        path: '/plugin-projects',
        component: ProjectsView,
        exact: true
      }
    ];
  }

  registerMenuItems() {
    return [
      {
        id: 'projects',
        label: 'Projects',
        icon: '📁',
        path: '/plugin-projects',
        order: 1
      }
    ];
  }
}

// Projects View Component
const ProjectsView: React.FC = () => {
  const [projects] = React.useState<Project[]>([
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'Microservices architecture for online retail',
      status: 'active',
      tech: ['Kubernetes', 'Node.js', 'PostgreSQL'],
      tags: ['Kubernetes', 'Node.js', 'PostgreSQL'],
      progress: 75
    },
    {
      id: 2,
      name: 'Analytics Dashboard',
      description: 'Real-time data visualization and reporting',
      status: 'planning',
      tech: ['React', 'D3.js', 'WebSocket'],
      tags: ['React', 'D3.js', 'WebSocket'],
      progress: 30
    },
    {
      id: 3,
      name: 'Mobile App Backend',
      description: 'Serverless API for mobile applications',
      status: 'completed',
      tech: ['AWS Lambda', 'DynamoDB', 'API Gateway'],
      tags: ['AWS Lambda', 'DynamoDB', 'API Gateway'],
      progress: 100
    }
  ]);

  return (
    <div style={{ padding: '2rem' }}>
      <PageHeader
        title="Projects"
        description="Manage your engineering projects and architectures"
        action={{
          label: 'New Project',
          icon: '+',
          onClick: () => alert('Create new project')
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {projects.map(project => (
          <Card key={project.id} hoverable onClick={() => alert(`View ${project.name}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>{project.name}</h3>
              <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
            </div>
            
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>{project.description}</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <ProgressBar value={project.progress} color={getStatusColor(project.status)} showLabel />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {project.tech.map((tech, idx) => (
                <Badge key={idx} size="sm">{tech}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>📊 Project Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <StatCard value={projects.length} label="Total Projects" color="#667eea" />
          <StatCard value={projects.filter(p => p.status === 'active').length} label="Active" color="#10b981" />
          <StatCard value={projects.filter(p => p.status === 'planning').length} label="In Planning" color="#f59e0b" />
          <StatCard value={projects.filter(p => p.status === 'completed').length} label="Completed" color="#6366f1" />
        </div>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div>
    <div style={{ fontSize: '2rem', fontWeight: '700', color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{label}</div>
  </div>
);

export default new ProjectsPlugin();
