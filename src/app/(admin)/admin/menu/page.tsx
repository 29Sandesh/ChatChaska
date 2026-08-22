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

  // Bulk Selection
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number>(0);

  // AI Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
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

  // Category Manager Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍽️');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon }),
      });
      if (res.ok) {
        showToast('Category created!');
        setNewCatName('');
        fetchCategories();
      }
    } catch {
      showToast('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Category deleted');
        fetchCategories();
      }
    } catch {
      showToast('Failed to delete category');
    }
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

  // Handle AI Menu Photo Upload (supports multiple images)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanResult(null);

    let totalAdded = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/ai/extract-menu', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.itemsAdded > 0) {
          totalAdded += data.itemsAdded;
        }
      }

      if (totalAdded > 0) {
        setScanResult({
          count: totalAdded,
          message: `Vision AI added ${totalAdded} dishes from ${files.length} menu photo(s)!`,
        });
        showToast(`🎉 Vision AI added ${totalAdded} dishes!`);
        fetchItems();
        fetchCategories();
      } else {
        showToast('No dishes could be extracted from the uploaded photo(s)');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while scanning menu');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAutoCategorize = async () => {
    setIsAutoCategorizing(true);
    try {
      const res = await fetch('/api/ai/auto-categorize', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Dishes auto-categorized!');
        fetchItems();
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to auto-categorize');
      }
    } catch {
      showToast('Network error during auto-categorization');
    } finally {
      setIsAutoCategorizing(false);
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

  // Inline Price Editing Handlers
  const handleStartEditingPrice = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setEditingPriceValue(item.price);
  };

  const handleSaveInlinePrice = async (itemId: string) => {
    if (editingPriceValue <= 0) return;
    try {
      // Optimistic update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, price: editingPriceValue } : i));
      setEditingPriceId(null);

      const res = await fetch('/api/menu-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, price: editingPriceValue }),
      });

      if (res.ok) {
        showToast(`Price updated to ₹${editingPriceValue}!`);
      } else {
        fetchItems();
      }
    } catch {
      fetchItems();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Bulk selection helpers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItemIds(filteredItems.map(i => i.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStockUpdate = async (available: boolean) => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    // Optimistic update
    setItems(prev => prev.map(i => selectedItemIds.includes(i.id) ? { ...i, available } : i));
    
    try {
      await Promise.all(
        selectedItemIds.map(id => 
          fetch('/api/menu-items', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, available }),
          })
        )
      );
      showToast(`Bulk updated ${count} items to ${available ? 'Available' : 'Sold Out'}`);
      setSelectedItemIds([]);
    } catch (err) {
      fetchItems();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5 select-none relative">
      {/* Sticky Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-3 rounded-md shadow-2xl flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom-10 fade-in">
          <div className="text-sm font-bold text-slate-200 whitespace-nowrap">
            Selected ({selectedItemIds.length})
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStockUpdate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold transition-colors cursor-pointer"
            >
              ✓ Mark as Available
            </button>
            <button
              onClick={() => handleBulkStockUpdate(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-md text-xs font-bold transition-colors cursor-pointer"
            >
              ✕ Mark as Sold Out
            </button>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => setSelectedItemIds([])}
            className="text-xs text-slate-400 hover:text-white font-medium whitespace-nowrap cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 font-bold px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 border border-slate-700 text-xs text-white">
          <span>✨</span> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu</h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Upload New Menu Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            id="menu-photo-upload"
            disabled={isScanning}
          />
          <label
            htmlFor="menu-photo-upload"
            className={`cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 ${
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
                <span>Upload New Menu</span>
              </>
            )}
          </label>

          <button
            type="button"
            disabled={isAutoCategorizing}
            onClick={handleAutoCategorize}
            className="bg-[#FAF7F2] hover:bg-[#C3A27C]/20 text-slate-900 border border-[#C3A27C]/50 font-bold px-3 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Automatically sort all dishes into predefined categories based on keywords"
          >
            <span className="material-symbols-outlined text-[16px] text-[#C3A27C]">bolt</span>
            <span>{isAutoCategorizing ? 'Sorting...' : 'Auto-Sort Categories'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCatModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-3 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-extrabold px-3.5 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Dish</span>
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{scanResult.message}</span>
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-md border border-slate-200/80 shadow-2xs">
        <div className="w-full sm:w-64 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 outline-none font-medium"
          />
        </div>

        {/* Categories Bar with no-scrollbar and no emojis */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            const cleanName = cat.name.replace(/[\p{Emoji}\u200d]+/gu, '').trim() || cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cleanName}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-black ${
                    isSelected ? 'bg-black/15 text-slate-950' : 'bg-slate-200 text-slate-700'
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
      <div className="bg-white border border-slate-200/80 rounded-md overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-100 font-bold text-xs text-slate-900 flex justify-between items-center">
          <span>Showing {filteredItems.length} dishes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedItemIds.length === filteredItems.length}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="accent-[#C3A27C] cursor-pointer w-3.5 h-3.5 rounded-sm"
                  />
                </th>
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
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleToggleSelectItem(item.id)}
                        className="accent-[#C3A27C] cursor-pointer w-3.5 h-3.5 rounded-sm"
                      />
                    </td>
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
                        {categories.find((c) => c.id === item.category)?.name?.replace(/[\p{Emoji}\u200d]+/gu, '').trim() || item.category}
                      </span>
                    </td>
                    <td className="p-3 font-black text-slate-900 group">
                      {editingPriceId === item.id ? (
                        <div className="flex items-center gap-1 relative">
                          <span className="absolute left-2 text-slate-500 font-medium">₹</span>
                          <input
                            type="number"
                            autoFocus
                            value={editingPriceValue}
                            onChange={(e) => setEditingPriceValue(Number(e.target.value))}
                            onBlur={() => handleSaveInlinePrice(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlinePrice(item.id);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            className="w-20 pl-5 pr-2 py-1 rounded-md border border-[#C3A27C] outline-none shadow-sm text-xs font-black text-slate-900 bg-white"
                          />
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded-md transition-colors w-max"
                          onClick={() => handleStartEditingPrice(item)}
                        >
                          ₹{item.price}
                          <span className="material-symbols-outlined text-[14px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleItemAvailable(item)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
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
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-[#C3A27C]/20 rounded-lg transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-md p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingItem ? '✏️ Edit Menu Dish' : '➕ Add Menu Dish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer"
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
                  className="w-full p-2.5 rounded-md border border-slate-300 focus:border-[#C3A27C] outline-none font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-slate-300 focus:border-[#C3A27C] outline-none font-medium text-slate-900 text-xs"
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
                    className="w-full p-2.5 rounded-md border border-slate-300 focus:border-[#C3A27C] outline-none font-black text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">Dietary Type</label>
                <div className="flex gap-4 p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vegType"
                      checked={formVeg}
                      onChange={() => setFormVeg(true)}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-emerald-700 font-bold text-xs">🟢 Veg</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vegType"
                      checked={!formVeg}
                      onChange={() => setFormVeg(false)}
                      className="accent-rose-600 cursor-pointer"
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
                  className="w-full p-2.5 rounded-md border border-slate-300 focus:border-[#C3A27C] outline-none font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-md border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {editingItem ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">📁 Manage Menu Categories</h3>
                <p className="text-[11px] text-slate-500">Add, rename, or remove categories from your POS menu.</p>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Add Category Form */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Emoji (e.g. 🍕, ☕)"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-16 p-2 rounded-md border border-slate-300 text-center text-sm outline-none focus:border-[#C3A27C]"
              />
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Desserts)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 rounded-md border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#C3A27C]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer"
              >
                + Add
              </button>
            </form>

            {/* List of Existing Categories */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon || '🍽️'}</span>
                      <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-200 px-1.5 py-0.5 rounded-full">
                        {count} dishes
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs font-bold cursor-pointer"
                      title="Delete category"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
