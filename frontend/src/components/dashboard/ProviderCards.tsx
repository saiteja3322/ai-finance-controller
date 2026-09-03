import React from 'react';
import { ProviderPerformance } from '../../types';
import { ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ProviderCardsProps {
  providers: ProviderPerformance[];
}

export const ProviderCards: React.FC<ProviderCardsProps> = ({ providers }) => {
  const providerList = providers.length > 0 ? providers : [
    { provider: 'RAZORPAY', totalTransactions: 98, successRate: '98.4%', failedCount: 1, totalRevenue: 520000, totalFees: 10400, feeRatePercent: '2.00%', openExceptionsCount: 1 },
    { provider: 'PHONEPE', totalTransactions: 64, successRate: '94.2%', failedCount: 3, totalRevenue: 380000, totalFees: 6840, feeRatePercent: '1.80%', openExceptionsCount: 1 },
    { provider: 'GPAY', totalTransactions: 42, successRate: '97.1%', failedCount: 1, totalRevenue: 210000, totalFees: 3150, feeRatePercent: '1.50%', openExceptionsCount: 1 },
    { provider: 'PAYTM', totalTransactions: 28, successRate: '91.5%', failedCount: 2, totalRevenue: 110000, totalFees: 2090, feeRatePercent: '1.90%', openExceptionsCount: 1 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-100 font-['Outfit']">Payment Gateway & Provider Intelligence</h4>
          <p className="text-xs text-gray-400">Benchmarking performance, MDR fee rates, success rates & exception loads</p>
        </div>
        <span className="text-xs text-[#00D09C] font-medium hover:underline cursor-pointer flex items-center">
          Full Analytics Report <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providerList.map((p, idx) => (
          <div
            key={idx}
            className="bg-[#141414] border border-[#252525] hover:border-[#00D09C]/40 rounded-xl p-4 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#00D09C]/10 border border-[#00D09C]/20 flex items-center justify-center font-bold text-xs text-[#00D09C]">
                  {p.provider.slice(0, 2)}
                </div>
                <span className="font-bold text-sm text-gray-100 font-['Outfit']">{p.provider}</span>
              </div>
              {p.openExceptionsCount > 0 ? (
                <span className="flex items-center space-x-1 text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{p.openExceptionsCount} Issue</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-[10px] font-semibold bg-[#00D09C]/20 text-[#00D09C] border border-[#00D09C]/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Healthy</span>
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Revenue Intake:</span>
                <span className="font-bold text-gray-200">₹{(p.totalRevenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Success Rate:</span>
                <span className={`font-semibold ${parseFloat(p.successRate) > 95 ? 'text-[#00D09C]' : 'text-amber-400'}`}>
                  {p.successRate}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Effective Fee Rate:</span>
                <span className="font-semibold text-gray-300">{p.feeRatePercent}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Total Fees Paid:</span>
                <span className="font-medium text-gray-300">₹{p.totalFees.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
