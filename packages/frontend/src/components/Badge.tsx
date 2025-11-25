import React, { CSSProperties, useMemo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}
export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const badgeStyle = useMemo<CSSProperties>(() => ({
    ...styles.base,
    ...styles.sizes[size],
    ...styles.variants[variant]
  }), [variant, size]);
  return <span style={badgeStyle}>{children}</span>;
}

Badge.displayName = 'Badge';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s'
  } as CSSProperties,
  sizes: {
    sm: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem'
    } as CSSProperties,
    md: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem'
    } as CSSProperties,
    lg: {
      padding: '0.5rem 1rem',
      fontSize: '1rem'
    } as CSSProperties
  },
  variants: {
    default: {
      background: '#f3f4f6',
      color: '#374151'
    } as CSSProperties,
    success: {
      background: '#d1fae5',
      color: '#065f46'
    } as CSSProperties,
    warning: {
      background: '#fef3c7',
      color: '#92400e'
    } as CSSProperties,
    error: {
      background: '#fee2e2',
      color: '#991b1b'
    } as CSSProperties,
    info: {
      background: '#dbeafe',
      color: '#1e40af'
    } as CSSProperties
  }
};
