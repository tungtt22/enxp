import React, { useEffect, useState } from 'react';
import { Template } from '../shared';

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
  'Web Application': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Microservice': { bg: 'bg-green-100', text: 'text-green-800' },
  'Data Processing': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'API Gateway': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Default': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

// Template type icons
const getTemplateIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'Web Application': '🌐',
    'Microservice': '⚙️',
    'Data Processing': '📊',
    'API Gateway': '🔌',
  };
  return iconMap[category] || '📋';
};

/**
 * Templates Dashboard Component
 */
export const TemplatesDashboard: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/plugins/templates/templates');
      if (!response.ok) {
        console.warn('API not available, using mock data');
        // Use mock data when API is not available
        setTemplates([
          {
            id: '1',
            name: 'Microservice Starter',
            description: 'Basic microservice template with REST API',
            category: 'Microservice',
            icon: '⚙️',
            complexity: 'Beginner',
            tags: ['nodejs', 'express', 'rest-api'],
            usageCount: 42,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'React SPA',
            description: 'Single Page Application with React and TypeScript',
            category: 'Web Application',
            icon: '🌐',
            complexity: 'Intermediate',
            tags: ['react', 'typescript', 'spa'],
            usageCount: 38,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Data Pipeline',
            description: 'ETL pipeline with Apache Kafka integration',
            category: 'Data Processing',
            icon: '📊',
            complexity: 'Advanced',
            tags: ['kafka', 'etl', 'streaming'],
            usageCount: 15,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } else {
        const data = await response.json();
        setTemplates(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Use mock data on error
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading templates...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Architecture Templates</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const colors = categoryColors[template.category] || categoryColors['Default'];
          const icon = getTemplateIcon(template.category);
          
          return (
            <div
              key={template.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">{icon}</span>
                <h3 className="text-xl font-semibold">{template.name}</h3>
              </div>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-sm ${colors.bg} ${colors.text}`}>
                  {template.category}
                </span>
                <span className="text-xs text-gray-500">
                  Used {template.usageCount} times
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {template.complexity}
                </span>
                <button className="text-blue-500 hover:text-blue-700">
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No templates yet. Create your first template!
        </div>
      )}
    </div>
  );
};
