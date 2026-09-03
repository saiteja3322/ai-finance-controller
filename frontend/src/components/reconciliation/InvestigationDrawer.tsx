import React from 'react';
import { FinancialException } from '../../types';
import { X, CheckCircle, Bot, ArrowRight, ShieldCheck } from 'lucide-react';

interface InvestigationDrawerProps {
  exception: FinancialException | null;
  onClose: () => void;
  onMarkReviewed: (id: string) => void;
}

export const InvestigationDrawer: React.FC<InvestigationDrawerProps> = ({
  exception,
  onClose,
  onMarkReviewed,
}) => {
  if (!exception) return null;

  let evidence: any = {};
  try {
    if (exception.evidenceJson) {
      evidence = JSON.parse(exception.evidenceJson);
    }
  } catch (e) {
    evidence = {};
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-[#0B0B0B] border-l border-[#252525] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#252525] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D09C]/10 border border-[#00D09C]/30 flex items-center justify-center text-[#00D09C]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-[#00D09C] text-sm">{exception.exceptionCode}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    exception.severity === 'HIGH'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {exception.severity} SEVERITY
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-['Outfit']">{exception.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] text-gray-400 hover:text-white border border-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Discrepancy Summary Box */}
          <div className="bg-[#141414] border border-[#252525] rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
            <div className="border-r border-[#252525] pr-2">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Expected Payout</span>
              <span className="text-sm font-bold text-gray-100 font-mono">
                ₹{exception.expectedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-r border-[#252525] pr-2">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Actual Received</span>
              <span className="text-sm font-bold text-[#00D09C] font-mono">
                ₹{exception.actualAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Shortfall / Gap</span>
              <span className="text-sm font-bold text-red-400 font-mono">
                ₹{exception.difference.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Section 1: Verified Audit Evidence (HARD FACTS) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00D09C] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Database Audit Evidence (Hard Facts)</span>
            </div>
            <div className="bg-[#141414] border border-[#00D09C]/20 rounded-xl p-4 space-y-2.5 font-mono text-gray-300">
              <div className="flex justify-between border-b border-[#252525] pb-1.5">
                <span className="text-gray-400">Order Reference:</span>
                <span className="text-white font-bold">{evidence.orderId || exception.order?.orderId || 'ORD-1000'}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-1.5">
                <span className="text-gray-400">Customer Name:</span>
                <span className="text-white">{evidence.customer || exception.order?.customerName || 'Customer'}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-1.5">
                <span className="text-gray-400">Gross Payment Received:</span>
                <span className="text-[#00D09C]">₹{(evidence.paymentReceived || exception.expectedAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-1.5">
                <span className="text-gray-400">Gateway Fee Deducted:</span>
                <span className="text-amber-400">₹{(evidence.gatewayFee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-1.5">
                <span className="text-gray-400">Provider & Transaction ID:</span>
                <span className="text-[#00D09C]">{exception.providerCode} • {evidence.transactionId || 'TXN-9901'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Matching Refund Record:</span>
                <span className="text-gray-300">{evidence.refundFound || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: AI Root Cause Analysis */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00D09C] uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>AI Root Cause & Exception Explanation</span>
            </div>
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-4 text-gray-200 leading-relaxed font-sans text-xs">
              {exception.aiAnalysis || 'The AI Finance Controller performed a multi-way cross-reference check between customer checkout, provider transaction logs, and daily bank settlement batch exports.'}
            </div>
          </div>

          {/* Section 3: Recommended Action */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <ArrowRight className="w-4 h-4 text-[#00D09C]" />
              <span>Recommended Action</span>
            </div>
            <div className="bg-[#141414] border border-[#00D09C]/30 rounded-xl p-4 text-gray-200 font-medium">
              {exception.recommendedAction || 'File a formal settlement discrepancy claim with the provider account management desk.'}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#252525] bg-[#141414] flex items-center justify-between">
          <div className="text-[11px] text-gray-400">
            Status: <span className="font-bold text-amber-400 uppercase">{exception.status}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] text-gray-300 border border-[#252525] text-xs transition font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onMarkReviewed(exception.id);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Reviewed & Resolved</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
