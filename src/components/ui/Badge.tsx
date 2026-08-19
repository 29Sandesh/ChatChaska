import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral';
  dot?: boolean;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  dot = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {dot && <span className={cn('badge-dot', `badge-dot-${variant}`)} />}
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}
