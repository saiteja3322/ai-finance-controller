import { BackButton } from '../common/BackButton';
import { 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  CreditCard, 
  User, 
  Calendar, 
  Receipt,
  Sparkles
} from 'lucide-react';

interface TransactionDetailsViewProps {
  transaction: any;
  onBack: () => void;
  onInvestigateAI: (prompt?: string) => void;
}

export const TransactionDetailsView: React.FC<TransactionDetailsViewProps> = ({
  transaction,
  onBack,
  onInvestigateAI,
}) => {
  if (!transaction) return null;

  const order = transaction.order || {};
  const reconcil = (transaction.reconciliations && transaction.reconciliations[0]) || {};
  const fee = (transaction.fees && transaction.fees[0]) || {};
  const refund = (transaction.refunds && transaction.refunds[0]) || null;
  const settlement = transaction.settlement || {};
  const exception = (transaction.exceptions && transaction.exceptions[0]) || null;

  const grossAmount = transaction.amount || order.amount || 0;
  const feeAmount = transaction.feeAmount || fee.actualAmount || Math.round(grossAmount * 0.02);
  const expectedSettlement = grossAmount - feeAmount;
  const actualSettlement = settlement.actualAmount !== undefined ? settlement.actualAmount : (reconcil.actualAmount !== undefined ? reconcil.actualAmount : expectedSettlement);
  const difference = reconcil.difference !== undefined ? reconcil.difference : (expectedSettlement - actualSettlement);

  let reconcilStatus = reconcil.status || (difference !== 0 ? 'MISMATCH' : 'RECONCILED');
  if (actualSettlement === 0) reconcilStatus = 'PENDING';

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const suggestedQuestions = [
    "Why doesn't this settlement match?",
    "Where is the money?",
    "Show related refunds",
    "Explain the fee",
    "Should I investigate this transaction?",
  ];

  return (
    <div className="space-y-6 text-xs animate-in fade-in duration-200">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <BackButton onBack={onBack} label="Back" />

        <button
          onClick={() => onInvestigateAI(`Investigate transaction ${transaction.externalId}: Why is there a settlement mismatch?`)}
          className="flex items-center space-x-2 bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition"
        >
          <Bot className="w-4 h-4 text-black" />
          <span>Investigate with AI</span>
        </button>
      </div>

      {/* Transaction Overview Card */}
      <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#252525] pb-5 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono font-black text-xl text-white font-['Outfit']">{transaction.externalId}</span>
              <span className="bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 px-2.5 py-0.5 rounded-md font-bold text-xs">
                {transaction.providerCode}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  transaction.status === 'SUCCESS'
                    ? 'bg-[#00D09C]/20 text-[#00D09C] border-[#00D09C]/30'
                    : transaction.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {transaction.status}
              </span>
            </div>
            <p className="text-gray-400 text-xs">Order ID: <span className="font-mono text-gray-200 font-bold">{order.orderId || transaction.orderId || 'ORD-1000'}</span></p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Gross Customer Payment</span>
            <span className="text-2xl font-black text-[#00D09C] font-['Outfit']">{formatINR(grossAmount)}</span>
          </div>
        </div>

        {/* 2. Visual Financial Flow Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Multi-Way Financial Timeline & Flow</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Step 1: Customer Payment */}
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">1. Customer</span>
                <User className="w-3.5 h-3.5 text-[#00D09C]" />
              </div>
              <p className="font-bold text-white text-xs truncate">{order.customerName || transaction.customerReference || 'Ananya Sharma'}</p>
              <p className="font-mono font-bold text-[#00D09C]">{formatINR(grossAmount)}</p>
            </div>

            {/* Step 2: Payment Gateway */}
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">2. Gateway</span>
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="font-bold text-white text-xs">{transaction.providerCode}</p>
              <p className="text-[10px] text-gray-400">Status: {transaction.status}</p>
            </div>

            {/* Step 3: Gateway Fee */}
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">3. MDR Fee</span>
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="font-mono font-bold text-amber-400">{formatINR(feeAmount)}</p>
              <p className="text-[10px] text-gray-400">Rate: 2.0%</p>
            </div>

            {/* Step 4: Expected Settlement */}
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">4. Expected</span>
                <Calendar className="w-3.5 h-3.5 text-[#00D09C]" />
              </div>
              <p className="font-mono font-bold text-[#00D09C]">{formatINR(expectedSettlement)}</p>
              <p className="text-[10px] text-gray-400">Gross - Fee</p>
            </div>

            {/* Step 5: Actual Settlement */}
            <div className={`border rounded-xl p-3 space-y-1 ${difference !== 0 ? 'bg-red-950/20 border-red-500/40' : 'bg-[#0B0B0B] border-[#00D09C]/40'}`}>
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">5. Actual Bank</span>
                <Building2 className="w-3.5 h-3.5 text-[#00D09C]" />
              </div>
              <p className={`font-mono font-bold ${difference !== 0 ? 'text-red-400' : 'text-[#00D09C]'}`}>{formatINR(actualSettlement)}</p>
              <p className="text-[10px] text-gray-400">Received in Bank</p>
            </div>

            {/* Step 6: Reconciliation Status */}
            <div className={`border rounded-xl p-3 space-y-1 ${reconcilStatus === 'MISMATCH' ? 'bg-red-950/30 border-red-500/50' : 'bg-[#0B0B0B] border-[#00D09C]/50'}`}>
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold">6. Status</span>
                {reconcilStatus === 'MISMATCH' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#00D09C]" />}
              </div>
              <p className={`font-bold text-xs uppercase ${reconcilStatus === 'MISMATCH' ? 'text-red-400' : 'text-[#00D09C]'}`}>{reconcilStatus}</p>
              <p className="text-[10px] font-mono text-gray-300">Diff: {formatINR(difference)}</p>
            </div>
          </div>
        </div>

        {/* 3. Database Ledger Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Database Financial Audit Breakdown</h4>
          <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-4 space-y-2 font-mono">
            <div className="flex justify-between border-b border-[#252525] pb-2 text-gray-300">
              <span>Gross Customer Payment Received:</span>
              <span className="font-bold text-white">{formatINR(grossAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-[#252525] pb-2 text-gray-300">
              <span>Gateway MDR Processing Fee Deducted:</span>
              <span className="text-amber-400">- {formatINR(feeAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-[#252525] pb-2 text-gray-300">
              <span>Expected Bank Payout:</span>
              <span className="text-[#00D09C] font-bold">{formatINR(expectedSettlement)}</span>
            </div>
            <div className="flex justify-between border-b border-[#252525] pb-2 text-gray-300">
              <span>Actual Bank Payout Transferred:</span>
              <span className="text-[#00D09C] font-bold">{formatINR(actualSettlement)}</span>
            </div>
            <div className="flex justify-between border-b border-[#252525] pb-2 text-gray-300">
              <span>Variance / Unexplained Difference:</span>
              <span className={`font-bold ${difference !== 0 ? 'text-red-400' : 'text-[#00D09C]'}`}>{formatINR(difference)}</span>
            </div>
            <div className="flex justify-between pt-1 text-gray-300">
              <span>Reconciliation Ledger Status:</span>
              <span className="font-bold text-amber-400 uppercase">{reconcilStatus} — {reconcil.reason || 'Settlement verified against database'}</span>
            </div>
          </div>
        </div>

        {/* 4. Related Database Records Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Related Database Entities</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0B0B0B] border border-[#252525] p-3.5 rounded-xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Settlement Record</span>
              <p className="font-mono font-bold text-[#00D09C]">{settlement.settlementId || 'SET-RZP-10025'}</p>
              <p className="text-gray-400 text-[10px]">Actual: {formatINR(actualSettlement)}</p>
            </div>
            <div className="bg-[#0B0B0B] border border-[#252525] p-3.5 rounded-xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Refund Record</span>
              <p className="font-mono font-bold text-purple-400">{refund ? refund.refundId : 'None'}</p>
              <p className="text-gray-400 text-[10px]">{refund ? `Amount: ${formatINR(refund.amount)}` : 'No refund filed'}</p>
            </div>
            <div className="bg-[#0B0B0B] border border-[#252525] p-3.5 rounded-xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Gateway Fee Record</span>
              <p className="font-mono font-bold text-amber-400">{formatINR(feeAmount)}</p>
              <p className="text-gray-400 text-[10px]">Status: {fee.status || 'MATCHED'}</p>
            </div>
            <div className="bg-[#0B0B0B] border border-[#252525] p-3.5 rounded-xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Financial Exception</span>
              <p className="font-mono font-bold text-red-400">{exception ? exception.exceptionCode : (reconcilStatus === 'MISMATCH' ? 'EXC-DEMO-MISMATCH-001' : 'None')}</p>
              <p className="text-gray-400 text-[10px]">{difference !== 0 ? `Gap: ${formatINR(difference)}` : 'No open exception'}</p>
            </div>
          </div>
        </div>

        {/* 5. AI Investigation Banner & Suggested Questions */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#00D09C] font-bold">
              <Sparkles className="w-4 h-4 text-[#00D09C] animate-pulse" />
              <span>Ask AI Finance Controller to Investigate This Transaction</span>
            </div>
            <button
              onClick={() => onInvestigateAI(`Investigate transaction ${transaction.externalId}`)}
              className="bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-3 py-1 rounded-lg text-xs transition"
            >
              Start AI Investigation
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onInvestigateAI(`Investigate transaction ${transaction.externalId}: ${q}`)}
                className="bg-[#0B0B0B] hover:bg-[#1A1A1A] text-gray-300 hover:text-white border border-[#252525] hover:border-[#00D09C]/40 px-3 py-1 rounded-full text-[11px] transition"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
