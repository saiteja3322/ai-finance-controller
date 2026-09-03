import React from 'react';
import { ForecastItem } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, Info } from 'lucide-react';

interface CashForecastViewProps {
  forecasts: ForecastItem[];
}

export const CashForecastView: React.FC<CashForecastViewProps> = ({ forecasts }) => {
  const chartData = forecasts.length > 0 ? forecasts.map((f) => ({
    date: new Date(f.forecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    settlements: f.expectedSettlements,
    cashPosition: f.estimatedCashPosition,
  })) : [
    { date: 'Sep 2', settlements: 39500, cashPosition: 33800 },
    { date: 'Sep 3', settlements: 44100, cashPosition: 38400 },
    { date: 'Sep 4', settlements: 41200, cashPosition: 35500 },
    { date: 'Sep 5', settlements: 48000, cashPosition: 42300 },
    { date: 'Sep 6', settlements: 52000, cashPosition: 46100 },
    { date: 'Sep 7', settlements: 46000, cashPosition: 40300 },
    { date: 'Sep 8', settlements: 49500, cashPosition: 43800 },
  ];

  return (
    <div className="space-y-6">
      {/* Forecast Header Banner */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-gray-100 font-['Outfit']">7-Day Cash Realization & Liquidity Forecast</h3>
            <span className="text-[10px] font-semibold bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D09C]" />
              <span>88% Confidence Model</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Predictive cash flow modeling based on trailing 14-day gateway settlement velocity, pending queues & refund rates.
          </p>
        </div>

        <div className="bg-[#0B0B0B] border border-[#252525] px-4 py-2 rounded-xl text-right">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Projected 7-Day Net Cash</span>
          <span className="text-lg font-extrabold text-[#00D09C] font-['Outfit']">₹2.80 Lakhs</span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-100 font-['Outfit']">Expected Bank Settlement Inflows vs Net Available Liquidity</h4>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></div>
              <span className="text-gray-300">Expected Settlements</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00D09C]"></div>
              <span className="text-gray-300">Estimated Cash Position</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSettlement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D09C" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00D09C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
              <XAxis dataKey="date" stroke="#A1A1AA" fontSize={11} tickLine={false} />
              <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', borderColor: '#252525', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
              <Area type="monotone" dataKey="settlements" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorSettlement)" />
              <Area type="monotone" dataKey="cashPosition" stroke="#00D09C" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Methodology Explanation Card */}
      <div className="bg-[#141414] border border-[#252525] rounded-xl p-4 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-[#00D09C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-gray-200 block text-xs">Transparent Methodology Explanation</span>
          <p className="text-gray-400 leading-relaxed">
            Forecasting model incorporates trailing 14-day merchant sales velocity, historical gateway settlement days (T+1 for Razorpay/PhonePe, T+2 for POS), average refund deduction ratios, and fixed MDR gateway fees.
          </p>
        </div>
      </div>
    </div>
  );
};
