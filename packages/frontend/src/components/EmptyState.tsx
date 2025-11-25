import React, { CSSProperties, useMemo } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  const containerStyle = styles.container;
  const buttonStyle = useMemo(() => styles.button, []);
  return (
    <div style={containerStyle}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      {description && <p style={styles.description}>{description}</p>}
      {action && (
        <button style={buttonStyle} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';

const styles: Record<string, CSSProperties> = {
  container: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    maxWidth: '400px',
    margin: '0 auto'
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  description: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    fontSize: '0.95rem'
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.95rem'
  }
};
