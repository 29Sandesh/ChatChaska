"use client";

import { useState } from "react";

interface Payment {
  id: string;
  date: string;
  cafe: string;
  amount: number;
  method: string;
  status: "Completed" | "Pending" | "Failed";
}

const mockPayments: Payment[] = [
  { id: "TXN1001", date: "2023-10-24 14:30", cafe: "Royal Dhaba", amount: 4999, method: "UPI", status: "Completed" },
  { id: "TXN1002", date: "2023-10-23 09:15", cafe: "Chai Point Express", amount: 2499, method: "Bank Transfer", status: "Completed" },
  { id: "TXN1003", date: "2023-10-22 16:45", cafe: "The Breakfast Club", amount: 999, method: "UPI", status: "Completed" },
  { id: "TXN1004", date: "2023-10-20 11:20", cafe: "Midnight Kitchen", amount: 2499, method: "Manual", status: "Failed" },
];

export default function BillingCenter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments] = useState<Payment[]>(mockPayments);

  const StatusBadge = ({ status }: { status: Payment["status"] }) => {
    const styles = {
      Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Failed: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };
    return (
      <span className={`px-2.5 py-1 border rounded-full text-xs font-bold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Billing Center</h1>
          <p className="text-slate-400 mt-1">Manage subscriptions, revenue, and payment history.</p>
        </div>
        <button 
          id="record-payment-btn"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Monthly Recurring Revenue (MRR)</p>
          <p className="text-3xl font-black text-white">₹45,000</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-emerald-500/80 text-sm font-medium mb-2">Collected This Month</p>
          <p className="text-3xl font-black text-emerald-500">₹38,000</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
          <p className="text-rose-500/80 text-sm font-medium mb-2">Outstanding Dues</p>
          <p className="text-3xl font-black text-rose-500">₹7,000</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="p-4 text-sm font-semibold text-slate-400">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Transaction ID</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Cafe</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Amount</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Method</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-700/30 hover:bg-slate-800/80">
                  <td className="p-4 text-sm text-slate-300">{p.date}</td>
                  <td className="p-4 text-sm font-mono text-slate-400">{p.id}</td>
                  <td className="p-4 font-semibold text-white">{p.cafe}</td>
                  <td className="p-4 font-bold text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-sm text-slate-300">{p.method}</td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-lg text-white">Record Manual Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Cafe</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>Midnight Kitchen</option>
                  <option>Spice Garden Cafe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 2499" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Method</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Transaction ID</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Notes</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Any remarks..."></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 font-medium hover:text-white transition-colors">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
