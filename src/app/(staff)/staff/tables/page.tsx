'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StaffTablesPage() {
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tables')
      .then((r) => r.json())
      .then((d) => { if (d.tables) setTables(d.tables); });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">Floor Plan Table Map</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time table status monitor (Blank, Running, Printed, Paid)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tables.length === 0 ? (
          ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'].map((t) => (
            <Link
              key={t}
              href={`/staff/pos?table=${t}`}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 h-28 flex flex-col justify-between hover:border-blue-600 shadow-sm transition-all"
            >
              <span className="font-black text-lg text-slate-900">{t}</span>
              <span className="text-[11px] font-bold text-slate-400">BLANK</span>
            </Link>
          ))
        ) : (
          tables.map((t) => (
            <Link
              key={t.id}
              href={`/staff/pos?table=${t.name}`}
              className={`bg-white border-2 rounded-2xl p-4 h-28 flex flex-col justify-between shadow-sm transition-all ${
                t.status === 'running'
                  ? 'border-blue-500 bg-blue-50/50'
                  : t.status === 'paid'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-blue-600'
              }`}
            >
              <span className="font-black text-lg text-slate-900">{t.name}</span>
              <span className={`text-[11px] font-bold uppercase ${
                t.status === 'running' ? 'text-blue-600' : t.status === 'paid' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {t.status || 'BLANK'}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
