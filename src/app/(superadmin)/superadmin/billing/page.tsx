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
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Failed: "bg-rose-50 text-rose-700 border-rose-200"
    };
    return (
      <span className={`px-2.5 py-1 border rounded-md text-xs font-bold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative select-none font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Billing Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage subscriptions, revenue, and payment history.</p>
        </div>
        <button 
          id="record-payment-btn"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 px-5 py-2.5 rounded-md font-bold border border-[#B2906A] transition-colors flex items-center gap-2 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
          <p className="text-slate-500 text-sm font-bold mb-2">Monthly Recurring Revenue (MRR)</p>
          <p className="text-3xl font-black text-slate-900">₹45,000</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-6">
          <p className="text-emerald-700 text-sm font-bold mb-2">Collected This Month</p>
          <p className="text-3xl font-black text-emerald-700">₹38,000</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-md p-6">
          <p className="text-rose-700 text-sm font-bold mb-2">Outstanding Dues</p>
          <p className="text-3xl font-black text-rose-700">₹7,000</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cafe</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-500 font-medium">{p.date}</td>
                  <td className="p-4 text-sm font-mono text-slate-500">{p.id}</td>
                  <td className="p-4 font-bold text-slate-900">{p.cafe}</td>
                  <td className="p-4 font-black text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-sm text-slate-500 font-medium">{p.method}</td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Record Manual Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Cafe</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#C3A27C] font-medium">
                  <option>Midnight Kitchen</option>
                  <option>Spice Garden Cafe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Amount (₹)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#C3A27C] font-medium" placeholder="e.g. 2499" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Method</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#C3A27C] font-medium">
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Transaction ID</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#C3A27C] font-medium" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Notes</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#C3A27C] font-medium resize-none h-20" placeholder="Any remarks..."></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 transition-colors text-sm">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md font-bold border border-[#B2906A] transition-colors text-sm shadow-2xs">Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
