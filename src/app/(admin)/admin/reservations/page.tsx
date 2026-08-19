'use client';

import React, { useState, useEffect } from 'react';
import { CloudReservation } from '@/types';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<CloudReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-white">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-orange-400">table_restaurant</span>
            <h1 className="text-2xl font-black">Table Reservations & Bookings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage advance table booking requests from your discovery profile and assign tables.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          {['all', 'pending', 'confirmed', 'seated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === f ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
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
              <div key={i} className="bg-slate-900 border border-slate-800 h-28 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-600">event_seat</span>
            <h3 className="font-bold text-slate-300 text-sm">No reservations found</h3>
            <p className="text-xs text-slate-500">New table booking requests from customer profiles will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{res.customer_name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : res.status === 'seated'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : res.status === 'declined'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-semibold">GUESTS</span>
                      <span className="font-bold text-orange-400">👥 {res.guest_count} Persons</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-semibold">DATE & TIME</span>
                      <span className="font-medium">{res.reservation_date} • {res.time_slot}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-semibold">PHONE</span>
                      <a href={`tel:${res.customer_phone}`} className="text-emerald-400 font-mono hover:underline">
                        {res.customer_phone}
                      </a>
                    </div>

                    {res.table_assigned && (
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                        <span className="text-slate-500 font-semibold">ASSIGNED</span>
                        <span className="font-bold text-slate-100">📍 {res.table_assigned}</span>
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
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {res.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'declined')}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'confirmed', 'Table 4')}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        Confirm & Assign
                      </button>
                    </>
                  )}

                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'seated')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Mark Guest Seated</span>
                    </button>
                  )}

                  {res.status === 'seated' && (
                    <span className="text-xs text-slate-400 font-semibold text-center w-full">
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
