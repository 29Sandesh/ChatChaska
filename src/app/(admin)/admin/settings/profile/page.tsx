'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCafeProfilePage() {
  const [profile, setProfile] = useState<Record<string, any>>({ cuisine_tags: [] });

  const [cuisineInput, setCuisineInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cafe-config');
        const data = await res.json();
        if (data) {
          setProfile((prev: any) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const addCuisineTag = () => {
    if (!cuisineInput.trim()) return;
    const currentTags = Array.isArray(profile.cuisine_tags) ? profile.cuisine_tags : [];
    if (!currentTags.includes(cuisineInput.trim())) {
      setProfile((prev: any) => ({
        ...prev,
        cuisine_tags: [...(prev.cuisine_tags || []), cuisineInput.trim()],
      }));
    }
    setCuisineInput('');
  };

  const removeCuisineTag = (tag: string) => {
    setProfile((prev: any) => ({
      ...prev,
      cuisine_tags: (prev.cuisine_tags || []).filter((t: string) => t !== tag),
    }));
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-black">Public Discovery Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            This information is shown to customers on the ChatChaska explore directory and digital menu.
          </p>
        </div>

        {savedSuccess && (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-xl animate-in fade-in">
            ✅ Profile Updated Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Cafe Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Cafe Branding & Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cafe Name *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug (Unique)</label>
              <input
                type="text"
                value={profile.slug}
                onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Short Description</label>
            <textarea
              rows={2}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500"
            />
          </div>

          {/* Cuisine Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cuisine Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.cuisine_tags || []).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-600/10 text-blue-600 border border-blue-600/40 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeCuisineTag(tag)} className="hover:text-slate-900 cursor-pointer">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={cuisineInput}
                onChange={(e) => setCuisineInput(e.target.value)}
                placeholder="Add cuisine tag..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCuisineTag(); } }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={addCuisineTag}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Veg Only & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avg. Cost for Two (₹)</label>
              <input
                type="number"
                value={profile.avg_cost_for_two}
                onChange={(e) => setProfile({ ...profile, avg_cost_for_two: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="vegToggle"
                checked={profile.is_pure_veg}
                onChange={(e) => setProfile({ ...profile, is_pure_veg: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded-md cursor-pointer"
              />
              <label htmlFor="vegToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                Pure Vegetarian Establishment (Green Veg Badge)
              </label>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span>Location & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={profile.whatsapp}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps Link</label>
              <input
                type="url"
                value={profile.google_maps_url}
                onChange={(e) => setProfile({ ...profile, google_maps_url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-slate-900 font-bold py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          <span>{saving ? 'Saving Changes...' : 'Save Public Profile'}</span>
        </button>
      </form>
    </div>
  );
}
