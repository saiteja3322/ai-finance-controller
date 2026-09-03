import React from 'react';
import { AlertItem } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AlertsPanelProps {
  alerts: AlertItem[];
  onSelectAlert: (code?: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onSelectAlert }) => {
  const alertList = alerts.length > 0 ? alerts : [
    {
      id: 'alt-1',
      type: 'ERROR',
      title: '₹5,000 Reconciliation Mismatch Detected',
      message: 'Order ORD-1092 paid ₹12,500 via Razorpay but settlement batch transferred ₹7,250.',
      amount: 5000,
      code: 'EXC-1092',
      createdAt: '12m ago',
    },
    {
      id: 'alt-2',
      type: 'WARNING',
      title: 'Unusual Gateway MDR Fee Spike (PhonePe)',
      message: 'Transaction TXN-PH-1145 charged 7.5% MDR rate instead of configured 1.8% rate.',
      amount: 570,
      code: 'EXC-1145',
      createdAt: '45m ago',
    },
    {
      id: 'alt-3',
      type: 'WARNING',
      title: 'Overdue Paytm Settlement Payout SLA Breach',
      message: 'Settlement for Order ORD-1180 (₹15,680) is pending past 3-day SLA window.',
      amount: 15680,
      code: 'EXC-1180',
      createdAt: '2h ago',
    },
    {
      id: 'alt-4',
      type: 'INFO',
      title: 'Automated Multi-Way Reconciliation Pass Complete',
      message: 'Processed 220 orders and 500+ transactions across 6 provider adapters.',
      createdAt: '3h ago',
    },
  ];

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-100 font-['Outfit']">Financial Alerts & Anomaly Feed</h3>
          <p className="text-xs text-gray-400">Automated exception notifications, fee rate spikes & SLA breach warnings</p>
        </div>
        <span className="text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
          {alertList.length} Active Alerts
        </span>
      </div>

      <div className="space-y-3">
        {alertList.map((alt) => (
          <div
            key={alt.id}
            onClick={() => onSelectAlert(alt.code)}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
              alt.type === 'ERROR'
                ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                : alt.type === 'WARNING'
                ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                : 'bg-[#141414] border border-[#00D09C]/30 hover:border-[#00D09C]/50'
            }`}
          >
            <div className="flex items-start space-x-3 text-xs">
              <div className="mt-0.5 shrink-0">
                {alt.type === 'ERROR' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : alt.type === 'WARNING' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#00D09C]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white font-['Outfit'] text-sm">{alt.title}</span>
                  {alt.code && (
                    <span className="font-mono text-[10px] font-bold text-[#00D09C] bg-[#00D09C]/10 border border-[#00D09C]/20 px-1.5 py-0.5 rounded">
                      {alt.code}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed">{alt.message}</p>
                <div className="text-[10px] text-gray-400 font-mono">{alt.createdAt}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium text-gray-400 group-hover:text-white shrink-0 ml-4">
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
