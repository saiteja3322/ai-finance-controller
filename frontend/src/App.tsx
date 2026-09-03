import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { NeedsAttentionSection } from './components/dashboard/NeedsAttentionSection';
import { AIDashboardWidget } from './components/dashboard/AIDashboardWidget';
import { ReconciliationTable } from './components/reconciliation/ReconciliationTable';
import { InvestigationDrawer } from './components/reconciliation/InvestigationDrawer';
import { AIControllerChat } from './components/ai/AIControllerChat';
import { CashForecastView } from './components/forecast/CashForecastView';
import { CSVImportModal } from './components/import/CSVImportModal';
import { AlertsPanel } from './components/alerts/AlertsPanel';
import { TransactionListView } from './components/transactions/TransactionListView';
import { TransactionDetailsView } from './components/transactions/TransactionDetailsView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { ProviderDetailsDrawer } from './components/dashboard/ProviderDetailsDrawer';
import { BackButton } from './components/common/BackButton';

import {
  DashboardSummary,
  TrendItem,
  FinancialException,
  Transaction,
  ProviderPerformance,
  ForecastItem,
  AlertItem,
  ChatMessage,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [historyStack, setHistoryStack] = useState<string[]>(['dashboard']);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [exceptions, setExceptions] = useState<FinancialException[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [providers, setProviders] = useState<ProviderPerformance[]>([]);
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  
  const [selectedException, setSelectedException] = useState<FinancialException | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [currentScenario, setCurrentScenario] = useState<string>('DEFAULT');
  const [initialAIPrompt, setInitialAIPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Navigate helper tracking navigation history
  const navigateToTab = (tab: string) => {
    if (tab === activeTab) return;
    setHistoryStack((prev) => {
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
    setActiveTab(tab);
    window.history.pushState({ tab }, '', `#${tab}`);
  };

  // Back button handler popping history stack
  const handleGoBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop();
      const prevTab = newStack[newStack.length - 1] || 'dashboard';
      setHistoryStack(newStack);
      setActiveTab(prevTab);
      window.history.replaceState({ tab: prevTab }, '', `#${prevTab}`);
    } else {
      setActiveTab('dashboard');
      setHistoryStack(['dashboard']);
      window.history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
    }
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const tab = e.state?.tab || window.location.hash.replace('#', '') || 'dashboard';
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global listener for Ctrl+K event
  useEffect(() => {
    const handleOpenSearchEvent = () => setIsSearchOpen(true);
    window.addEventListener('open-global-search', handleOpenSearchEvent);
    return () => window.removeEventListener('open-global-search', handleOpenSearchEvent);
  }, []);

  // Fetch API data on load
  const loadData = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const queryParams = (startDate || endDate) ? `?startDate=${startDate || ''}&endDate=${endDate || ''}` : '';
      const [sumRes, trendRes, excRes, txRes, provRes, fcRes, altRes] = await Promise.all([
        fetch(`/api/dashboard/summary${queryParams}`).then((r) => r.json()),
        fetch(`/api/dashboard/trends${queryParams}`).then((r) => r.json()),
        fetch('/api/exceptions').then((r) => r.json()),
        fetch('/api/transactions').then((r) => r.json()),
        fetch('/api/providers').then((r) => r.json()),
        fetch('/api/forecast').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(trendRes)) setTrends(trendRes);
      if (Array.isArray(excRes)) setExceptions(excRes);
      if (Array.isArray(txRes)) setTransactions(txRes);
      if (provRes && Array.isArray(provRes.performance)) setProviders(provRes.performance);
      if (Array.isArray(fcRes)) setForecasts(fcRes);
      if (Array.isArray(altRes)) setAlerts(altRes);
    } catch (err) {
      console.warn('⚠️ API fetch fallback mode:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Transaction Details view by ID
  const handleOpenTransactionDetails = async (txId: string) => {
    try {
      const res = await fetch(`/api/transactions/${txId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTransaction(data);
        setActiveTab('transaction-details');
      } else {
        // Fallback: search local transaction array
        const tx = transactions.find((t) => t.externalId === txId || t.id === txId || t.order?.orderId === txId);
        if (tx) {
          setSelectedTransaction(tx);
          setActiveTab('transaction-details');
        } else {
          // Construct fallback record for demo TXN if not found
          setSelectedTransaction({
            id: txId,
            externalId: txId,
            providerCode: txId.includes('10080') ? 'PAYTM' : txId.includes('10090') ? 'PHONEPE' : 'RAZORPAY',
            amount: txId.includes('10080') ? 18400 : txId.includes('10090') ? 15000 : 12500,
            status: txId.includes('10080') ? 'PENDING' : 'SUCCESS',
            orderId: 'ORD-1092',
            order: { orderId: 'ORD-1092', customerName: 'Apex Retail', amount: 12500 },
            reconciliations: [{ status: 'MISMATCH', actualAmount: 7250, difference: 5000 }],
            fees: [{ actualAmount: 250 }],
            settlement: { actualAmount: 7250, settlementId: 'SET-RZP-10025' }
          });
          setActiveTab('transaction-details');
        }
      }
    } catch (err) {
      console.error('Error opening transaction details:', err);
    }
  };

  // Handle Search Result Selection
  const handleSearchResultSelect = (result: any) => {
    if (result.type === 'transaction' || result.type === 'order') {
      handleOpenTransactionDetails(result.id);
    } else if (result.type === 'exception') {
      handleInvestigateException(result.id);
    } else {
      handleOpenTransactionDetails(result.id);
    }
  };

  // Trigger Demo Scenarios dynamically
  const handleTriggerDemoScenario = async (scenario: string) => {
    setCurrentScenario(scenario);
    if (scenario === 'SETTLEMENT_MISMATCH') {
      // Demo 1: Settlement Mismatch (TXN-10025)
      await handleOpenTransactionDetails('TXN-10025');
    } else if (scenario === 'PENDING_SETTLEMENT') {
      // Demo 2: Pending Settlement (TXN-10080)
      await handleOpenTransactionDetails('TXN-10080');
    } else if (scenario === 'REVENUE_DROP') {
      // Demo 3: Revenue Drop -> AI Finance Controller
      setActiveTab('ai-controller');
      setInitialAIPrompt('Why did sales revenue decrease recently? Show provider performance breakdown and failure rates.');
    } else if (scenario === 'REFUND_SPIKE') {
      // Demo 4: Refund Spike (TXN-10090)
      await handleOpenTransactionDetails('TXN-10090');
    } else if (scenario === 'CASH_FLOW_RISK') {
      // Demo 5: Cash Flow Risk -> Forecast View
      setActiveTab('forecast');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handle AI Chat API query
  const handleSendMessage = async (promptText: string): Promise<ChatMessage> => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText }),
    });
    const data = await res.json();
    return {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      text: data.answer,
      toolsExecuted: data.toolsExecuted,
      verifiedFacts: data.verifiedFacts,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Handle AI Exception Investigation call
  const handleInvestigateException = async (exceptionId: string) => {
    const exc = exceptions.find((e) => e.id === exceptionId || e.exceptionCode === exceptionId);
    if (exc) {
      setSelectedException(exc);
    } else {
      try {
        const res = await fetch(`/api/ai/investigate/${exceptionId}`, { method: 'POST' });
        const data = await res.json();
        if (data && !data.error) {
          setSelectedException({
            id: exceptionId,
            exceptionCode: data.exceptionCode || exceptionId,
            providerCode: data.provider || 'RAZORPAY',
            severity: data.severity || 'HIGH',
            title: data.title || 'Settlement Shortfall Exception',
            description: 'AI Verified Audit Investigation',
            expectedAmount: data.verifiedFacts?.expectedSettlement || 12250,
            actualAmount: data.verifiedFacts?.actualSettlement || 7250,
            difference: data.verifiedFacts?.difference || 5000,
            status: 'OPEN',
            aiAnalysis: data.aiAnalysis,
            evidenceJson: JSON.stringify(data.verifiedFacts),
            recommendedAction: data.recommendedAction,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Error investigating exception:', e);
      }
    }
  };

  // Handle Ask AI from Dashboard Widget
  const handleAskAIDashboard = (prompt: string) => {
    setInitialAIPrompt(prompt);
    setActiveTab('ai-controller');
  };

  // Handle CSV Import
  const handleUploadCSV = async (provider: string, csvContent: string) => {
    const res = await fetch(`/api/import/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText: csvContent }),
    });
    return res.json();
  };

  // Reset Demo Database
  const handleResetDemo = async () => {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Demo reset error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-gray-100 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onResetDemo={handleResetDemo}
        onTriggerDemoScenario={handleTriggerDemoScenario}
        currentScenario={currentScenario}
        alertsCount={alerts.length}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            navigateToTab(tab);
            setSelectedTransaction(null);
          }}
          exceptionsCount={exceptions.length}
          alertsCount={alerts.length}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 1. KPI Cards */}
              <StatCards summary={summary} />

              {/* 2. Revenue vs Settlement Main Chart + Provider Bar & Donut Charts + Refund & Fee Cards */}
              <ChartsSection
                trends={trends}
                providers={providers}
                onNavigateToReconciliation={() => navigateToTab('reconciliation')}
                onApplyDateRange={(period, start, end) => {
                  setActiveDateRange({ startDate: start, endDate: end });
                  loadData(start, end);
                }}
                onSelectProvider={(code) => setSelectedProvider(code)}
                selectedProvider={selectedProvider}
              />

              {/* 5. Needs Attention Section */}
              <NeedsAttentionSection
                exceptions={exceptions}
                onInvestigate={(id) => handleInvestigateException(id)}
                onOpenTransactionDetails={(txId) => handleOpenTransactionDetails(txId)}
              />

              {/* 6. AI Finance Controller Dashboard Widget */}
              <AIDashboardWidget onAskAI={handleAskAIDashboard} />
            </div>
          )}

          {activeTab === 'transaction-details' && selectedTransaction && (
            <TransactionDetailsView
              transaction={selectedTransaction}
              onBack={handleGoBack}
              onInvestigateAI={(prompt) => {
                navigateToTab('ai-controller');
                if (prompt) setInitialAIPrompt(prompt);
              }}
            />
          )}

          {activeTab === 'reconciliation' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <ReconciliationTable
                exceptions={exceptions}
                onInvestigate={(id) => handleInvestigateException(id)}
              />
            </div>
          )}

          {activeTab === 'ai-controller' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <AIControllerChat
                onSendMessage={handleSendMessage}
                initialPrompt={initialAIPrompt}
              />
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <CashForecastView forecasts={forecasts} />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <TransactionListView
                transactions={transactions}
                onSelectTransaction={(txId) => handleOpenTransactionDetails(txId)}
              />
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <ChartsSection trends={trends} providers={providers} />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <AlertsPanel
                alerts={alerts}
                onSelectAlert={(code) => {
                  if (code) {
                    handleOpenTransactionDetails(code);
                  } else {
                    navigateToTab('reconciliation');
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <BackButton onBack={handleGoBack} />
              <div className="bg-[#141414] border border-[#252525] rounded-xl p-6 space-y-4 text-xs">
                <h3 className="text-base font-bold text-white font-['Outfit'] font-sans">System & Integration Settings</h3>
                <p className="text-gray-400">Manage payment gateway credentials, webhook secrets, and reconciliation thresholds</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] border border-[#252525] p-4 rounded-xl space-y-2">
                    <span className="font-bold text-[#00D09C] block">Razorpay Live API Integration</span>
                    <p className="text-gray-400">Environment variable RAZORPAY_KEY_ID status: Configured</p>
                    <span className="text-[10px] bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-mono inline-block">Active Test API Adapter</span>
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#252525] p-4 rounded-xl space-y-2">
                    <span className="font-bold text-[#00D09C] block">Gemini AI Model Engine</span>
                    <p className="text-gray-400">Environment variable GEMINI_API_KEY status: Operational</p>
                    <span className="text-[10px] bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 px-2 py-0.5 rounded font-mono inline-block">Verified DB Function Calling</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Investigation Drawer Modal */}
      <InvestigationDrawer
        exception={selectedException}
        onClose={() => setSelectedException(null)}
        onMarkReviewed={(id) => {
          setExceptions((prev) => prev.filter((e) => e.id !== id));
        }}
      />

      {/* CSV Data Source Import Modal */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onUploadCSV={handleUploadCSV}
      />

      {/* Global Search Modal (Ctrl + K / Cmd + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSearchResultSelect}
      />

      {/* Provider Details Drawer */}
      <ProviderDetailsDrawer
        providerCode={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onSelectTransaction={(txId) => {
          setSelectedProvider(null);
          handleOpenTransactionDetails(txId);
        }}
        onInvestigateAI={(prompt) => {
          setSelectedProvider(null);
          setActiveTab('ai-controller');
          if (prompt) setInitialAIPrompt(prompt);
        }}
        startDate={activeDateRange.startDate}
        endDate={activeDateRange.endDate}
      />
    </div>
  );
}
