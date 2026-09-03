import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_finance_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Global Ctrl+K / Cmd+K and Escape keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent('open-global-search'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Live debounced search API query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`);
        }
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (err: any) {
        setError(err.message || 'Error fetching search results from backend');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSaveRecent = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('ai_finance_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleItemClick = (item: any) => {
    handleSaveRecent(item.id || query);
    onSelectResult(item);
    onClose();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleItemClick(results[selectedIndex] || results[0]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    }
  };

  if (!isOpen) return null;

  // Group results by type: TRANSACTIONS, ORDERS, SETTLEMENTS, REFUNDS, EXCEPTIONS
  const groupedResults: Record<string, any[]> = {
    TRANSACTIONS: [],
    ORDERS: [],
    SETTLEMENTS: [],
    REFUNDS: [],
    EXCEPTIONS: [],
  };

  results.forEach((item) => {
    const t = (item.type || '').toUpperCase();
    if (t === 'TRANSACTION') groupedResults.TRANSACTIONS.push(item);
    else if (t === 'ORDER') groupedResults.ORDERS.push(item);
    else if (t === 'SETTLEMENT') groupedResults.SETTLEMENTS.push(item);
    else if (t === 'REFUND') groupedResults.REFUNDS.push(item);
    else if (t === 'EXCEPTION') groupedResults.EXCEPTIONS.push(item);
    else groupedResults.TRANSACTIONS.push(item);
  });

  const categories = Object.keys(groupedResults).filter((cat) => groupedResults[cat].length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-[#141414] border border-[#252525] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
        {/* Search Input Header Bar */}
        <div className="p-4 border-b border-[#252525] bg-[#141414] flex items-center space-x-3">
          <Search className="w-5 h-5 text-[#00D09C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions, orders, settlements, refunds... (e.g. TXN-10025)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none font-medium"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#00D09C] animate-spin shrink-0" />
          ) : (
            <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-mono bg-[#1E1E1E] border border-[#252525] px-2 py-0.5 rounded">
              <span>ESC</span>
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#00D09C]" />
              <span className="text-xs font-semibold">Querying live financial database...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Recent Searches (when query is empty) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <Clock className="w-3 h-3 text-[#00D09C]" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="bg-[#0B0B0B] hover:bg-[#1E1E1E] border border-[#252525] text-gray-300 px-3 py-1 rounded-lg text-xs flex items-center space-x-1 transition"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          {!query.trim() && (
            <div className="space-y-2 pt-2 border-t border-[#252525]">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Demo Scenario Query Shortcuts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setQuery('TXN-10025')}
                  className="bg-[#0B0B0B] hover:bg-[#1E1E1E] border border-[#252525] p-3 rounded-xl text-left flex items-center justify-between transition group"
                >
                  <div>
                    <span className="font-mono font-bold text-[#00D09C] block text-xs">TXN-10025</span>
                    <span className="text-gray-400 text-[10px]">Settlement Mismatch (Razorpay ₹5,000)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setQuery('TXN-10080')}
                  className="bg-[#0B0B0B] hover:bg-[#1E1E1E] border border-[#252525] p-3 rounded-xl text-left flex items-center justify-between transition group"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-400 block text-xs">TXN-10080</span>
                    <span className="text-gray-400 text-[10px]">Pending Paytm Payout (₹18,400)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Grouped Search Results List */}
          {!loading && query.trim() && (
            <div>
              {categories.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-1">
                  <p className="font-semibold text-sm text-gray-200">No records found</p>
                  <p className="text-xs text-gray-500">No transactions, orders, or settlements matching "<span className="text-gray-300 font-bold">{query}</span>"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((catKey) => {
                    const catItems = groupedResults[catKey];
                    return (
                      <div key={catKey} className="space-y-2">
                        <div className="text-[10px] font-extrabold uppercase text-[#00D09C] tracking-wider px-1 flex items-center space-x-2">
                          <span>{catKey}</span>
                          <span className="bg-[#00D09C]/10 border border-[#00D09C]/20 text-[#00D09C] px-1.5 py-0.2 rounded font-mono">
                            {catItems.length}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {catItems.map((res, idx) => {
                            const globalIdx = results.indexOf(res);
                            const isSelected = globalIdx === selectedIndex;

                            return (
                              <div
                                key={idx}
                                onClick={() => handleItemClick(res)}
                                className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between border ${
                                  isSelected
                                    ? 'bg-[#00D09C]/10 border-[#00D09C]/60 text-white shadow-md'
                                    : 'bg-[#0B0B0B] hover:bg-[#1A1A1A] border-[#252525] text-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[#00D09C]/10 border border-[#00D09C]/20 flex items-center justify-center font-bold text-[#00D09C] text-[10px] shrink-0 font-mono">
                                    {catKey.slice(0, 3)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-2 truncate">
                                      <span className="font-mono font-bold text-white text-xs truncate">
                                        {res.title || res.id}
                                      </span>
                                      {res.provider && (
                                        <span className="bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0">
                                          {res.provider}
                                        </span>
                                      )}
                                      {res.status && (
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                            res.status === 'SUCCESS' || res.status === 'RECONCILED'
                                              ? 'bg-[#00D09C]/20 text-[#00D09C] border-[#00D09C]/30'
                                              : res.status === 'PENDING'
                                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                                          }`}
                                        >
                                          {res.status}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{res.subtitle}</p>
                                  </div>
                                </div>

                                <div className="text-right flex items-center space-x-3 shrink-0 ml-2">
                                  {res.amount !== undefined && (
                                    <span className="font-mono font-bold text-[#00D09C] text-xs">
                                      ₹{res.amount.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-gray-500" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
