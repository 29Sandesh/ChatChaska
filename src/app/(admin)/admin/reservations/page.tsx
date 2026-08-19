'use client';

import React, { useState, useEffect } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { CloudReservation } from '@/types';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<CloudReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');
  const [selectedTables, setSelectedTables] = useState<Record<string, string>>({});
  const tableOptions = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/reservations');
        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (err) {
        console.error('Error loading reservations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'seated' | 'declined', tableAssigned?: string) => {
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, table_assigned: tableAssigned }),
      });

      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, table_assigned: tableAssigned || r.table_assigned } : r))
        );
      }
    } catch (err) {
      console.error('Update reservation status failed:', err);
    }
  };

  const filtered = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-blue-600">table_restaurant</span>
            <h1 className="text-2xl font-black">Table Reservations & Bookings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage advance table booking requests from your discovery profile and assign tables.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">Add Walk-in</button>
        {/* Filter Chips */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
          {['all', 'pending', 'confirmed', 'seated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === f ? 'bg-blue-600 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 h-28 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <EmptyState
              icon="table_restaurant"
              title="No Reservations Found"
              description="Customer table bookings submitted through your public cafe discovery page will appear here."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{res.customer_name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : res.status === 'seated'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : res.status === 'declined'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">GUESTS</span>
                      <span className="font-bold text-blue-600">👥 {res.guest_count} Persons</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">DATE & TIME</span>
                      <span className="font-medium">{res.reservation_date} • {res.time_slot}</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">PHONE</span>
                      <a href={`tel:${res.customer_phone}`} className="text-emerald-400 font-mono hover:underline">
                        {res.customer_phone}
                      </a>
                    </div>

                    {res.table_assigned && (
                      <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200/80">
                        <span className="text-slate-500 font-semibold">ASSIGNED</span>
                        <span className="font-bold text-slate-900">📍 {res.table_assigned}</span>
                      </div>
                    )}
                  </div>

                  {res.special_request && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-[11px] text-amber-300">
                      <span className="font-bold">Request:</span> {res.special_request}
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  {res.status === 'pending' && (
                    <div className="w-full space-y-2">
                      <select
                        value={selectedTables[res.id] || ''}
                        onChange={(e) => setSelectedTables({ ...selectedTables, [res.id]: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-900 mb-2"
                      >
                        <option value="" disabled>Select Table...</option>
                        {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'declined')}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'confirmed', selectedTables[res.id] || 'Table 1')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          Confirm &amp; Assign
                        </button>
                      </div>
                    </div>
                  )}

                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'seated')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-slate-900 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Mark Guest Seated</span>
                    </button>
                  )}

                  {res.status === 'seated' && (
                    <span className="text-xs text-slate-500 font-semibold text-center w-full">
                      ✅ Guest Currently Dining
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
