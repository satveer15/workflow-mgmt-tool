import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'todo' | 'in-progress' | 'done' | 'cancelled' | 'low' | 'medium' | 'high';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md' }) => {
  const classNames = ['badge', `badge-${variant}`, `badge-${size}`].join(' ');

  return <span className={classNames}>{children}</span>;
};
