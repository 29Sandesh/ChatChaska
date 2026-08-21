'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { CloudReservation } from '@/types';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<CloudReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');
  const [selectedTables, setSelectedTables] = useState<Record<string, string>>({});
  const tableOptions = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'];

  // Walk-in modal state
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinGuests, setWalkinGuests] = useState('2');
  const [walkinTable, setWalkinTable] = useState('Table 1');
  const [walkinTime, setWalkinTime] = useState('');

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: walkinName,
          customer_phone: walkinPhone,
          guest_count: parseInt(walkinGuests),
          reservation_date: new Date().toISOString().split('T')[0],
          time_slot: walkinTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'seated',
          table_assigned: walkinTable
        }),
      });

      if (res.ok) {
        // Show success toast (basic alert for simplicity here, replace with real toast system if any)
        alert('Walk-in reservation added successfully!');
        setIsWalkinOpen(false);
        // Reset form
        setWalkinName('');
        setWalkinPhone('');
        setWalkinGuests('2');
        setWalkinTable('Table 1');
        setWalkinTime('');
        // Refresh list
        load();
      }
    } catch (err) {
      console.error('Error adding walk-in:', err);
    }
  };

  const filtered = reservations
    .filter((r) => {
      if (filter === 'all') return true;
      return r.status === filter;
    })
    .sort((a, b) => {
      // Time-based sorting for reservations
      const dateA = new Date(`${a.reservation_date}T${a.time_slot || '00:00'}:00`);
      const dateB = new Date(`${b.reservation_date}T${b.time_slot || '00:00'}:00`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-slate-900">table_restaurant</span>
            <h1 className="text-2xl font-black">Table Reservations & Bookings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage advance table booking requests from your discovery profile and assign tables.
          </p>
        </div>

        <button 
          onClick={() => setIsWalkinOpen(true)}
          className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm"
        >
          Add Walk-in
        </button>

        {/* Filter Chips */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md p-1 gap-1">
          {['all', 'pending', 'confirmed', 'seated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === f ? 'bg-[#C3A27C] text-slate-950 border border-[#B2906A] shadow-md' : 'text-slate-500 hover:text-slate-800 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Walk-in Modal */}
      {isWalkinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Add Walk-in Reservation</h2>
              <button 
                onClick={() => setIsWalkinOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddWalkin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input 
                  required
                  type="text" 
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-hidden focus:border-[#C3A27C]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-hidden focus:border-[#C3A27C]"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guests</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={walkinGuests}
                    onChange={(e) => setWalkinGuests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-hidden focus:border-[#C3A27C]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time (Optional)</label>
                  <input 
                    type="time" 
                    value={walkinTime}
                    onChange={(e) => setWalkinTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-hidden focus:border-[#C3A27C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Table</label>
                <select 
                  value={walkinTable}
                  onChange={(e) => setWalkinTable(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-hidden focus:border-[#C3A27C]"
                >
                  {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsWalkinOpen(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-sm font-bold shadow-sm transition-all"
                >
                  Seat Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservations Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 h-28 rounded-md animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs">
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
                className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{res.customer_name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-sm border ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                          : res.status === 'seated'
                          ? 'bg-[#C3A27C]/20 text-slate-900 border-[#B2906A]/40'
                          : res.status === 'declined'
                          ? 'bg-rose-500/20 text-rose-600 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="bg-slate-50/60 p-3 rounded-md border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">GUESTS</span>
                      <span className="font-bold text-slate-900">👥 {res.guest_count} Persons</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">DATE & TIME</span>
                      <span className="font-medium">{res.reservation_date} • {res.time_slot}</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-semibold">PHONE</span>
                      <a href={`tel:${res.customer_phone}`} className="text-emerald-500 font-mono hover:underline">
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
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-md text-[11px] text-amber-600">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-900 mb-2 focus:outline-hidden focus:border-[#C3A27C]"
                      >
                        <option value="" disabled>Select Table...</option>
                        {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'declined')}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-md text-xs font-bold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'confirmed', selectedTables[res.id] || 'Table 1')}
                          className="flex-1 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] py-2 rounded-md text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          Confirm &amp; Assign
                        </button>
                      </div>
                    </div>
                  )}

                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'seated')}
                      className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] py-2 rounded-md text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
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
