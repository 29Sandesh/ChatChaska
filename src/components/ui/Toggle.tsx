import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: ToggleProps) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'toggle');

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label htmlFor={toggleId} className="font-label-md text-on-surface cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <span className="font-body-sm text-xs text-on-surface-variant">{description}</span>
          )}
        </div>
      )}
      <label className="toggle flex-shrink-0">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}
