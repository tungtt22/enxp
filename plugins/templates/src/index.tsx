import React from 'react';
import { FrontendPlugin } from '@enxp/frontend';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  usageCount: number;
}

const TemplatesView: React.FC = () => {
  const templates: Template[] = [
    {
      id: '1',
      name: 'Microservices Architecture',
      description: 'Scalable microservices with API Gateway, service mesh, and distributed tracing',
      category: 'Backend',
      icon: '🏗️',
      complexity: 'Advanced',
      tags: ['Docker', 'Kubernetes', 'Service Mesh'],
      usageCount: 245
    },
    {
      id: '2',
      name: 'Serverless API',
      description: 'Event-driven serverless architecture with Lambda functions and API Gateway',
      category: 'Backend',
      icon: '⚡',
      complexity: 'Intermediate',
      tags: ['AWS Lambda', 'API Gateway', 'DynamoDB'],
      usageCount: 189
    },
    {
      id: '3',
      name: 'React SPA',
      description: 'Modern single-page application with React, TypeScript, and state management',
      category: 'Frontend',
      icon: '⚛️',
      complexity: 'Beginner',
      tags: ['React', 'TypeScript', 'Redux'],
      usageCount: 412
    },
    {
      id: '4',
      name: 'Event-Driven Architecture',
      description: 'Message-driven architecture with event sourcing and CQRS patterns',
      category: 'Backend',
      icon: '📨',
      complexity: 'Advanced',
      tags: ['Kafka', 'Event Sourcing', 'CQRS'],
      usageCount: 156
    },
    {
      id: '5',
      name: 'Mobile App Architecture',
      description: 'Cross-platform mobile app with React Native and shared business logic',
      category: 'Mobile',
      icon: '📱',
      complexity: 'Intermediate',
      tags: ['React Native', 'Redux', 'GraphQL'],
      usageCount: 298
    },
    {
      id: '6',
      name: 'Data Pipeline',
      description: 'ETL pipeline for processing and analyzing large-scale data',
      category: 'Data',
      icon: '🔄',
      complexity: 'Advanced',
      tags: ['Apache Spark', 'Airflow', 'S3'],
      usageCount: 134
    }
  ];

  const categories = ['All', 'Backend', 'Frontend', 'Mobile', 'Data'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Architecture Templates</h1>
        <p style={{ color: '#6b7280' }}>Jumpstart your projects with pre-configured architecture templates</p>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: selectedCategory === category ? '#8b5cf6' : '#f3f4f6',
              color: selectedCategory === category ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '48px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px'
              }}>
                {template.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                  {template.name}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    background: getComplexityColor(template.complexity) + '20',
                    color: getComplexityColor(template.complexity),
                    fontWeight: 500
                  }}>
                    {template.complexity}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {template.usageCount} uses
                  </span>
                </div>
              </div>
            </div>

            <p style={{ 
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              {template.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {template.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    color: '#4b5563'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <button style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Use Template
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#9ca3af'
        }}>
          No templates found in this category
        </div>
      )}
    </div>
  );
};

export class TemplatesPlugin extends FrontendPlugin {
  constructor() {
    super(
      'templates-plugin',
      'Templates Plugin',
      '1.0.0',
      {
        description: 'Browse and use architecture templates'
      }
    );
  }

  registerComponents() {
    const components = new Map<string, React.ComponentType<any>>();
    components.set('TemplatesView', TemplatesView);
    return components;
  }

  registerRoutes() {
    return [
      {
        path: '/plugin-templates',
        component: TemplatesView,
        exact: true
      }
    ];
  }

  registerMenuItems() {
    return [
      {
        id: 'templates',
        label: 'Templates',
        icon: '📋',
        path: '/plugin-templates',
        order: 2
      }
    ];
  }
}

export default new TemplatesPlugin();
