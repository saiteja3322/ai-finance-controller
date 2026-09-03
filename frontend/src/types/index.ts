export interface DashboardSummary {
  totalRevenue: number;
  totalSettled: number;
  pendingSettlements: number;
  refundsAmount: number;
  gatewayFees: number;
  unreconciledAmount: number;
  ordersCount: number;
  healthScore: number;
  healthScoreBreakdown: {
    reconciliationReliability: number;
    settlementReliability: number;
    refundRateQuality: number;
    paymentSuccessRate: number;
    exceptionBacklog: number;
  };
}

export interface TrendItem {
  date: string;
  revenue: number;
  settled: number;
  gap: number;
}

export interface Transaction {
  id: string;
  externalId: string;
  providerCode: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'CANCELLED';
  transactionType: string;
  transactionDate: string;
  customerReference?: string;
  feeAmount: number;
  netAmount: number;
  order?: {
    orderId: string;
    customerName: string;
    amount: number;
  };
}

export interface FinancialException {
  id: string;
  exceptionCode: string;
  providerCode: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: 'OPEN' | 'INVESTIGATING' | 'REVIEWED' | 'RESOLVED';
  aiAnalysis?: string;
  evidenceJson?: string;
  recommendedAction?: string;
  createdAt: string;
  order?: {
    orderId: string;
    customerName: string;
    amount: number;
  };
}

export interface ReconciliationResult {
  id: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: 'RECONCILED' | 'PARTIAL' | 'PENDING' | 'MISMATCH' | 'MISSING';
  reason: string;
  order?: {
    orderId: string;
    customerName: string;
    amount: number;
  };
  transaction?: {
    externalId: string;
    providerCode: string;
  };
}

export interface ProviderPerformance {
  provider: string;
  totalTransactions: number;
  successRate: string;
  failedCount: number;
  totalRevenue: number;
  totalFees: number;
  feeRatePercent: string;
  openExceptionsCount: number;
}

export interface ForecastItem {
  id: string;
  forecastDate: string;
  expectedRevenue: number;
  expectedSettlements: number;
  expectedRefunds: number;
  expectedExpenses: number;
  estimatedCashPosition: number;
  confidenceScore: number;
  methodology: string;
}

export interface AlertItem {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  amount?: number;
  code?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  toolsExecuted?: string[];
  verifiedFacts?: Record<string, any>;
  timestamp: string;
}
