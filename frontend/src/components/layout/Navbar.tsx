import React from 'react';
import { 
  Search, 
  RefreshCw, 
  UploadCloud, 
  ShieldCheck,
  Command,
  PlayCircle
} from 'lucide-react';

interface NavbarProps {
  onOpenImport: () => void;
  onOpenSearch: () => void;
  onResetDemo: () => void;
  onTriggerDemoScenario: (scenario: string) => void;
  currentScenario: string;
  alertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenImport,
  onOpenSearch,
  onResetDemo,
  onTriggerDemoScenario,
  currentScenario,
}) => {
  return (
    <header className="h-16 border-b border-[#252525] bg-[#0B0B0B] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left section: Logo & Global Search Input Trigger */}
      <div className="flex items-center space-x-4 md:space-x-6 flex-1 max-w-xl">
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onTriggerDemoScenario('DEFAULT')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00D09C] flex items-center justify-center shadow-lg shadow-[#00D09C]/20">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-['Outfit']">
                AI Finance Controller
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 px-1.5 py-0.2 rounded-full">
                Unified Truth
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Reconciled • Verified DB Intelligence</p>
          </div>
        </div>

        {/* Global Search Button / Trigger Input Bar */}
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between bg-[#141414] hover:bg-[#1A1A1A] border border-[#252525] hover:border-[#00D09C]/40 px-3.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition group shadow-sm max-w-md"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-4 h-4 text-[#00D09C] group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-gray-300 font-medium truncate">Search transactions, orders, settlements...</span>
          </div>
          <span className="hidden md:flex items-center space-x-0.5 text-[10px] font-mono bg-[#1A1A1A] border border-[#252525] px-1.5 py-0.5 rounded text-gray-400 shrink-0 ml-2">
            <Command className="w-3 h-3" />
            <span>K</span>
          </span>
        </button>
      </div>

      {/* Right section: Single Demo Scenarios Dropdown & Connect Data Source */}
      <div className="flex items-center space-x-3">
        {/* Clean Demo Scenarios Dropdown */}
        <div className="relative flex items-center">
          <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#252525] px-3 py-1.5 rounded-xl text-xs">
            <PlayCircle className="w-4 h-4 text-[#00D09C] animate-pulse shrink-0" />
            <span className="hidden lg:inline text-gray-300 font-semibold mr-1">Scenario:</span>
            
            <select
              value={currentScenario}
              onChange={(e) => onTriggerDemoScenario(e.target.value)}
              className="bg-[#1A1A1A] hover:bg-[#222222] text-white font-semibold text-xs border border-[#252525] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#00D09C] cursor-pointer"
            >
              <option value="DEFAULT">Demo Scenarios ▼</option>
              <option value="SETTLEMENT_MISMATCH">1. Settlement Mismatch</option>
              <option value="PENDING_SETTLEMENT">2. Pending Settlement</option>
              <option value="REVENUE_DROP">3. Revenue Drop</option>
              <option value="REFUND_SPIKE">4. Refund Spike</option>
              <option value="CASH_FLOW_RISK">5. Cash Flow Risk</option>
            </select>

            <button
              onClick={onResetDemo}
              title="Reset Demo Database"
              className="flex items-center space-x-1 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 border border-[#252525] p-1 rounded-lg text-xs transition ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00D09C]" />
            </button>
          </div>
        </div>

        {/* Connect Data Source Button */}
        <button
          onClick={onOpenImport}
          className="hidden sm:flex items-center space-x-2 bg-[#00D09C] hover:bg-[#00B88A] text-black font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-[#00D09C]/20 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Connect Data Source</span>
        </button>

        {/* Profile Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#252525]">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#00D09C]/30 flex items-center justify-center font-bold text-xs text-[#00D09C] shadow-md">
            PS
          </div>
        </div>
      </div>
    </header>
  );
};
