'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  popular?: boolean;
  veg?: boolean;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  sort_order: number;
  visible: boolean;
  icon: string;
}

export default function MenuManagerPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // AI Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ count: number; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Item Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('starters');
  const [formPrice, setFormPrice] = useState<number>(150);
  const [formVeg, setFormVeg] = useState(true);
  const [formDescription, setFormDescription] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu-items');
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !formCategory) {
          setFormCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  // Handle AI Menu Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/extract-menu', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScanResult({
          count: data.itemsAdded || 0,
          message: data.message || `Added ${data.itemsAdded} dishes to your menu!`,
        });
        showToast(`🎉 AI added ${data.itemsAdded} dishes!`);
        fetchItems();
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to scan menu image');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while scanning menu');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleItemAvailable = async (item: MenuItem) => {
    const nextStatus = !item.available;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: nextStatus } : i))
    );

    try {
      await fetch('/api/menu-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, available: nextStatus }),
      });
      showToast(`${item.name} set to ${nextStatus ? 'Available 🟢' : 'Sold Out 🔴'}`);
    } catch (err) {
      fetchItems();
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(categories[0]?.id || 'starters');
    setFormPrice(150);
    setFormVeg(true);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormVeg(item.veg !== false);
    setFormDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingItem) {
        const res = await fetch('/api/menu-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            name: formName,
            category: formCategory,
            price: formPrice,
            veg: formVeg,
            description: formDescription,
          }),
        });

        if (res.ok) {
          showToast(`Updated "${formName}"!`);
          setIsModalOpen(false);
          fetchItems();
        }
      } else {
        const res = await fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            price: formPrice,
            veg: formVeg,
            description: formDescription,
            available: true,
          }),
        });

        if (res.ok) {
          showToast(`Added "${formName}"!`);
          setIsModalOpen(false);
          fetchItems();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}" from your menu?`)) return;

    try {
      const res = await fetch(`/api/menu-items?id=${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Deleted "${item.name}"`);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs">
          <span>✨</span> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu & Dishes</h1>
          <p className="text-xs text-slate-500 font-medium">
            {items.length} total dishes • AI category assignment
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          + Add Dish
        </button>
      </div>

      {/* Minimal AI Menu Scanner Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            📸
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Scan Menu Photo with AI</span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase">
                Groq Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Upload a menu photo to automatically extract dishes, prices & categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            id="menu-photo-upload"
            disabled={isScanning}
          />
          <label
            htmlFor="menu-photo-upload"
            className={`cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 ${
              isScanning ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isScanning ? (
              <>
                <span className="animate-spin text-xs">⏳</span>
                <span>Reading menu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>Upload Menu Photo</span>
              </>
            )}
          </label>
        </div>
      </div>

      {scanResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{scanResult.message}</span>
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="w-full sm:w-64 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 outline-none font-medium"
          />
        </div>

        {/* Categories Bar with no-scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon || '🍽️'}</span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-100 font-bold text-xs text-slate-900 flex justify-between items-center">
          <span>Showing {filteredItems.length} dishes</span>
          <span className="text-[11px] text-slate-400 font-normal">Categories auto-managed by AI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Dish Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span
                        className={`w-3.5 h-3.5 rounded-xs border-2 inline-flex items-center justify-center ${
                          item.veg !== false ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.veg !== false ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {categories.find((c) => c.id === item.category)?.name || item.category}
                      </span>
                    </td>
                    <td className="p-3 font-black text-blue-600">₹{item.price}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleItemAvailable(item)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.available ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {item.available ? 'AVAILABLE (ON)' : 'SOLD OUT (OFF)'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Dish"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Dish"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT DISH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingItem ? '✏️ Edit Menu Dish' : '➕ Add Menu Dish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-600">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-black text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">Dietary Type</label>
                <div className="flex gap-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vegType"
                      checked={formVeg}
                      onChange={() => setFormVeg(true)}
                      className="accent-emerald-600"
                    />
                    <span className="text-emerald-700 font-bold text-xs">🟢 Veg</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vegType"
                      checked={!formVeg}
                      onChange={() => setFormVeg(false)}
                      className="accent-rose-600"
                    />
                    <span className="text-rose-700 font-bold text-xs">🔴 Non-Veg</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short description of the dish"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm active:scale-95 transition-all"
                >
                  {editingItem ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
