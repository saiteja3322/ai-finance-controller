import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const aiTools = {
  async getTotalRevenue() {
    const orders = await prisma.order.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    });
    return {
      totalRevenue: orders._sum.amount || 0,
      totalOrdersCount: orders._count.id,
      formattedRevenue: `₹${((orders._sum.amount || 0) / 100000).toFixed(2)} Lakhs`,
    };
  },

  async getTotalSettlements() {
    const settlements = await prisma.settlement.aggregate({
      where: { status: 'SETTLED' },
      _sum: { actualAmount: true, fees: true },
      _count: { id: true },
    });
    return {
      totalSettled: settlements._sum.actualAmount || 0,
      totalGatewayFees: settlements._sum.fees || 0,
      settlementCount: settlements._count.id,
      formattedSettled: `₹${((settlements._sum.actualAmount || 0) / 100000).toFixed(2)} Lakhs`,
    };
  },

  async getPendingSettlements() {
    const pending = await prisma.reconciliationResult.aggregate({
      where: { status: 'PENDING' },
      _sum: { expectedAmount: true },
      _count: { id: true },
    });
    return {
      pendingSettlementsTotal: pending._sum.expectedAmount || 0,
      pendingCount: pending._count.id,
      formattedPending: `₹${((pending._sum.expectedAmount || 0) / 1000).toFixed(1)}K`,
    };
  },

  async getUnreconciledTransactions() {
    const mismatches = await prisma.reconciliationResult.findMany({
      where: { status: 'MISMATCH' },
      include: { order: true, transaction: true },
      orderBy: { difference: 'desc' },
      take: 10,
    });

    const totalDiff = mismatches.reduce((sum, item) => sum + item.difference, 0);

    return {
      unreconciledCount: mismatches.length,
      totalDifferenceAmount: totalDiff,
      formattedUnreconciled: `₹${(totalDiff / 1000).toFixed(1)}K`,
      topExceptions: mismatches.map((m) => ({
        id: m.id,
        orderId: m.order?.orderId,
        provider: m.transaction?.providerCode,
        expected: m.expectedAmount,
        actual: m.actualAmount,
        difference: m.difference,
        reason: m.reason,
      })),
    };
  },

  async getProviderPerformance() {
    const providers = ['RAZORPAY', 'PHONEPE', 'GPAY', 'PAYTM', 'POS'];
    const performance = [];

    for (const code of providers) {
      const txs = await prisma.transaction.findMany({ where: { providerCode: code } });
      const totalCount = txs.length;
      const successCount = txs.filter((t) => t.status === 'SUCCESS').length;
      const failedCount = txs.filter((t) => t.status === 'FAILED').length;
      const totalAmount = txs.reduce((acc, t) => acc + t.amount, 0);
      const totalFees = txs.reduce((acc, t) => acc + t.feeAmount, 0);

      const exceptions = await prisma.financialException.count({
        where: { providerCode: code, status: 'OPEN' },
      });

      performance.push({
        provider: code,
        totalTransactions: totalCount,
        successRate: totalCount > 0 ? `${((successCount / totalCount) * 100).toFixed(1)}%` : '0%',
        failedCount,
        totalRevenue: totalAmount,
        totalFees,
        feeRatePercent: totalAmount > 0 ? `${((totalFees / totalAmount) * 100).toFixed(2)}%` : '0%',
        openExceptionsCount: exceptions,
      });
    }

    return performance;
  },

  async getRefunds() {
    const refunds = await prisma.refund.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    });
    return {
      totalRefunds: refunds._sum.amount || 0,
      refundCount: refunds._count.id,
      formattedRefunds: `₹${((refunds._sum.amount || 0) / 1000).toFixed(1)}K`,
    };
  },

  async getFees() {
    const fees = await prisma.fee.aggregate({
      _sum: { actualAmount: true },
      _count: { id: true },
    });
    return {
      totalFees: fees._sum.actualAmount || 0,
      feeRecordsCount: fees._count.id,
      formattedFees: `₹${((fees._sum.actualAmount || 0) / 1000).toFixed(1)}K`,
    };
  },

  async getCashPosition() {
    const settled = await this.getTotalSettlements();
    const pending = await this.getPendingSettlements();
    const refunds = await this.getRefunds();

    const netAvailableCash = settled.totalSettled - refunds.totalRefunds;
    const expectedCashIn3Days = netAvailableCash + pending.pendingSettlementsTotal;

    return {
      currentBankCashBalance: netAvailableCash,
      expectedPendingCashInflows: pending.pendingSettlementsTotal,
      projected3DayCashPosition: expectedCashIn3Days,
      formattedCashBalance: `₹${(netAvailableCash / 100000).toFixed(2)} Lakhs`,
      formattedExpected3Day: `₹${(expectedCashIn3Days / 100000).toFixed(2)} Lakhs`,
    };
  },

  async getRevenueTrend() {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: 'asc' },
      select: { orderDate: true, amount: true },
    });

    const daysMap: Record<string, number> = {};
    for (const o of orders) {
      const dayKey = o.orderDate.toISOString().split('T')[0];
      daysMap[dayKey] = (daysMap[dayKey] || 0) + o.amount;
    }

    return Object.entries(daysMap).map(([date, amount]) => ({ date, amount }));
  },

  async getSettlementTrend() {
    const settlements = await prisma.settlement.findMany({
      orderBy: { settlementDate: 'asc' },
      select: { settlementDate: true, actualAmount: true, expectedAmount: true },
    });

    const daysMap: Record<string, { expected: number; actual: number }> = {};
    for (const s of settlements) {
      const dayKey = s.settlementDate.toISOString().split('T')[0];
      if (!daysMap[dayKey]) daysMap[dayKey] = { expected: 0, actual: 0 };
      daysMap[dayKey].expected += s.expectedAmount;
      daysMap[dayKey].actual += s.actualAmount;
    }

    return Object.entries(daysMap).map(([date, val]) => ({
      date,
      expected: val.expected,
      actual: val.actual,
      gap: val.expected - val.actual,
    }));
  },

  async getExceptions() {
    const exceptions = await prisma.financialException.findMany({
      orderBy: { severity: 'asc' },
      include: { order: true, transaction: true, settlement: true },
    });
    return exceptions;
  },

  async getTransactionDetails(orderId: string) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderId: orderId }] },
      include: {
        transactions: true,
        reconciliations: true,
        exceptions: true,
        refunds: true,
      },
    });
    return order;
  },

  async getForecast() {
    const forecasts = await prisma.forecast.findMany({
      orderBy: { forecastDate: 'asc' },
    });
    return forecasts;
  },

  async investigateException(exceptionId: string) {
    const exc = await prisma.financialException.findFirst({
      where: { OR: [{ id: exceptionId }, { exceptionCode: exceptionId }] },
      include: { order: true, transaction: true, settlement: true },
    });

    if (!exc) return { error: `Exception ID ${exceptionId} not found.` };

    return {
      exceptionCode: exc.exceptionCode,
      title: exc.title,
      severity: exc.severity,
      provider: exc.providerCode,
      verifiedFacts: {
        orderId: exc.order?.orderId || 'N/A',
        customer: exc.order?.customerName || 'N/A',
        orderAmount: exc.order?.amount || 0,
        gatewayFee: exc.transaction?.feeAmount || 0,
        expectedSettlement: exc.expectedAmount,
        actualSettlement: exc.actualAmount,
        difference: exc.difference,
        transactionId: exc.transaction?.externalId || 'N/A',
        settlementId: exc.settlement?.settlementId || 'N/A',
      },
      evidence: exc.evidenceJson ? JSON.parse(exc.evidenceJson) : {},
      aiAnalysis: exc.aiAnalysis,
      recommendedAction: exc.recommendedAction,
    };
  },
};
