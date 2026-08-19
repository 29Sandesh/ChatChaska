'use client';

import React, { useState } from 'react';

interface Preset {
  id: string;
  name: string;
  cuisine: string;
  themeColor: string;
  icon: string;
}

const presets: Preset[] = [
  { id: 'bistro', name: 'The Bistro Sphere', cuisine: 'French Continental', themeColor: '#006c49', icon: 'restaurant' },
  { id: 'ramen', name: 'Tokyo Ramen House', cuisine: 'Japanese Noodles', themeColor: '#c026d3', icon: 'ramen_dining' },
  { id: 'taco', name: 'Taco Libre Grill', cuisine: 'Mexican Street Food', themeColor: '#d97706', icon: 'bakery_dining' },
  { id: 'coffee', name: 'Roast & Co.', cuisine: 'Artisan Espresso', themeColor: '#78350f', icon: 'coffee' },
];

export function DemoPresetSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('bistro');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelect = (preset: Preset) => {
    setActivePreset(preset.id);
    setIsOpen(false);
    setToastMessage(`Switched active demo persona to: ${preset.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {toastMessage && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-primary/30 text-on-surface text-xs font-bold shadow-lg animate-fadeIn flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      {isOpen && (
        <div className="mb-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-xl w-64 space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
            <span className="font-label-md font-bold text-xs text-on-surface">DEMO PRESET SWITCHER</span>
            <button onClick={() => setIsOpen(false)} className="text-outline text-xs">✕</button>
          </div>

          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-label-md transition-colors ${
                  activePreset === preset.id
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" style={{ color: preset.themeColor }}>
                    {preset.icon}
                  </span>
                  <div>
                    <p className="font-bold">{preset.name}</p>
                    <p className="text-[10px] opacity-80">{preset.cuisine}</p>
                  </div>
                </div>
                {activePreset === preset.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-5 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">tune</span>
        <span>Demo Presets</span>
      </button>
    </div>
  );
}
