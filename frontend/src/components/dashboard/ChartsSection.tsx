import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendItem, ProviderPerformance } from '../../types';
import { Calendar, Filter, X, Check, AlertCircle, ArrowRight, Info, CheckCircle2, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

interface ChartsSectionProps {
  trends: TrendItem[];
  providers: ProviderPerformance[];
  onNavigateToReconciliation?: (category?: string) => void;
  onApplyDateRange?: (period: '7D' | '30D' | '90D' | 'Custom', startDate?: string, endDate?: string) => void;
  customDateLabel?: string;
  onSelectProvider?: (providerCode: string) => void;
  selectedProvider?: string | null;
}

// Polished Fintech Custom Tooltip for Reconciliation Donut Chart
const ReconciliationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const count = data.value || 0;
    const percentage = data.percentage !== undefined ? data.percentage : (data.total > 0 ? ((count / data.total) * 100).toFixed(1) : '0.0');

    return (
      <div className="bg-[#141414] border border-[#252525] p-3.5 rounded-xl shadow-2xl space-y-1.5 min-w-[170px] z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center space-x-2 font-bold text-white font-['Outfit'] border-b border-[#252525] pb-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="text-gray-200 font-mono text-xs font-semibold pt-0.5">
          {count} {count === 1 ? 'transaction' : 'transactions'}
        </div>
        <div className="text-[#00D09C] font-mono font-bold text-xs flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-gray-400 font-sans uppercase">Share</span>
          <span>{percentage}% of total</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  trends,
  providers,
  onNavigateToReconciliation,
  onApplyDateRange,
  customDateLabel,
  onSelectProvider,
  selectedProvider,
}) => {
  const [dateFilter, setDateFilter] = useState<'7D' | '30D' | '90D' | 'Custom'>('30D');
  const [showCustomPopover, setShowCustomPopover] = useState(false);
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [dateError, setDateError] = useState<string | null>(null);
  const [activeCustomLabel, setActiveCustomLabel] = useState<string | null>(customDateLabel || null);
  const [hoveredReconcilSegment, setHoveredReconcilSegment] = useState<any>(null);

  // Filter trends locally if client-side fallback is active
  const getFilteredTrends = () => {
    const raw = trends.length > 0 ? trends : [
      { date: 'Aug 20', revenue: 38000, settled: 35000, gap: 3000 },
      { date: 'Aug 21', revenue: 45000, settled: 42000, gap: 3000 },
      { date: 'Aug 22', revenue: 52000, settled: 48000, gap: 4000 },
      { date: 'Aug 23', revenue: 49000, settled: 46000, gap: 3000 },
      { date: 'Aug 24', revenue: 61000, settled: 57000, gap: 4000 },
      { date: 'Aug 25', revenue: 42000, settled: 39500, gap: 2500 },
      { date: 'Aug 26', revenue: 58000, settled: 54000, gap: 4000 },
      { date: 'Aug 27', revenue: 64000, settled: 61000, gap: 3000 },
      { date: 'Aug 28', revenue: 71000, settled: 65000, gap: 6000 },
      { date: 'Aug 29', revenue: 85000, settled: 78000, gap: 7000 },
      { date: 'Aug 30', revenue: 92000, settled: 87000, gap: 5000 },
      { date: 'Aug 31', revenue: 110000, settled: 101000, gap: 9000 },
    ];

    if (dateFilter === '7D') return raw.slice(-7);
    if (dateFilter === '90D') return raw;
    if (dateFilter === 'Custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filtered = raw.filter((t) => {
        let d = new Date(t.date);
        if (isNaN(d.getTime())) {
          d = new Date(`${t.date}, 2026`);
        }
        if (isNaN(d.getTime())) return true;
        return d >= start && d <= end;
      });

      return filtered;
    }
    return raw; // default 30D
  };

  const chartData = getFilteredTrends();

  // Handle Preset Date Filter Tab Click (7D, 30D, 90D)
  const handlePresetClick = (period: '7D' | '30D' | '90D') => {
    setDateFilter(period);
    setShowCustomPopover(false);
    setActiveCustomLabel(null);
    setDateError(null);
    if (onApplyDateRange) {
      onApplyDateRange(period);
    }
  };

  // Handle Custom Date Filter Apply
  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDateError(null);

    if (!startDate || !endDate) {
      setDateError('Please select both Start Date and End Date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setDateError('Invalid date format selected.');
      return;
    }

    if (start > end) {
      setDateError('Start Date cannot be after End Date.');
      return;
    }

    const formatDisplay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const label = `Custom (${formatDisplay(start)} – ${formatDisplay(end)})`;
    
    setActiveCustomLabel(label);
    setDateFilter('Custom');
    setShowCustomPopover(false);

    if (onApplyDateRange) {
      onApplyDateRange('Custom', startDate, endDate);
    }
  };

  const formatCompactINR = (val: number) => {
    if (val >= 10000000) {
      const cr = val / 10000000;
      return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
    }
    if (val >= 100000) {
      const l = val / 100000;
      return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Payment Provider Performance (Horizontal Bar Chart Data)
  const providerBarData = (providers.length > 0 ? providers : [
    { provider: 'RAZORPAY', totalRevenue: 280000, successRate: '100.0%', feeRatePercent: '2.00%' },
    { provider: 'PHONEPE', totalRevenue: 320000, successRate: '97.6%', feeRatePercent: '1.80%' },
    { provider: 'GPAY', totalRevenue: 295000, successRate: '100.0%', feeRatePercent: '1.50%' },
    { provider: 'PAYTM', totalRevenue: 292000, successRate: '100.0%', feeRatePercent: '1.90%' },
    { provider: 'POS', totalRevenue: 288000, successRate: '100.0%', feeRatePercent: '1.20%' },
  ]).map((p) => ({
    name: p.provider.replace('_', ' '),
    revenue: p.totalRevenue,
    successRate: p.successRate,
  }));

  // Reconciliation Health Donut Chart Data
  const rawDonutData = [
    { name: 'Reconciled', value: 182, color: '#00D09C' },
    { name: 'Pending', value: 24, color: '#F59E0B' },
    { name: 'Mismatch', value: 18, color: '#EF4444' },
    { name: 'Missing', value: 8, color: '#8B5CF6' },
  ];

  const totalReconcilRecords = rawDonutData.reduce((acc, item) => acc + item.value, 0);

  const reconciliationDonutData = rawDonutData.map((item) => ({
    ...item,
    total: totalReconcilRecords,
    percentage: totalReconcilRecords > 0 ? ((item.value / totalReconcilRecords) * 100).toFixed(1) : '0.0',
  }));

  // Refund Trend Chart Data
  const refundTrendData = [
    { date: 'Aug 25', refunds: 2100, count: 2 },
    { date: 'Aug 26', refunds: 1500, count: 1 },
    { date: 'Aug 27', refunds: 3200, count: 3 },
    { date: 'Aug 28', refunds: 1800, count: 2 },
    { date: 'Aug 29', refunds: 4500, count: 4 },
    { date: 'Aug 30', refunds: 2200, count: 2 },
    { date: 'Aug 31', refunds: 2700, count: 3 },
  ];

  // Gateway Fees Chart Data
  const gatewayFeesData = [
    { provider: 'Razorpay', feeAmount: 10400, mdrRate: '2.0%' },
    { provider: 'PhonePe', feeAmount: 6840, mdrRate: '1.8%' },
    { provider: 'Google Pay', feeAmount: 3150, mdrRate: '1.5%' },
    { provider: 'Paytm', feeAmount: 2090, mdrRate: '1.9%' },
  ];

  const formatCurrencyTooltip = (value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, ''];

  return (
    <div className="space-y-6">
      {/* C. MAIN GRAPH: Revenue & Settlement (Wide Card) */}
      <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252525] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white font-['Outfit']">Revenue & Settlement</h3>
            <p className="text-xs text-gray-400">Compare business revenue with actual settlements</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative">
            {/* Date Filtering Tabs */}
            <div className="flex items-center space-x-1 bg-[#0B0B0B] border border-[#252525] p-1 rounded-xl text-xs font-semibold">
              {(['7D', '30D', '90D'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handlePresetClick(period)}
                  className={`px-3 py-1 rounded-lg transition ${
                    dateFilter === period
                      ? 'bg-[#00D09C] text-black font-semibold shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}

              {/* Custom Date Button */}
              <button
                onClick={() => setShowCustomPopover(!showCustomPopover)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition ${
                  dateFilter === 'Custom'
                    ? 'bg-[#00D09C] text-black font-semibold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeCustomLabel || 'Custom'}</span>
              </button>
            </div>

            {/* Custom Date Range Picker Popover Modal */}
            {showCustomPopover && (
              <div className="absolute right-0 top-12 z-50 bg-[#141414] border border-[#252525] p-4 rounded-2xl shadow-2xl w-80 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#252525] pb-2">
                  <span className="font-bold text-white font-['Outfit'] text-sm flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-[#00D09C]" />
                    <span>Select Custom Date Range</span>
                  </span>
                  <button onClick={() => setShowCustomPopover(false)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleApplyCustom} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#00D09C]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#00D09C]"
                    />
                  </div>

                  {dateError && (
                    <div className="p-2.5 bg-red-950/30 border border-red-500/30 text-red-400 rounded-lg text-[11px] flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{dateError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#252525]">
                    <button
                      type="button"
                      onClick={() => setShowCustomPopover(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#252525] text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold shadow-md transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Chart Legends */}
            <div className="hidden sm:flex items-center space-x-4 text-xs font-medium pl-2 border-l border-[#252525]">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#00D09C]"></div>
                <span className="text-gray-300 font-semibold">Revenue</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#38BDF8]"></div>
                <span className="text-gray-300 font-semibold">Settlements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Body / Clean Empty State */}
        {chartData.length === 0 ? (
          <div className="h-80 w-full flex flex-col items-center justify-center space-y-2 border border-dashed border-[#252525] rounded-xl p-6 text-center text-gray-400">
            <Calendar className="w-8 h-8 text-gray-600 mb-1" />
            <p className="font-bold text-white text-sm">No Financial Data in Selected Date Range</p>
            <p className="text-xs text-gray-500 max-w-sm">No transaction or settlement records were found for this timeframe. Try adjusting your custom start and end dates.</p>
            <button
              onClick={() => handlePresetClick('30D')}
              className="mt-2 text-xs bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Reset to 30D View
            </button>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D09C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00D09C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSettlements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="date" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#252525', borderRadius: '10px', fontSize: '12px' }}
                  formatter={formatCurrencyTooltip}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#00D09C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="settled" name="Settlements" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSettlements)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* D & E. 2-COLUMN GRID: Provider Performance (Bar) + Reconciliation Health (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Payment Provider Performance (Horizontal Bar Chart) */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-sm font-bold text-white font-['Outfit']">Payment Provider Performance</h4>
              <span className="text-[10px] bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-semibold">
                Horizontal Bar View
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Volume breakdown and authorization success rate per gateway</p>
            {/* Visual Hint Subtitle */}
            <p className="text-[11px] text-[#00D09C] font-medium mb-3 flex items-center space-x-1">
              <Info className="w-3 h-3 text-[#00D09C] shrink-0" />
              <span>Click a provider to view payment details</span>
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={providerBarData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
                  <XAxis type="number" stroke="#A1A1AA" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#252525', borderRadius: '8px', fontSize: '12px' }}
                    formatter={formatCurrencyTooltip}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue Volume"
                    fill="#00D09C"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                    className="cursor-pointer"
                  >
                    {providerBarData.map((entry, index) => (
                      <Cell
                        key={`cell-bar-${index}`}
                        className="cursor-pointer hover:opacity-80 transition"
                        onClick={() => onSelectProvider && onSelectProvider(entry.name)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4 border-t border-[#252525] text-center text-xs">
            {providerBarData.map((p, idx) => {
              const isSelected = selectedProvider && (selectedProvider.toUpperCase() === p.name.toUpperCase() || selectedProvider.toUpperCase().includes(p.name.toUpperCase()));
              return (
                <div
                  key={idx}
                  onClick={() => onSelectProvider && onSelectProvider(p.name)}
                  className={`border p-3 rounded-xl flex flex-col justify-between space-y-1.5 transition-all duration-150 shadow-sm group cursor-pointer hover:scale-[1.02] ${
                    isSelected 
                      ? 'bg-[#1E1E1E] border-[#00D09C] ring-1 ring-[#00D09C]/50 shadow-[#00D09C]/10' 
                      : 'bg-[#0B0B0B] hover:bg-[#1A1A1A] border-[#252525] hover:border-[#00D09C]/40'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block truncate font-['Outfit'] group-hover:text-[#00D09C] transition-colors">
                    {p.name}
                  </span>
                  <div className="text-base sm:text-lg font-black text-white font-['Outfit'] tracking-tight">
                    {formatCompactINR(p.revenue)}
                  </div>
                  <div className="text-[11px] font-semibold text-[#00D09C] truncate">
                    {p.successRate.includes('Success') ? p.successRate : `${p.successRate} Success Rate`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* E. Reconciliation Health (Side-by-Side Donut Chart & Compact Legend Cards) */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white font-['Outfit']">Reconciliation Health</h4>
              <span className="text-[10px] bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-semibold">
                Audit Status
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Financial records reconciliation status across customer orders & bank payouts</p>

            {/* Desktop Side-by-Side Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center min-h-[240px]">
              {/* Donut Chart Container */}
              <div className="md:col-span-6 h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reconciliationDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {reconciliationDonutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer hover:opacity-85 transition"
                          onMouseEnter={() => setHoveredReconcilSegment(entry)}
                          onMouseLeave={() => setHoveredReconcilSegment(null)}
                          onClick={() => onNavigateToReconciliation && onNavigateToReconciliation(entry.name)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Donut Label */}
                <div className="absolute text-center pointer-events-none space-y-0.5 z-10">
                  <span className="text-2xl font-black text-white font-['Outfit'] block leading-none">
                    {totalReconcilRecords}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                    Transactions
                  </span>
                </div>

                {/* Floating Tooltip Overlay */}
                {hoveredReconcilSegment && (
                  <div className="absolute top-0 left-0 z-30 bg-[#141414] border border-[#252525] p-2.5 rounded-xl shadow-2xl space-y-1 w-44 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center space-x-1.5 font-bold text-white font-['Outfit'] border-b border-[#252525] pb-1">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: hoveredReconcilSegment.color }} />
                      <span>{hoveredReconcilSegment.name}</span>
                    </div>
                    <div className="text-gray-200 font-mono text-[11px] font-medium pt-0.5">
                      {hoveredReconcilSegment.value} {hoveredReconcilSegment.value === 1 ? 'transaction' : 'transactions'}
                    </div>
                    <div className="text-[#00D09C] font-mono font-bold text-[11px] flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-sans uppercase">Share</span>
                      <span>{hoveredReconcilSegment.percentage}% of total</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Legend Cards */}
              <div className="md:col-span-6 space-y-2 text-xs">
                {reconciliationDonutData.map((entry, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setHoveredReconcilSegment(entry)}
                    onMouseLeave={() => setHoveredReconcilSegment(null)}
                    onClick={() => onNavigateToReconciliation && onNavigateToReconciliation(entry.name)}
                    className={`w-full flex items-center justify-between border p-2.5 rounded-xl transition shadow-sm group ${
                      hoveredReconcilSegment?.name === entry.name
                        ? 'bg-[#1E1E1E] border-[#00D09C]/50 ring-1 ring-[#00D09C]/30'
                        : 'bg-[#0B0B0B] hover:bg-[#1A1A1A] border-[#252525] hover:border-[#00D09C]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                      <span className="font-bold text-gray-200 text-xs truncate group-hover:text-white transition-colors">{entry.name}</span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="font-bold text-white">{entry.value}</span>
                      <span className="text-[10px] text-gray-400 font-semibold bg-black/30 px-1.5 py-0.2 rounded border border-white/5">
                        {entry.percentage}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* F. LOWER GRID: Refund Trend + Gateway Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Refund Trend Card */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white font-['Outfit']">Refund Trend</h4>
              <p className="text-xs text-gray-400">Daily refund payout amount & frequency</p>
            </div>
            <span className="text-xs font-bold text-purple-400 font-mono">1.45% Avg</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={refundTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="date" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#252525', borderRadius: '8px', fontSize: '12px' }}
                  formatter={formatCurrencyTooltip}
                />
                <Line type="monotone" dataKey="refunds" name="Refund Amount" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 4, fill: '#A855F7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Gateway Fees Card */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white font-['Outfit']">Gateway Fees</h4>
              <p className="text-xs text-gray-400">MDR commission breakdown per provider</p>
            </div>
            <span className="text-xs font-bold text-[#00D09C] font-mono">1.69% Avg MDR</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gatewayFeesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="provider" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#252525', borderRadius: '8px', fontSize: '12px' }}
                  formatter={formatCurrencyTooltip}
                />
                <Bar dataKey="feeAmount" name="Fee Amount" fill="#00D09C" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
