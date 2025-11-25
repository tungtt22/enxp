import React, { CSSProperties, useMemo } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
}
export function PageHeader({ title, description, action }: PageHeaderProps) {
  const buttonStyle = useMemo(() => styles.button, []);
  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {description && <p style={styles.description}>{description}</p>}
      </div>
      {action && (
        <button style={buttonStyle} onClick={action.onClick}>
          {action.icon && <span style={styles.icon}>{action.icon}</span>}
          {action.label}
        </button>
      )}
    </div>
  );
}

PageHeader.displayName = 'PageHeader';

const styles: Record<string, CSSProperties> = {
  container: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  description: {
    color: '#6b7280',
    fontSize: '1rem'
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s',
    fontSize: '0.95rem'
  },
  icon: {
    fontSize: '1.2rem'
  }
};
