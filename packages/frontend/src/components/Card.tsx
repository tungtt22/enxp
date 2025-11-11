import React, { CSSProperties } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  style, 
  onClick,
  hoverable = false 
}) => {
  const cardStyle: CSSProperties = {
    ...styles.card,
    ...(hoverable && styles.hoverable),
    ...(onClick && styles.clickable),
    ...style
  };

  return (
    <div 
      className={className}
      style={cardStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease'
  },
  hoverable: {
    cursor: 'default'
  },
  clickable: {
    cursor: 'pointer'
  }
};
