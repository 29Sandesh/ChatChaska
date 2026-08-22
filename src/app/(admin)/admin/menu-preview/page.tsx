'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMenuPreviewPage() {
  const [cafeSlug, setCafeSlug] = useState('chatchaska-cafe');

  useEffect(() => {
    fetch('/api/cafe-config')
      .then((res) => res.json())
      .then((data) => setCafeSlug(data.slug || 'chatchaska-cafe'))
      .catch(() => setCafeSlug('chatchaska-cafe'));
  }, []);

  return (
    <div className="flex justify-center items-center py-6 min-h-[calc(100vh-4rem)] select-none">
      {/* Mobile Device Frame */}
      <div className="w-[380px] h-[780px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Live Mobile QR Menu */}
        <iframe
          src={`/menu/${cafeSlug}?table=Table%201`}
          title="Customer Mobile Menu Preview"
          className="w-full h-full rounded-[38px] bg-white border-0 overflow-hidden"
        />
      </div>
    </div>
  );
}
