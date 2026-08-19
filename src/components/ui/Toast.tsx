'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Hook to show toast notifications from any component.
 * @example
 * const { toast } = useToast();
 * toast.success('Bill saved!');
 * toast.error('Failed to save bill.');
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for components outside provider — no-op
    return {
      toasts: [],
      toast: {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {},
      },
      dismiss: () => {},
    };
  }
  return ctx;
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-emerald-600',
  error: 'text-rose-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

/**
 * Toast provider that wraps the app. Renders toast stack in bottom-right corner.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg, 5000),
    warning: (msg: string) => addToast('warning', msg, 4000),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      {/* Toast Stack — Bottom Right on Desktop, Bottom Center on Mobile */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-in slide-in-from-right fade-in duration-200 cursor-pointer ${STYLES[t.type]}`}
            onClick={() => dismiss(t.id)}
            role="alert"
          >
            <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${ICON_STYLES[t.type]}`}>
              {ICONS[t.type]}
            </span>
            <p className="text-xs font-semibold leading-relaxed flex-1">{t.message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
              className="text-current opacity-40 hover:opacity-70 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
