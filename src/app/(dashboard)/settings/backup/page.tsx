'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export interface BackupItem {
  fileName: string;
  createdAt: string;
  sizeKb: number;
}

export default function DataBackupRecoveryPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateSnapshot = async () => {
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification('SQLite Database snapshot created successfully!');
        fetchBackups();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="SQLite Database Backup & Disaster Recovery"
        actions={
          <Button variant="primary" className="text-xs" onClick={handleCreateSnapshot}>
            <span className="material-symbols-outlined text-[18px] mr-1">save</span>
            Create Instant Backup Snapshot
          </Button>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Automatic Daily Database Backups</CardTitle>
            <CardDescription>Local SQLite database is saved safely to `%APPDATA%/ChatChaska POS/backups`</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-950 dark:text-emerald-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">verified_user</span>
                <div>
                  <span className="font-bold block">100% Offline Local Storage Protection</span>
                  <span>Your database is stored locally on this computer in WAL mode. Zero cloud dependency.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Snapshots Table */}
        <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
            <h3 className="font-bold text-sm text-on-surface">Available Database Snapshots</h3>
            <span className="text-xs text-outline">{backups.length} Snapshots</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4">Backup File Name</th>
                <th className="p-4">Created Timestamp</th>
                <th className="p-4 text-right">File Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs font-semibold text-on-surface">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-outline">
                    No backup snapshots created yet. Click "Create Instant Backup Snapshot" above.
                  </td>
                </tr>
              ) : (
                backups.map((b, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">{b.fileName}</td>
                    <td className="p-4 text-on-surface-variant">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-black font-mono">{b.sizeKb} KB</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
