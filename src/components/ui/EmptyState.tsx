'use client';

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/**
 * Reusable clean EmptyState component for blank lists/tables across admin & staff views.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-14 px-4 text-center max-w-sm mx-auto space-y-3 animate-in fade-in select-none font-sans">
      <div className="w-14 h-14 rounded-md bg-[#FAF7F2] text-slate-900 border border-[#C3A27C]/40 flex items-center justify-center mx-auto shadow-2xs">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>

      <div className="space-y-1">
        <h3 className="font-black text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] rounded-md text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] rounded-md text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
