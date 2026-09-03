import { ReconciliationEngine } from '../reconciliation/reconciler.service';

describe('Reconciliation Engine Unit Tests', () => {
  test('Exact Match: expected settlement == actual settlement -> RECONCILED', () => {
    const expected = 4900;
    const actual = 4900;
    const result = ReconciliationEngine.calculateReconciliation(expected, actual);

    expect(result.status).toBe('RECONCILED');
    expect(result.difference).toBe(0);
  });

  test('Settlement Mismatch: expected 4900, actual 4700 -> MISMATCH with difference 200', () => {
    const expected = 4900;
    const actual = 4700;
    const result = ReconciliationEngine.calculateReconciliation(expected, actual);

    expect(result.status).toBe('MISMATCH');
    expect(result.difference).toBe(200);
  });

  test('Pending Settlement: actual 0 -> PENDING', () => {
    const expected = 4900;
    const actual = 0;
    const result = ReconciliationEngine.calculateReconciliation(expected, actual);

    expect(result.status).toBe('PENDING');
    expect(result.difference).toBe(4900);
  });
});
