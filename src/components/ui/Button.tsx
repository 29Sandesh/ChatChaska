import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'btn',
          `btn-${variant}`,
          size === 'sm' && 'py-1 px-3 text-xs',
          size === 'lg' && 'py-3 px-6 text-base',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
        ) : (
          icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
