import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProviderDetailsDrawerProps {
  providerCode: string | null;
  onClose: () => void;
  onSelectTransaction: (txId: string) => void;
  onInvestigateAI: (prompt: string) => void;
  startDate?: string;
  endDate?: string;
}

export const ProviderDetailsDrawer: React.FC<ProviderDetailsDrawerProps> = ({
  providerCode,
  onClose,
  onSelectTransaction,
  onInvestigateAI,
  startDate,
  endDate,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchProviderData = async () => {
    if (!providerCode) return;
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.set('startDate', startDate);
      if (endDate) queryParams.set('endDate', endDate);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const res = await fetch(`/api/providers/${encodeURIComponent(providerCode)}?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch provider details (status ${res.status})`);
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Unable to load provider payment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerCode) {
      fetchProviderData();
      setCurrentPage(1);
    } else {
      setData(null);
    }
  }, [providerCode, startDate, endDate]);

  // Debounced search inside drawer
  useEffect(() => {
    if (!providerCode) return;
    const timer = setTimeout(() => {
      fetchProviderData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && providerCode) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [providerCode, onClose]);

  if (!providerCode) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatCompactINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const summary = data?.summary || {};
  const transactions = data?.transactions || [];
  const statusBreakdown = data?.statusBreakdown || {};
  const settlementSummary = data?.settlementSummary || {};

  // Pagination slicing
  const totalTx = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalTx / pageSize));
  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const providerDisplayName = providerCode === 'GPAY' ? 'Google Pay' : providerCode;

  const sampleAiQuestions = [
    `Why are ${providerDisplayName} settlements lower than payments?`,
    `What is ${providerDisplayName}'s failure rate?`,
    `Show ${providerDisplayName} reconciliation issues.`,
    `Which ${providerDisplayName} transactions need attention?`,
    `What are ${providerDisplayName}'s total fees?`,
  ];

  return (
    <>
      {/* Non-blocking Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Right-Side Slide-Over Drawer Container */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg lg:max-w-xl h-full flex flex-col bg-[#0B0B0B] border-l border-[#252525] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200 text-xs">
        {/* 1. Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-[#141414] border-b border-[#252525] px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#00D09C]/10 border border-[#00D09C]/20 flex items-center justify-center font-black text-xs text-[#00D09C] font-mono">
              {providerCode.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-['Outfit'] leading-tight">{providerDisplayName}</h3>
                <span className="text-[10px] font-semibold bg-[#00D09C]/20 text-[#00D09C] border border-[#00D09C]/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] animate-pulse" />
                  <span>Connected</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Payment Provider Details</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Ask AI Action */}
            <button
              onClick={() => onInvestigateAI(`Investigate ${providerDisplayName} performance: ${sampleAiQuestions[0]}`)}
              className="flex items-center space-x-1 bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-2.5 py-1.5 rounded-lg text-xs shadow-md transition"
            >
              <Bot className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg transition hover:bg-[#1A1A1A]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Drawer Internal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center space-y-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#00D09C]" />
              <span className="text-xs font-semibold">Fetching {providerDisplayName} audit records...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl text-center space-y-2">
              <p className="font-bold text-xs">⚠️ {error}</p>
              <button
                onClick={fetchProviderData}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 mx-auto transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <>
              {/* Compact 2-Column KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Volume</span>
                  <div className="text-sm sm:text-base font-black text-white font-['Outfit']">{formatCompactINR(summary.totalVolume || 0)}</div>
                  <span className="text-[10px] text-[#00D09C] font-semibold block">Gross Sales</span>
                </div>

                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Transactions</span>
                  <div className="text-sm sm:text-base font-black text-gray-100 font-['Outfit']">{(summary.transactionCount || 0).toLocaleString()}</div>
                  <span className="text-[10px] text-gray-400 font-semibold block">Total Count</span>
                </div>

                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Success Rate</span>
                  <div className="text-sm sm:text-base font-black text-[#00D09C] font-['Outfit']">{summary.successRate || '100%'}</div>
                  <span className="text-[10px] text-gray-400 font-semibold block">Auth Success</span>
                </div>

                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Refunds</span>
                  <div className="text-sm sm:text-base font-black text-purple-400 font-['Outfit']">{formatCompactINR(summary.refundAmount || 0)}</div>
                  <span className="text-[10px] text-purple-400/80 font-semibold block">Processed</span>
                </div>

                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Gateway Fees</span>
                  <div className="text-sm sm:text-base font-black text-amber-400 font-['Outfit']">{formatCompactINR(summary.feeAmount || 0)}</div>
                  <span className="text-[10px] text-amber-400/80 font-semibold block">MDR Paid</span>
                </div>

                <div className="bg-[#141414] border border-[#252525] p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Net Settled</span>
                  <div className="text-sm sm:text-base font-black text-[#00D09C] font-['Outfit']">{formatCompactINR(summary.netSettled || 0)}</div>
                  <span className="text-[10px] text-[#00D09C]/80 font-semibold block">Realized Bank</span>
                </div>
              </div>

              {/* Status Breakdown & Settlement Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status Breakdown */}
                <div className="bg-[#141414] border border-[#252525] rounded-xl p-3 space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-200 uppercase tracking-wider font-['Outfit']">Status Breakdown</h4>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-[#0B0B0B] border border-[#00D09C]/20 p-2 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">SUCCESS</span>
                      <span className="font-mono font-bold text-[#00D09C]">{statusBreakdown.SUCCESS || 0}</span>
                    </div>
                    <div className="bg-[#0B0B0B] border border-amber-500/20 p-2 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">PENDING</span>
                      <span className="font-mono font-bold text-amber-400">{statusBreakdown.PENDING || 0}</span>
                    </div>
                    <div className="bg-[#0B0B0B] border border-red-500/20 p-2 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">FAILED</span>
                      <span className="font-mono font-bold text-red-400">{statusBreakdown.FAILED || 0}</span>
                    </div>
                    <div className="bg-[#0B0B0B] border border-purple-500/20 p-2 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">REFUNDED</span>
                      <span className="font-mono font-bold text-purple-400">{statusBreakdown.REFUNDED || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Settlement Summary */}
                <div className="bg-[#141414] border border-[#252525] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-gray-200 uppercase tracking-wider font-['Outfit']">Settlement Summary</h4>
                    <span className="text-[10px] font-mono text-[#00D09C] font-bold">
                      Rec: {settlementSummary.reconciliationRate || '96.2%'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between bg-[#0B0B0B] border border-[#252525] p-1.5 rounded-lg">
                      <span className="text-gray-400">Expected:</span>
                      <span className="font-bold text-[#00D09C]">{formatCompactINR(settlementSummary.expectedAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between bg-[#0B0B0B] border border-[#252525] p-1.5 rounded-lg">
                      <span className="text-gray-400">Actual Payout:</span>
                      <span className="font-bold text-[#00D09C]">{formatCompactINR(settlementSummary.actualAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Quick Questions */}
              <div className="bg-[#141414] border border-[#252525] rounded-xl p-3 space-y-2">
                <div className="flex items-center space-x-1.5 text-[#00D09C] font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#00D09C] animate-pulse" />
                  <span>Ask AI About {providerDisplayName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sampleAiQuestions.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onInvestigateAI(`Investigate ${providerDisplayName}: ${q}`)}
                      className="bg-[#0B0B0B] hover:bg-[#1A1A1A] text-gray-300 hover:text-white border border-[#252525] hover:border-[#00D09C]/40 px-2.5 py-1 rounded-full text-[10px] transition"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Transactions Section */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-['Outfit']">
                    Payment Transactions ({totalTx})
                  </h4>

                  {/* Search input */}
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#141414] border border-[#252525] rounded-xl pl-8 pr-3 py-1 text-[11px] text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00D09C] w-full sm:w-48"
                    />
                  </div>
                </div>

                {/* Compact Transaction List Items */}
                {paginatedTransactions.length === 0 ? (
                  <div className="p-6 border border-[#252525] rounded-xl text-center text-gray-400 space-y-1">
                    <p className="font-semibold text-xs text-gray-200">No payment transactions found for {providerDisplayName}</p>
                    <p className="text-[11px] text-gray-500">Try clearing your search query or selecting a broader date range.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {paginatedTransactions.map((tx: any) => {
                      const dateStr = new Date(tx.transactionDate || tx.createdAt).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const method = tx.metadata ? (JSON.parse(tx.metadata || '{}').paymentMethod || 'UPI') : 'UPI';

                      return (
                        <div
                          key={tx.id}
                          onClick={() => onSelectTransaction(tx.externalId || tx.id)}
                          className="bg-[#141414] hover:bg-[#1E1E1E] border border-[#252525] hover:border-[#00D09C]/40 p-3 rounded-xl cursor-pointer transition flex items-center justify-between group shadow-sm"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white text-xs group-hover:text-[#00D09C] transition-colors">
                                {tx.externalId || tx.id}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                  tx.status === 'SUCCESS'
                                    ? 'bg-[#00D09C]/20 text-[#00D09C] border-[#00D09C]/30'
                                    : tx.status === 'PENDING'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}
                              >
                                {tx.status}
                              </span>
                              <span className="text-[9px] uppercase font-mono bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-1 py-0.2 rounded">
                                {method}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {dateStr} • {tx.order?.orderId || tx.orderId || 'ORD-1000'}
                            </div>
                          </div>

                          <div className="text-right flex items-center space-x-2">
                            <div>
                              <span className="font-mono font-extrabold text-[#00D09C] text-xs block">
                                {formatINR(tx.amount)}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono block">
                                Fee: {formatINR(tx.feeAmount || Math.round(tx.amount * 0.02))}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono">
                    <span className="text-gray-400">
                      Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalTx)} of {totalTx}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 rounded-lg border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] disabled:opacity-50 text-gray-300 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-2.5 py-1 bg-[#141414] border border-[#252525] rounded-lg text-white font-bold">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 rounded-lg border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] disabled:opacity-50 text-gray-300 transition"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
