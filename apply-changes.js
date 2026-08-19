const fs = require('fs');
const path = require('path');

const basePath = 'C:/Users/OMEN/Desktop/FUCK/Codehub/menucraft/src/app/(admin)/admin';

function replaceTheme(content) {
  return content
    // Backgrounds
    .replace(/bg-slate-900\/80/g, 'bg-white/80')
    .replace(/bg-slate-900\/60/g, 'bg-white')
    .replace(/bg-slate-900/g, 'bg-white')
    .replace(/bg-slate-950\/80/g, 'bg-slate-50/80')
    .replace(/bg-slate-950\/60/g, 'bg-slate-50/60')
    .replace(/bg-slate-950/g, 'bg-slate-50')
    .replace(/bg-slate-800/g, 'bg-slate-50')
    .replace(/bg-slate-700/g, 'bg-slate-100')
    // Text colors
    .replace(/text-white/g, 'text-slate-900')
    .replace(/text-slate-100/g, 'text-slate-900')
    .replace(/text-slate-200/g, 'text-slate-800')
    .replace(/text-slate-300/g, 'text-slate-700')
    .replace(/text-slate-400/g, 'text-slate-500')
    // Borders
    .replace(/border-slate-800\/80/g, 'border-slate-200/80')
    .replace(/border-slate-800/g, 'border-slate-200')
    .replace(/border-slate-700\/60/g, 'border-slate-200/60')
    .replace(/border-slate-700/g, 'border-slate-200')
    .replace(/border-slate-900/g, 'border-slate-200')
    // Accents (Orange/Amber to Blue)
    .replace(/text-orange-400/g, 'text-blue-600')
    .replace(/text-amber-400/g, 'text-amber-500') // keeping some stars amber
    .replace(/bg-orange-500\/20/g, 'bg-blue-600/10')
    .replace(/bg-orange-500/g, 'bg-blue-600')
    .replace(/border-orange-500\/30/g, 'border-blue-600/30')
    .replace(/border-orange-500\/40/g, 'border-blue-600/40')
    .replace(/border-orange-500/g, 'border-blue-600')
    .replace(/ring-orange-500\/30/g, 'ring-blue-600/30')
    .replace(/ring-orange-500/g, 'ring-blue-600')
    .replace(/from-orange-500/g, 'from-blue-600')
    .replace(/to-amber-500/g, 'to-blue-500')
    .replace(/hover:from-orange-600/g, 'hover:from-blue-700')
    .replace(/hover:to-amber-600/g, 'hover:to-blue-600')
    .replace(/hover:bg-orange-500/g, 'hover:bg-blue-600')
    .replace(/hover:text-white/g, 'hover:text-slate-900') // Adjusting hover text in some buttons
    .replace(/text-slate-500 hover:text-slate-900/g, 'text-slate-500 hover:text-slate-800') // fix over-replace
    .replace(/shadow-xl/g, 'shadow-sm')
    .replace(/shadow-lg/g, 'shadow-sm')
    .replace(/shadow-2xl/g, 'shadow-md')
    .replace(/bg-black/g, 'bg-slate-100'); // for the mockup phone
}

// 1. qr-codes/page.tsx
let qrCodes = fs.readFileSync(path.join(basePath, 'qr-codes/page.tsx'), 'utf8');
qrCodes = replaceTheme(qrCodes);
fs.writeFileSync(path.join(basePath, 'qr-codes/page.tsx'), qrCodes);

// 2. menu-preview/page.tsx
let menuPreview = fs.readFileSync(path.join(basePath, 'menu-preview/page.tsx'), 'utf8');
menuPreview = replaceTheme(menuPreview);
// Fix iframe hardcoded URL
menuPreview = menuPreview.replace(
  `const [syncStatus, setSyncStatus] = useState<string | null>(null);`,
  `const [syncStatus, setSyncStatus] = useState<string | null>(null);\n  const [cafeSlug, setCafeSlug] = useState('');\n\n  useEffect(() => {\n    fetch('/api/cafe-config').then(res => res.json()).then(data => setCafeSlug(data.slug || 'chatchaska-cafe')).catch(() => setCafeSlug('chatchaska-cafe'));\n  }, []);`
);
menuPreview = menuPreview.replace(
  `src="/menu/chatchaska-cafe?table=Table%2012"`,
  `src={\`/menu/\${cafeSlug}?table=Table%2012\`}`
);
// Import useEffect
menuPreview = menuPreview.replace(`import React, { useState } from 'react';`, `import React, { useState, useEffect } from 'react';`);
fs.writeFileSync(path.join(basePath, 'menu-preview/page.tsx'), menuPreview);

