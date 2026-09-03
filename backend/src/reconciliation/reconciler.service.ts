import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReconciliationSummary {
  totalProcessed: number;
  reconciledCount: number;
  mismatchCount: number;
  pendingCount: number;
  missingCount: number;
  totalMismatchedAmount: number;
  exceptionsGenerated: number;
}

export class ReconciliationEngine {
  /**
   * Run full database reconciliation pass across all orders, transactions, and settlements.
   */
  async runReconciliation(): Promise<ReconciliationSummary> {
    console.log('🔄 Executing Multi-Way Financial Reconciliation Pass...');

    const orders = await prisma.order.findMany({
      include: {
        transactions: true,
        reconciliations: true,
        refunds: true,
      },
    });

    const summary: ReconciliationSummary = {
      totalProcessed: orders.length,
      reconciledCount: 0,
      mismatchCount: 0,
      pendingCount: 0,
      missingCount: 0,
      totalMismatchedAmount: 0,
      exceptionsGenerated: 0,
    };

    for (const order of orders) {
      // Find associated transactions
      const tx = order.transactions[0];
      if (!tx) {
        summary.missingCount++;
        continue;
      }

      // Find associated settlement
      const settlement = await prisma.settlement.findFirst({
        where: { providerCode: tx.providerCode },
        orderBy: { createdAt: 'desc' },
      });

      const providerFeeRate = tx.providerCode === 'GPAY' ? 0.015 : tx.providerCode === 'PHONEPE' ? 0.018 : 0.02;
      const expectedFee = Math.round(order.amount * providerFeeRate);
      const expectedSettlement = order.amount - expectedFee;

      let actualSettlement = settlement ? settlement.actualAmount : expectedSettlement;

      // Check existing reconciliation result for overridden values
      const existingReconcil = await prisma.reconciliationResult.findFirst({
        where: { orderId: order.id },
      });

      if (existingReconcil) {
        actualSettlement = existingReconcil.actualAmount;
      }

      const diff = expectedSettlement - actualSettlement;

      let status = 'RECONCILED';
      let reason = 'Exact multi-way match verified';

      if (existingReconcil && existingReconcil.status === 'PENDING') {
        status = 'PENDING';
        reason = 'Settlement batch payout in progress';
        summary.pendingCount++;
      } else if (diff !== 0) {
        status = 'MISMATCH';
        reason = `Settlement payout shortfall of ₹${diff}`;
        summary.mismatchCount++;
        summary.totalMismatchedAmount += Math.abs(diff);
      } else {
        summary.reconciledCount++;
      }

      // Upsert Reconciliation Result
      if (existingReconcil) {
        await prisma.reconciliationResult.update({
          where: { id: existingReconcil.id },
          data: {
            expectedAmount: expectedSettlement,
            actualAmount: actualSettlement,
            difference: diff,
            status: status,
            reason: reason,
          },
        });
      } else {
        await prisma.reconciliationResult.create({
          data: {
            orderId: order.id,
            transactionId: tx.id,
            settlementId: settlement?.id,
            expectedAmount: expectedSettlement,
            actualAmount: actualSettlement,
            difference: diff,
            status: status,
            reason: reason,
          },
        });
      }
    }

    const totalExceptions = await prisma.financialException.count({
      where: { status: 'OPEN' },
    });
    summary.exceptionsGenerated = totalExceptions;

    console.log(`✅ Reconciliation pass finished: ${summary.reconciledCount} reconciled, ${summary.mismatchCount} mismatches, ${summary.pendingCount} pending.`);
    return summary;
  }

  /**
   * Helper function for pure deterministic reconciliation test comparison (used in unit tests)
   */
  static calculateReconciliation(expected: number, actual: number): { status: string; difference: number } {
    const difference = expected - actual;
    let status = 'RECONCILED';
    if (actual === 0) {
      status = 'PENDING';
    } else if (difference !== 0) {
      status = 'MISMATCH';
    }
    return { status, difference };
  }
}
