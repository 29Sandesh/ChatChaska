"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Platform Settings</h1>
        <p className="text-slate-400 mt-1">Configure global platform rules and pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding Settings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-500">rocket_launch</span>
            Onboarding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Default Trial Duration (Days)</label>
              <input type="number" defaultValue={14} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Save Settings
            </button>
          </div>
        </div>

        {/* Profile / Security */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-purple-500">shield_person</span>
            Admin Security
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Email Address</p>
              <p className="font-medium text-white mt-0.5">admin@chatchaska.com</p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <button className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full text-left flex justify-between items-center">
                Change Password
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
              <div className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white">Two-Factor Auth</p>
                  <p className="text-xs text-slate-400">Add an extra layer of security</p>
                </div>
                <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">sell</span>
            Pricing Tiers
          </h2>
          <button className="text-blue-500 hover:text-blue-400 text-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Tier
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-sm font-semibold text-slate-400">Plan Name</th>
                <th className="pb-3 text-sm font-semibold text-slate-400">Monthly Price</th>
                <th className="pb-3 text-sm font-semibold text-slate-400">Device Limit</th>
                <th className="pb-3 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr>
                <td className="py-4 font-bold text-white">Basic</td>
                <td className="py-4 font-mono text-slate-300">₹999/mo</td>
                <td className="py-4 text-slate-300">1 Device</td>
                <td className="py-4"><button className="text-blue-500 text-sm font-bold">Edit</button></td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-white">Pro</td>
                <td className="py-4 font-mono text-slate-300">₹2,499/mo</td>
                <td className="py-4 text-slate-300">3 Devices</td>
                <td className="py-4"><button className="text-blue-500 text-sm font-bold">Edit</button></td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-white">Enterprise</td>
                <td className="py-4 font-mono text-slate-300">₹4,999/mo</td>
                <td className="py-4 text-slate-300">Unlimited</td>
                <td className="py-4"><button className="text-blue-500 text-sm font-bold">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Info */}
      <div className="flex justify-between items-center px-4">
        <p className="text-xs font-medium text-slate-500">ChatChaska POS v2.1.0-superadmin</p>
        <p className="text-xs font-medium text-slate-500">Storage Used: 45.2 GB / 100 GB</p>
      </div>
    </div>
  );
}
