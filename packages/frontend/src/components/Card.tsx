import React, { CSSProperties, useMemo } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}
export function Card({ children, className, style, onClick, hoverable = false }: CardProps) {
  const cardStyle = useMemo<CSSProperties>(() => ({
    ...styles.card,
    ...(hoverable && styles.hoverable),
    ...(onClick && styles.clickable),
    ...style
  }), [hoverable, onClick, style]);
  return (
    <div className={className} style={cardStyle} onClick={onClick}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';

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
