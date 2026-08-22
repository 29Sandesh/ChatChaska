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
      "Super Admin": "bg-purple-50 text-purple-700 border-purple-200",
      "Cafe Owner": "bg-blue-50 text-blue-700 border-blue-200",
      "Cashier": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Waiter": "bg-amber-50 text-amber-700 border-amber-200",
      "Kitchen": "bg-orange-50 text-orange-700 border-orange-200"
    };
    return (
      <span className={`px-2.5 py-1 border rounded-md text-xs font-bold ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = filterRole === "All" ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="space-y-6 select-none font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Cross-platform user directory.</p>
        </div>
        <button id="create-user-btn" className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 px-5 py-2.5 rounded-md font-bold transition-colors flex items-center gap-2 border border-[#B2906A] shadow-2xs">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Create User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search users by name, email or phone..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]" 
            />
          </div>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]"
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
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name & Contact</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cafe</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.contact}</p>
                  </td>
                  <td className="p-4"><RoleBadge role={user.role} /></td>
                  <td className="p-4 text-sm font-medium text-slate-700">{user.cafe}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{user.lastLogin}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-md hover:bg-slate-100"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50"><span className="material-symbols-outlined text-[20px]">delete</span></button>
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
