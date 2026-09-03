import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Search, Filter } from 'lucide-react';

interface TransactionListViewProps {
  transactions: Transaction[];
  onSelectTransaction?: (txId: string) => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.externalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerReference && t.customerReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.order?.orderId && t.order.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvider = providerFilter === 'ALL' || t.providerCode === providerFilter;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 shadow-sm space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-100 font-['Outfit']">Unified Transaction Ledger</h3>
          <p className="text-xs text-gray-400">Normalized payment transaction intake across Razorpay, PhonePe, GPay, Paytm, Bank & POS</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Transaction ID, Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#252525] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00D09C]"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-[#0B0B0B] border border-[#252525] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-gray-900">All Providers</option>
              <option value="RAZORPAY" className="bg-gray-900">Razorpay</option>
              <option value="PHONEPE" className="bg-gray-900">PhonePe</option>
              <option value="GPAY" className="bg-gray-900">Google Pay</option>
              <option value="PAYTM" className="bg-gray-900">Paytm</option>
              <option value="POS" className="bg-gray-900">POS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#181818] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#252525]">
            <tr>
              <th className="px-4 py-3">Txn External ID</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Order Ref</th>
              <th className="px-4 py-3">Customer Ref</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Gateway Fee</th>
              <th className="px-4 py-3 text-right">Net Settled</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525] font-medium">
            {filtered.slice(0, 50).map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx.externalId || tx.id)}
                className="hover:bg-[#1A1A1A] cursor-pointer transition"
              >
                <td className="px-4 py-3 font-mono font-bold text-[#00D09C]">{tx.externalId}</td>
                <td className="px-4 py-3">
                  <span className="bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-bold text-[10px]">
                    {tx.providerCode}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-300">{tx.order?.orderId || 'ORD-1000'}</td>
                <td className="px-4 py-3 text-gray-300 truncate max-w-[150px]">{tx.customerReference || 'N/A'}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-gray-100">₹{tx.amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right font-mono text-amber-400">₹{tx.feeAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right font-mono text-[#00D09C]">₹{tx.netAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tx.status === 'SUCCESS'
                        ? 'bg-[#00D09C]/20 text-[#00D09C] border-[#00D09C]/30'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
