"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl select-none font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Configure global platform rules and pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding Settings */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-700 text-lg">rocket_launch</span>
            </div>
            Onboarding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Default Trial Duration (Days)</label>
              <input 
                type="number" 
                defaultValue={90} 
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#C3A27C] transition-colors" 
              />
              <p className="text-xs text-slate-400 mt-1 font-medium">Standard trial period: 90 days (3 months)</p>
            </div>
            <button className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-4 py-2 rounded-md border border-[#B2906A] text-sm transition-colors shadow-2xs">
              Save Settings
            </button>
          </div>
        </div>

        {/* Profile / Security */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-700 text-lg">shield_person</span>
            </div>
            Admin Security
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-500">Email Address</p>
              <p className="font-bold text-slate-900 mt-0.5">admin@chatchaska.com</p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <button className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-md text-sm font-bold transition-colors w-full text-left flex justify-between items-center">
                Change Password
                <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
              </button>
              <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500 font-medium">Add an extra layer of security</p>
                </div>
                <div className="w-10 h-6 bg-[#C3A27C] rounded-full relative cursor-pointer border border-[#B2906A]">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-700 text-lg">sell</span>
            </div>
            Pricing Tiers
          </h2>
          <button className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold text-sm px-3.5 py-1.5 rounded-md border border-[#B2906A] flex items-center gap-1 transition-colors shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Tier
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Plan Name</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Monthly Price</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Device Limit</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Basic</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹999/mo</td>
                <td className="p-4 font-medium text-slate-600">1 Device</td>
                <td className="p-4"><button className="text-[#967751] hover:text-[#7A5F3E] text-sm font-bold transition-colors">Edit</button></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Pro</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹2,499/mo</td>
                <td className="p-4 font-medium text-slate-600">3 Devices</td>
                <td className="p-4"><button className="text-[#967751] hover:text-[#7A5F3E] text-sm font-bold transition-colors">Edit</button></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Enterprise</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹4,999/mo</td>
                <td className="p-4 font-medium text-slate-600">Unlimited</td>
                <td className="p-4"><button className="text-[#967751] hover:text-[#7A5F3E] text-sm font-bold transition-colors">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics / Platform Info */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
        <p className="text-xs font-bold text-slate-500">ChatChaska POS v2.1.0-superadmin</p>
        <p className="text-xs font-bold text-slate-500">Storage Used: 45.2 GB / 100 GB</p>
      </div>
    </div>
  );
}
