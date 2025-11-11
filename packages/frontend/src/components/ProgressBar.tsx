import React, { CSSProperties } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = '#667eea',
  height = '8px',
  showLabel = false
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div style={{ ...styles.container, height }}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
            background: color
          }}
        />
      </div>
      {showLabel && (
        <span style={styles.label}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease'
  },
  label: {
    display: 'inline-block',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500'
  }
};
