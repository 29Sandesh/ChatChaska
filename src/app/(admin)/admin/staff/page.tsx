'use client';

import React, { useState, useEffect } from 'react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cashier');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchStaff = () => {
    fetch('/api/staff')
      .then((r) => r.json())
      .then((d) => { if (d.staff) setStaff(d.staff); });
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pin) return;

    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId || undefined, name, role, pin, phone }),
    });

    showToast(editingId ? `Updated staff "${name}"!` : `Added staff "${name}"!`);
    setName('');
    setPin('');
    setPhone('');
    setRole('Cashier');
    setEditingId(null);
    fetchStaff();
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setName(s.name);
    setRole(s.role);
    setPin(s.pin || '');
    setPhone(s.phone || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPin('');
    setPhone('');
    setRole('Cashier');
  };

  const handleDelete = async (id: string, staffName: string) => {
    if (!confirm(`Remove staff member "${staffName}"?`)) return;

    await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
    showToast(`Removed staff "${staffName}"`);
    fetchStaff();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 select-none">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs">
          <span>✨</span> {toastMsg}
        </div>
      )}

      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">Staff & Login PINs</h1>
        <p className="text-xs text-slate-500 font-medium">Manage cashier, waiter, and kitchen team member PINs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-sm text-slate-900">Active Staff List ({staff.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {staff.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 text-center">No staff members found. Add one on the right.</div>
            ) : (
              staff.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-slate-500 font-medium">{s.role} {s.phone ? `• ${s.phone}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[11px]">
                      PIN: ••••
                    </span>
                    <button
                      onClick={async () => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        alert(`New PIN for ${s.name} is: ${newPin}. Please note it down.`);
                        await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, pin: newPin }) });
                        fetchStaff();
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Reset PIN"
                    >
                      <span className="material-symbols-outlined text-[18px]">key</span>
                    </button>
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Staff"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Staff"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-900">
              {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              placeholder="e.g. Rahul Sharma"
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
            >
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">4-Digit Login PIN *</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              placeholder="4 digits"
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold tracking-widest text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              placeholder="10-digit mobile number"
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-sm transition-all active:scale-95"
          >
            {editingId ? 'Update Staff Member' : 'Save Staff Member'}
          </button>
        </form>
      </div>
    </div>
  );
}

