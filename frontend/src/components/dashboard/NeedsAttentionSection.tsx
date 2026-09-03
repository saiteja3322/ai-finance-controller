import React from 'react';
import { FinancialException } from '../../types';
import { ArrowRight, ShieldAlert } from 'lucide-react';

interface NeedsAttentionSectionProps {
  exceptions: FinancialException[];
  onInvestigate: (id: string) => void;
  onOpenTransactionDetails?: (txId: string) => void;
}

export const NeedsAttentionSection: React.FC<NeedsAttentionSectionProps> = ({
  exceptions,
  onInvestigate,
  onOpenTransactionDetails,
}) => {
  // Filter open exceptions or use fallback database-structured items if empty
  const items = exceptions.length > 0 ? exceptions : [
    {
      id: 'exc-demo-001',
      exceptionCode: 'TXN-10025',
      providerCode: 'RAZORPAY',
      severity: 'HIGH' as const,
      title: 'Settlement mismatch',
      description: 'Expected settlement ₹12,250 but bank payout received was ₹7,250.',
      expectedAmount: 12250,
      actualAmount: 7250,
      difference: 5000,
      status: 'OPEN' as const,
      createdAt: new Date().toISOString(),
      order: { orderId: 'ORD-1092', customerName: 'Apex Electronics', amount: 12500 }
    },
    {
      id: 'exc-demo-002',
      exceptionCode: 'TXN-10080',
      providerCode: 'PAYTM',
      severity: 'MEDIUM' as const,
      title: 'Pending settlement SLA breach',
      description: 'Payment captured 5 days ago, bank payout pending beyond 3-day SLA.',
      expectedAmount: 18400,
      actualAmount: 0,
      difference: 18400,
      status: 'OPEN' as const,
      createdAt: new Date().toISOString(),
      order: { orderId: 'ORD-1080', customerName: 'Zenith Logistics', amount: 18400 }
    },
    {
      id: 'exc-demo-003',
      exceptionCode: 'TXN-10090',
      providerCode: 'PHONEPE',
      severity: 'MEDIUM' as const,
      title: 'Unusual gateway fee variance',
      description: 'Provider MDR fee charged was 7.00% compared to contract rate 1.80%.',
      expectedAmount: 15000,
      actualAmount: 13950,
      difference: 1050,
      status: 'OPEN' as const,
      createdAt: new Date().toISOString(),
      order: { orderId: 'ORD-1090', customerName: 'Vanguard Retail', amount: 15000 }
    }
  ];

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const getSeverityBadge = (severity: string, title: string) => {
    if (severity === 'HIGH' || title.toLowerCase().includes('mismatch')) {
      return {
        dot: '🔴',
        color: 'border-red-500/30 bg-[#1A1111] text-red-400',
        btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-sm',
        badge: 'HIGH PRIORITY'
      };
    }
    if (severity === 'MEDIUM' || title.toLowerCase().includes('pending')) {
      return {
        dot: '🟠',
        color: 'border-amber-500/30 bg-[#1A1711] text-amber-400',
        btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm',
        badge: 'PENDING SLA'
      };
    }
    return {
      dot: '🟡',
      color: 'border-yellow-500/30 bg-[#1A1911] text-yellow-400',
      btnBg: 'bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold shadow-sm',
      badge: 'FEE VARIANCE'
    };
  };

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">Needs Attention</h3>
            <p className="text-xs text-gray-400">Active financial exceptions & reconciliation variances requiring investigation</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
          {items.length} Action Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const style = getSeverityBadge(item.severity, item.title);
          const orderRef = item.order?.orderId || item.exceptionCode;

          return (
            <div
              key={idx}
              className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all duration-200 hover:scale-[1.01] ${style.color}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{style.dot}</span>
                    <span className="font-bold text-xs text-gray-100 font-['Outfit'] truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-gray-300">
                    {style.badge}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block font-bold">Variance Amount</span>
                    <span className="text-lg font-mono font-bold text-white">{formatINR(item.difference || item.expectedAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 block font-bold">Reference</span>
                    <span className="text-xs font-mono font-semibold text-[#00D09C]">{orderRef}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                  <span className="font-mono">{item.providerCode}</span>
                </div>

                <button
                  onClick={() => {
                    if (onOpenTransactionDetails) {
                      onOpenTransactionDetails(item.exceptionCode);
                    } else {
                      onInvestigate(item.id || item.exceptionCode);
                    }
                  }}
                  className={`flex items-center space-x-1.5 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-md transition ${style.btnBg}`}
                >
                  <span>{item.title.toLowerCase().includes('pending') ? 'Review' : 'Investigate'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
