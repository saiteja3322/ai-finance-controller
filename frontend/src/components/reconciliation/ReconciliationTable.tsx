import React, { useState } from 'react';
import { FinancialException } from '../../types';
import { Search, Filter, Bot } from 'lucide-react';

interface ReconciliationTableProps {
  exceptions: FinancialException[];
  onInvestigate: (exceptionId: string) => void;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  exceptions,
  onInvestigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredExceptions = exceptions.filter((exc) => {
    const matchesSearch =
      exc.exceptionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.providerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exc.order?.orderId && exc.order.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = filterSeverity === 'ALL' || exc.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 shadow-sm space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-100 font-['Outfit']">Financial Exceptions Ledger</h3>
          <p className="text-xs text-gray-400">Multi-way reconciliation mismatches, payout shortfalls & fee anomalies</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Order ID, Code, Provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#252525] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00D09C]"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-[#0B0B0B] border border-[#252525] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-gray-900">All Severities</option>
              <option value="HIGH" className="bg-gray-900">High Severity</option>
              <option value="MEDIUM" className="bg-gray-900">Medium Severity</option>
              <option value="LOW" className="bg-gray-900">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exception Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#181818] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#252525]">
            <tr>
              <th className="px-4 py-3">Code / ID</th>
              <th className="px-4 py-3">Order Ref</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Issue Title</th>
              <th className="px-4 py-3 text-right">Expected</th>
              <th className="px-4 py-3 text-right">Actual</th>
              <th className="px-4 py-3 text-right">Difference</th>
              <th className="px-4 py-3 text-center">Severity</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525] font-medium">
            {filteredExceptions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No matching financial exceptions found.
                </td>
              </tr>
            ) : (
              filteredExceptions.map((exc) => (
                <tr key={exc.id} className="hover:bg-[#1A1A1A] transition">
                  <td className="px-4 py-3 font-mono font-bold text-[#00D09C]">{exc.exceptionCode}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">{exc.order?.orderId || 'ORD-1000'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-bold text-[10px]">
                      {exc.providerCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-200">{exc.title}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{exc.expectedAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{exc.actualAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-400 font-bold">
                    ₹{exc.difference.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        exc.severity === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : exc.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {exc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onInvestigate(exc.id)}
                      className="inline-flex items-center space-x-1.5 bg-[#00D09C] hover:bg-[#00B88A] text-black px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm transition"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
