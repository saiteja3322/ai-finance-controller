import { PaymentProviderAdapter, NormalizedTransaction, NormalizedSettlement, NormalizedRefund, ImportResult } from './base.adapter';
import { parse } from 'csv-parse/sync';

export class PhonePeAdapter implements PaymentProviderAdapter {
  providerCode = 'PHONEPE';
  providerName = 'PhonePe Business PG & QR';

  async fetchTransactions(): Promise<NormalizedTransaction[]> {
    return [
      {
        externalId: 'T2609011045001',
        providerCode: this.providerCode,
        orderId: 'ORD-1002',
        amount: 8000,
        currency: 'INR',
        status: 'SUCCESS',
        transactionType: 'PAYMENT',
        transactionDate: new Date(),
        customerReference: '9876543210@ybl',
        feeAmount: 144,
        netAmount: 7856,
      },
    ];
  }

  async fetchSettlements(): Promise<NormalizedSettlement[]> {
    return [];
  }

  async fetchRefunds(): Promise<NormalizedRefund[]> {
    return [];
  }

  async parseCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      provider: this.providerCode,
      totalRecords: 0,
      imported: 0,
      duplicates: 0,
      invalid: 0,
      errors: [],
    };

    try {
      const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      result.totalRecords = records.length;

      for (let idx = 0; idx < records.length; idx++) {
        const row = records[idx];
        if (!row.TransactionId && !row.TxnId && !row.Amount) {
          result.invalid++;
          result.errors.push(`Row ${idx + 1}: Missing PhonePe transaction ID or amount`);
          continue;
        }
        result.imported++;
      }
    } catch (err: any) {
      result.errors.push(`PhonePe CSV Parse Error: ${err.message}`);
    }

    return result;
  }
}
