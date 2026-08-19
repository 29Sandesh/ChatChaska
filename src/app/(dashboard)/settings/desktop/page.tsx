'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function DesktopAppSettingsPage() {
  const [autoStart, setAutoStart] = useState<boolean>(true);
  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleAutoStart = (enable: boolean) => {
    setAutoStart(enable);
    if (typeof window !== 'undefined' && window.electronAPI?.toggleAutoStart) {
      window.electronAPI.toggleAutoStart(enable);
    }
    setNotification(enable ? 'Auto-start on Windows boot ENABLED' : 'Auto-start DISABLED');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMinimizeTray = () => {
    if (typeof window !== 'undefined' && window.electronAPI?.minimizeToTray) {
      window.electronAPI.minimizeToTray();
    } else {
      setNotification('Running in Web Mode (Desktop Tray available in Electron app)');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Desktop Application & System Settings"
        actions={
          <Button variant="primary" className="text-xs" onClick={handleMinimizeTray}>
            <span className="material-symbols-outlined text-[18px] mr-1">south_east</span>
            Minimize to System Tray
          </Button>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Windows Auto-Startup & Tray Behavior</CardTitle>
            <CardDescription>Configure desktop background execution & boot behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div>
                <span className="text-sm font-bold text-on-surface block">
                  Auto-Launch POS on System Boot
                </span>
                <span className="text-xs text-on-surface-variant">
                  Automatically start ChatChaska POS when Windows turns on
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => handleToggleAutoStart(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div>
                <span className="text-sm font-bold text-on-surface block">
                  Minimize to Tray on Close (X)
                </span>
                <span className="text-xs text-on-surface-variant">
                  Keep server and thermal printer listeners running silently in system tray
                </span>
              </div>
              <input
                type="checkbox"
                checked={minimizeToTray}
                onChange={(e) => setMinimizeToTray(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global POS Keyboard Shortcut</CardTitle>
            <CardDescription>Instant access shortcut key from any Windows application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface">Global Quick-POS Terminal Launch Hotkey:</span>
              <kbd className="px-3 py-1.5 bg-surface border border-outline-variant/40 rounded-lg font-mono font-bold text-primary shadow-xs">
                Ctrl + Alt + P
              </kbd>
            </div>
          </CardContent>
        </Card>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
