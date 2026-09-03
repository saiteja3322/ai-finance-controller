import React from 'react';
import { 
  LayoutDashboard, 
  GitCompare, 
  Bot, 
  TrendingUp, 
  Receipt, 
  Layers, 
  AlertTriangle, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  exceptionsCount: number;
  alertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  exceptionsCount,
  alertsCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'reconciliation', 
      label: 'Reconciliation', 
      icon: GitCompare,
      badge: exceptionsCount > 0 ? `${exceptionsCount} Exceptions` : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    { 
      id: 'ai-controller', 
      label: 'AI Controller', 
      icon: Bot,
      badge: 'AI Active',
      badgeColor: 'bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30',
    },
    { id: 'forecast', label: 'Cash Forecast', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'providers', label: 'Providers Analytics', icon: Layers },
    { 
      id: 'alerts', 
      label: 'Alerts & Anomalies', 
      icon: AlertTriangle,
      badge: alertsCount > 0 ? `${alertsCount}` : undefined,
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0B0B] border-r border-[#252525] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Core Operations
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/30 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D09C]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00D09C]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3.5 bg-[#141414] border border-[#252525] rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></div>
          <span>Reconciliation Status</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">Automated pass complete 12m ago</p>
        <div className="w-full bg-[#252525] h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#00D09C] h-full w-[92%]"></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 font-mono">
          <span>92.4% Reconciled</span>
          <span className="text-amber-400">7 Exceptions</span>
        </div>
      </div>
    </aside>
  );
};
