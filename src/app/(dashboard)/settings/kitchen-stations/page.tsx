'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { DEMO_CATEGORIES } from '@/lib/mockData';

export interface KitchenStation {
  id: string;
  name: string;
  printerName: string;
  categories: string[];
}

export default function KitchenStationsSettingsPage() {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Partial<KitchenStation> | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/kitchen-stations');
      const data = await res.json();
      if (data.stations) {
        setStations(data.stations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenAdd = () => {
    setEditingStation({ name: '', printerName: 'Thermal Printer 1', categories: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: KitchenStation) => {
    setEditingStation(st);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this kitchen station?')) return;
    try {
      await fetch(`/api/kitchen-stations?id=${id}`, { method: 'DELETE' });
      setNotification('Kitchen station deleted.');
      fetchStations();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!editingStation?.name) return;
    try {
      await fetch('/api/kitchen-stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStation),
      });
      setIsModalOpen(false);
      setNotification('Kitchen station saved.');
      fetchStations();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCategory = (catId: string) => {
    if (!editingStation) return;
    const currentCats = editingStation.categories || [];
    const updated = currentCats.includes(catId)
      ? currentCats.filter((c) => c !== catId)
      : [...currentCats, catId];
    setEditingStation({ ...editingStation, categories: updated });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Kitchen Stations & KOT Routing"
        actions={
          <Button variant="primary" className="text-xs" onClick={handleOpenAdd}>
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Add Kitchen Station
          </Button>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Intro Card */}
        <Card>
          <CardHeader>
            <CardTitle>Station-Wise KOT Routing</CardTitle>
            <CardDescription>
              Route kitchen order tickets automatically to specialized kitchen stations (Tandoor, Chinese Wok, Bar, Desserts) and specific thermal printers.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((st) => (
            <Card key={st.id} className="hover:border-primary/40 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined">soup_kitchen</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-surface">{st.name}</h3>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">print</span>
                        {st.printerName || 'Default KOT Printer'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(st)}
                      className="btn-icon text-outline hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="btn-icon text-outline hover:text-rose-500"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                    Assigned Menu Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {st.categories && st.categories.length > 0 ? (
                      st.categories.map((catId) => {
                        const cat = DEMO_CATEGORIES.find((c) => c.id === catId);
                        return (
                          <span
                            key={catId}
                            className="px-2.5 py-1 bg-surface-container-high text-on-surface rounded-lg text-xs font-medium"
                          >
                            {cat ? cat.name : catId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs italic text-outline">No categories assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit / Add Station Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStation?.id ? 'Edit Kitchen Station' : 'Add Kitchen Station'}
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">
              Station Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Tandoor & Grill"
              value={editingStation?.name || ''}
              onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">
              Target Thermal Printer Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Thermal Printer 2"
              value={editingStation?.printerName || ''}
              onChange={(e) =>
                setEditingStation({ ...editingStation, printerName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant block">
              Assigned Categories (Items in these categories will route to this station):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CATEGORIES.map((cat) => {
                const isChecked = editingStation?.categories?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      isChecked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Station
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