// 3. reservations/page.tsx
let reservations = fs.readFileSync(path.join(basePath, 'reservations/page.tsx'), 'utf8');
reservations = replaceTheme(reservations);
reservations = reservations.replace(
  `const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');`,
  `const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');\n  const [selectedTables, setSelectedTables] = useState<Record<string, string>>({});\n  const tableOptions = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'];`
);
reservations = reservations.replace(
  `onClick={() => handleUpdateStatus(res.id, 'confirmed', 'Table 4')}`,
  `onClick={() => handleUpdateStatus(res.id, 'confirmed', selectedTables[res.id] || 'Table 1')}`
);
// Add select dropdown for table
reservations = reservations.replace(
  `{res.status === 'pending' && (`,
  `{res.status === 'pending' && (\n                    <div className="w-full space-y-2">\n                      <select\n                        value={selectedTables[res.id] || ''}\n                        onChange={(e) => setSelectedTables({ ...selectedTables, [res.id]: e.target.value })}\n                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-900 mb-2"\n                      >\n                        <option value="" disabled>Select Table...</option>\n                        {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}\n                      </select>\n                      <div className="flex gap-2">`
);
reservations = reservations.replace(
  `Confirm & Assign\n                      </button>\n                    </>`,
  `Confirm & Assign\n                      </button>\n                      </div>\n                    </div>\n                    </>`
);
// Add manual booking button
reservations = reservations.replace(
  `{/* Filter Chips */}`,
  `<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">Add Walk-in</button>\n        {/* Filter Chips */}`
);
fs.writeFileSync(path.join(basePath, 'reservations/page.tsx'), reservations);

// 4. reviews/page.tsx
let reviews = fs.readFileSync(path.join(basePath, 'reviews/page.tsx'), 'utf8');
reviews = replaceTheme(reviews);
reviews = reviews.replace(
  `const [submittingReply, setSubmittingReply] = useState(false);`,
  `const [submittingReply, setSubmittingReply] = useState(false);\n  const [cafeSlug, setCafeSlug] = useState('');`
);
reviews = reviews.replace(
  `const res = await fetch('/api/public/cafes/chatchaska-cafe/reviews');`,
  `const configRes = await fetch('/api/cafe-config');\n        const configData = await configRes.json();\n        const slug = configData.slug || 'chatchaska-cafe';\n        setCafeSlug(slug);\n        const res = await fetch(\`/api/public/cafes/\${slug}/reviews\`);`
);
reviews = reviews.replace(
  `<span className="text-xl font-black text-amber-500">⭐ 4.8</span>`,
  `<span className="text-xl font-black text-amber-500">⭐ {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>`
);
fs.writeFileSync(path.join(basePath, 'reviews/page.tsx'), reviews);

// 5. settings/profile/page.tsx
let profile = fs.readFileSync(path.join(basePath, 'settings/profile/page.tsx'), 'utf8');
profile = replaceTheme(profile);
profile = profile.replace(
  `const [profile, setProfile] = useState({
    name: 'ChatChaska Signature Cafe',
    slug: 'chatchaska-cafe',
    description: 'Authentic gourmet teas, artisan snacks, and delightful street fusion.',
    logo_url: '/chaska-c-logo.png',
    banner_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    address: 'Main Boulevard, Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    cuisine_tags: ['Cafe', 'Tea & Coffee', 'Street Snacks', 'Fast Food'],
    avg_cost_for_two: 350,
    is_pure_veg: true,
    opening_time: '08:00',
    closing_time: '23:00',
    phone: '+91 98765 43210',
    whatsapp: '9876543210',
    instagram: 'chatchaska_official',
    google_maps_url: 'https://maps.google.com/?q=Pune',
  });`,
  `const [profile, setProfile] = useState<any>({ cuisine_tags: [] });`
);
profile = profile.replace(
  `const res = await fetch('/api/admin/profile');`,
  `const res = await fetch('/api/cafe-config');` // Load from cafe-config
);
fs.writeFileSync(path.join(basePath, 'settings/profile/page.tsx'), profile);

// 6. settings/layout.tsx
let layout = fs.readFileSync(path.join(basePath, 'settings/layout.tsx'), 'utf8');
layout = replaceTheme(layout);
layout = layout.replace(/border-orange-500/g, 'border-blue-600').replace(/text-orange-400/g, 'text-blue-600');
fs.writeFileSync(path.join(basePath, 'settings/layout.tsx'), layout);

// 7. staff/page.tsx
let staff = fs.readFileSync(path.join(basePath, 'staff/page.tsx'), 'utf8');
// Fix PIN display
staff = staff.replace(
  `PIN: {s.pin || '****'}`,
  `PIN: ••••`
);
// Add Reset PIN button
staff = staff.replace(
  `title="Edit Staff"`,
  `title="Edit Staff"`
); // Find anchor
staff = staff.replace(
  `<button\n                      onClick={() => handleEdit(s)}\n                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"\n                      title="Edit Staff"\n                    >\n                      <span className="material-symbols-outlined text-[18px]">edit</span>\n                    </button>`,
  `<button
                      onClick={async () => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        alert(\`New PIN for \${s.name} is: \${newPin}. Please note it down.\`);
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
                    </button>`
);
fs.writeFileSync(path.join(basePath, 'staff/page.tsx'), staff);

console.log('Success');
