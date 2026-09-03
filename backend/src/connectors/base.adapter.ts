export interface NormalizedTransaction {
  externalId: string;
  providerCode: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'CANCELLED';
  transactionType: 'PAYMENT' | 'REFUND' | 'FEE' | 'ADJUSTMENT' | 'TRANSFER';
  transactionDate: Date;
  customerReference?: string;
  feeAmount: number;
  netAmount: number;
  metadata?: Record<string, any>;
}

export interface NormalizedSettlement {
  settlementId: string;
  providerCode: string;
  expectedAmount: number;
  actualAmount: number;
  fees: number;
  settlementDate: Date;
  status: 'SETTLED' | 'PENDING' | 'MISMATCH';
  metadata?: Record<string, any>;
}

export interface NormalizedRefund {
  refundId: string;
  transactionId?: string;
  orderId?: string;
  providerCode: string;
  amount: number;
  reason?: string;
  processedAt: Date;
}

export interface ImportResult {
  provider: string;
  totalRecords: number;
  imported: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

export interface PaymentProviderAdapter {
  providerCode: string;
  providerName: string;
  fetchTransactions(startDate?: Date, endDate?: Date): Promise<NormalizedTransaction[]>;
  fetchSettlements(startDate?: Date, endDate?: Date): Promise<NormalizedSettlement[]>;
  fetchRefunds(startDate?: Date, endDate?: Date): Promise<NormalizedRefund[]>;
  parseCSV(csvContent: string): Promise<ImportResult>;
}
