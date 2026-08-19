"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  contact: string;
  role: "Super Admin" | "Cafe Owner" | "Cashier" | "Waiter" | "Kitchen";
  cafe: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: "1", name: "System Admin", contact: "admin@chatchaska.com", role: "Super Admin", cafe: "All Cafes", status: "Active", lastLogin: "Just now" },
  { id: "2", name: "Rahul Sharma", contact: "rahul@chaipoint.com", role: "Cafe Owner", cafe: "Chai Point Express", status: "Active", lastLogin: "2 hours ago" },
  { id: "3", name: "Priya Patel", contact: "+91 9876543210", role: "Cashier", cafe: "Spice Garden Cafe", status: "Active", lastLogin: "Yesterday" },
  { id: "4", name: "Amit Kumar", contact: "amit.k@breakfast.com", role: "Cafe Owner", cafe: "The Breakfast Club", status: "Active", lastLogin: "5 days ago" },
  { id: "5", name: "Raju", contact: "+91 8765432109", role: "Waiter", cafe: "Royal Dhaba", status: "Inactive", lastLogin: "2 weeks ago" },
];

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [filterRole, setFilterRole] = useState("All");

  const RoleBadge = ({ role }: { role: User["role"] }) => {
    const styles = {
      "Super Admin": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Cafe Owner": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Cashier": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "Waiter": "bg-amber-500/10 text-amber-400 border-amber-500/20",
      "Kitchen": "bg-orange-500/10 text-orange-400 border-orange-500/20"
    };
    return (
      <span className={`px-2.5 py-1 border rounded-md text-xs font-bold ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = filterRole === "All" ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Cross-platform user directory.</p>
        </div>
        <button id="create-user-btn" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Create User
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input type="text" placeholder="Search users by name, email or phone..." className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Cafe Owner">Cafe Owner</option>
            <option value="Cashier">Cashier</option>
            <option value="Waiter">Waiter</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="p-4 text-sm font-semibold text-slate-400">Name & Contact</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Role</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Cafe</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Last Login</th>
                <th className="p-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-800/80">
                  <td className="p-4">
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.contact}</p>
                  </td>
                  <td className="p-4"><RoleBadge role={user.role} /></td>
                  <td className="p-4 text-sm font-medium text-slate-300">{user.cafe}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'Active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{user.lastLogin}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-400"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button className="p-2 text-slate-400 hover:text-rose-400"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
