import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  prefixText?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      prefixText,
      error,
      helperText,
      className,
      id,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <div className="flex justify-between items-center">
            <label htmlFor={inputId} className="input-label">
              {label}
            </label>
            {maxLength && value !== undefined && (
              <span className="font-label-sm text-outline text-[11px]">
                {String(value).length} / {maxLength}
              </span>
            )}
          </div>
        )}
        <div className={cn('relative w-full', (icon || prefixText) && 'flex items-center')}>
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
              {icon}
            </span>
          )}
          {prefixText && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-label-md pointer-events-none">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            maxLength={maxLength}
            value={value}
            className={cn(
              'input',
              icon && 'pl-10',
              prefixText && 'pl-10',
              error && 'border-error focus:border-error focus:ring-error',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="font-body-sm text-xs text-error mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
