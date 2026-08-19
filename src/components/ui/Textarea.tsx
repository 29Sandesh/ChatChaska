import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, maxLength, value, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <div className="flex justify-between items-center">
            <label htmlFor={textareaId} className="input-label">
              {label}
            </label>
            {maxLength && value !== undefined && (
              <span className="font-label-sm text-outline text-[11px]">
                {String(value).length} / {maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'input min-h-[90px] resize-none',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && <p className="font-body-sm text-xs text-error mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
