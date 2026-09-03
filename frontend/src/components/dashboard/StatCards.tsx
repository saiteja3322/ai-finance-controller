import React from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Receipt, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DashboardSummary } from '../../types';

interface StatCardsProps {
  summary: DashboardSummary | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ summary }) => {
  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatINR(summary?.totalRevenue || 1240000),
      subtitle: '+12.4% vs last period',
      trend: 'up',
      icon: IndianRupee,
      iconBg: 'bg-[#00D09C]/10 text-[#00D09C] border-[#00D09C]/20',
      borderHover: 'hover:border-[#00D09C]/40',
    },
    {
      title: 'Total Settled',
      value: formatINR(summary?.totalSettled || 1170000),
      subtitle: '94.3% bank payout',
      trend: 'up',
      icon: CheckCircle2,
      iconBg: 'bg-[#00D09C]/10 text-[#00D09C] border-[#00D09C]/20',
      borderHover: 'hover:border-[#00D09C]/40',
    },
    {
      title: 'Pending Settlements',
      value: formatINR(summary?.pendingSettlements || 42000),
      subtitle: 'Within 1-3d SLA',
      trend: 'neutral',
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      title: 'Refunds',
      value: formatINR(summary?.refundsAmount || 18000),
      subtitle: '1.45% refund rate',
      trend: 'down',
      icon: RotateCcw,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      borderHover: 'hover:border-purple-500/40',
    },
    {
      title: 'Gateway Fees',
      value: formatINR(summary?.gatewayFees || 21000),
      subtitle: '1.69% avg MDR',
      trend: 'neutral',
      icon: Receipt,
      iconBg: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
      borderHover: 'hover:border-gray-500/40',
    },
    {
      title: 'Unreconciled Amount',
      value: formatINR(summary?.unreconciledAmount || 19000),
      subtitle: 'Requires investigation',
      trend: 'down',
      icon: AlertCircle,
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      borderHover: 'hover:border-red-500/40',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 6 Compact KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-[#141414] border border-[#252525] rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 ${card.borderHover} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg border ${card.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-lg font-extrabold text-white font-['Outfit'] tracking-tight mb-1">
                  {card.value}
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-gray-400">
                  {card.trend === 'up' && <TrendingUp className="w-3 h-3 text-[#00D09C]" />}
                  {card.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  <span className="truncate">{card.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
