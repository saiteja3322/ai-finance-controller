import { PaymentProviderAdapter, NormalizedTransaction, NormalizedSettlement, NormalizedRefund, ImportResult } from './base.adapter';
import { parse } from 'csv-parse/sync';

export class GPayAdapter implements PaymentProviderAdapter {
  providerCode = 'GPAY';
  providerName = 'Google Pay for Business';

  async fetchTransactions(): Promise<NormalizedTransaction[]> {
    return [];
  }
  async fetchSettlements(): Promise<NormalizedSettlement[]> {
    return [];
  }
  async fetchRefunds(): Promise<NormalizedRefund[]> {
    return [];
  }
  async parseCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = { provider: this.providerCode, totalRecords: 0, imported: 0, duplicates: 0, invalid: 0, errors: [] };
    try {
      const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      result.totalRecords = records.length;
      records.forEach((row: any, idx: number) => {
        if (!row['Google Transaction ID'] && !row['Transaction ID'] && !row.Amount) {
          result.invalid++;
          result.errors.push(`Row ${idx + 1}: Invalid GPay format`);
        } else {
          result.imported++;
        }
      });
    } catch (err: any) {
      result.errors.push(`GPay CSV error: ${err.message}`);
    }
    return result;
  }
}

export class PaytmAdapter implements PaymentProviderAdapter {
  providerCode = 'PAYTM';
  providerName = 'Paytm Merchant Services';

  async fetchTransactions(): Promise<NormalizedTransaction[]> { return []; }
  async fetchSettlements(): Promise<NormalizedSettlement[]> { return []; }
  async fetchRefunds(): Promise<NormalizedRefund[]> { return []; }
  async parseCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = { provider: this.providerCode, totalRecords: 0, imported: 0, duplicates: 0, invalid: 0, errors: [] };
    try {
      const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      result.totalRecords = records.length;
      records.forEach((row: any, idx: number) => {
        if (!row.ORDER_ID && !row.TXN_ID && !row.TXN_AMOUNT) {
          result.invalid++;
        } else {
          result.imported++;
        }
      });
    } catch (err: any) {
      result.errors.push(`Paytm CSV error: ${err.message}`);
    }
    return result;
  }
}

export class BankAdapter implements PaymentProviderAdapter {
  providerCode = 'BANK';
  providerName = 'HDFC Bank Direct Account';

  async fetchTransactions(): Promise<NormalizedTransaction[]> { return []; }
  async fetchSettlements(): Promise<NormalizedSettlement[]> { return []; }
  async fetchRefunds(): Promise<NormalizedRefund[]> { return []; }
  async parseCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = { provider: this.providerCode, totalRecords: 0, imported: 0, duplicates: 0, invalid: 0, errors: [] };
    try {
      const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      result.totalRecords = records.length;
      records.forEach((row: any, idx: number) => {
        if (!row['Value Date'] && !row['Deposit Amount'] && !row.Description) {
          result.invalid++;
        } else {
          result.imported++;
        }
      });
    } catch (err: any) {
      result.errors.push(`Bank statement CSV error: ${err.message}`);
    }
    return result;
  }
}

export class POSAdapter implements PaymentProviderAdapter {
  providerCode = 'POS';
  providerName = 'Pine Labs In-Store POS';

  async fetchTransactions(): Promise<NormalizedTransaction[]> { return []; }
  async fetchSettlements(): Promise<NormalizedSettlement[]> { return []; }
  async fetchRefunds(): Promise<NormalizedRefund[]> { return []; }
  async parseCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = { provider: this.providerCode, totalRecords: 0, imported: 0, duplicates: 0, invalid: 0, errors: [] };
    try {
      const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      result.totalRecords = records.length;
      records.forEach((row: any, idx: number) => {
        if (!row.BatchNo && !row.TerminalID && !row.Amount) {
          result.invalid++;
        } else {
          result.imported++;
        }
      });
    } catch (err: any) {
      result.errors.push(`POS CSV error: ${err.message}`);
    }
    return result;
  }
}
