import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AI Finance Controller Database Seeding...');

  // Clean existing data
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.financialException.deleteMany();
  await prisma.reconciliationResult.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  // 1. Create Business & User
  const business = await prisma.business.create({
    data: {
      name: 'Apex Retail & Commerce Ltd',
      currency: 'INR',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@apexretail.com',
      name: 'Priya Sharma (Finance Head)',
      password: hashedPassword,
      role: 'FINANCE_MANAGER',
      businessId: business.id,
    },
  });

  // 2. Providers
  const providersData = [
    { code: 'RAZORPAY', name: 'Razorpay Payment Gateway', type: 'PAYMENT_GATEWAY', feeRate: 0.02, settlementDays: 1 },
    { code: 'PHONEPE', name: 'PhonePe Business PG & QR', type: 'PAYMENT_GATEWAY', feeRate: 0.018, settlementDays: 1 },
    { code: 'GPAY', name: 'Google Pay for Business', type: 'PAYMENT_GATEWAY', feeRate: 0.015, settlementDays: 1 },
    { code: 'PAYTM', name: 'Paytm Merchant Services', type: 'PAYMENT_GATEWAY', feeRate: 0.019, settlementDays: 1 },
    { code: 'BANK', name: 'HDFC Bank Direct Account', type: 'BANK', feeRate: 0.00, settlementDays: 0 },
    { code: 'POS', name: 'Pine Labs In-Store POS', type: 'POS', feeRate: 0.012, settlementDays: 2 },
  ];

  for (const p of providersData) {
    await prisma.provider.create({ data: p });
  }

  console.log('✅ Providers created');

  // 3. Create Specific Stable Deterministic Demo Records for Hackathon Presentation Scenarios

  // DEMO SCENARIO 1 — Settlement Mismatch (TXN-10025 / DEMO-MISMATCH-001)
  const orderMismatch = await prisma.order.create({
    data: {
      orderId: 'ORD-10025',
      customerName: 'Ananya Sharma',
      customerEmail: 'ananya.sharma@example.com',
      amount: 5000,
      currency: 'INR',
      status: 'PAID',
      orderDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
  });

  const txMismatch = await prisma.transaction.create({
    data: {
      externalId: 'TXN-10025',
      providerCode: 'RAZORPAY',
      orderId: orderMismatch.id,
      amount: 5000,
      currency: 'INR',
      status: 'SUCCESS',
      transactionType: 'PAYMENT',
      transactionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      customerReference: 'REF-10025-UPI',
      feeAmount: 100,
      netAmount: 4900,
    },
  });

  await prisma.fee.create({
    data: {
      transactionId: txMismatch.id,
      providerCode: 'RAZORPAY',
      feeType: 'GATEWAY_FEE',
      expectedPercentage: 0.02,
      expectedAmount: 100,
      actualAmount: 100,
      difference: 0,
      status: 'MATCHED',
    },
  });

  const setMismatch = await prisma.settlement.create({
    data: {
      settlementId: 'SET-RZP-10025',
      providerCode: 'RAZORPAY',
      expectedAmount: 4900,
      actualAmount: 4700,
      fees: 100,
      settlementDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      status: 'MISMATCH',
    },
  });

  await prisma.reconciliationResult.create({
    data: {
      orderId: orderMismatch.id,
      transactionId: txMismatch.id,
      settlementId: setMismatch.id,
      expectedAmount: 4900,
      actualAmount: 4700,
      difference: 200,
      status: 'MISMATCH',
      reason: 'Settlement amount differs from expected amount.',
      confidence: 0.95,
    },
  });

  await prisma.financialException.create({
    data: {
      exceptionCode: 'EXC-DEMO-MISMATCH-001',
      orderId: orderMismatch.id,
      transactionId: txMismatch.id,
      settlementId: setMismatch.id,
      providerCode: 'RAZORPAY',
      severity: 'HIGH',
      title: 'Settlement Shortfall on Order ORD-10025',
      description: 'Razorpay settlement batch transferred ₹4,700 instead of expected ₹4,900 after fees.',
      expectedAmount: 4900,
      actualAmount: 4700,
      difference: 200,
      status: 'OPEN',
      aiAnalysis: 'Verified DB check: Customer paid ₹5,000 via Razorpay. Recorded gateway fee is ₹100 (2.0%). Expected settlement is ₹4,900, but Razorpay payout transferred ₹4,700 to bank. Unexplained variance of ₹200.',
      evidenceJson: JSON.stringify({
        orderId: 'ORD-10025',
        customer: 'Ananya Sharma',
        paymentReceived: 5000,
        gatewayFee: 100,
        expectedSettlement: 4900,
        actualSettlement: 4700,
        difference: 200,
        provider: 'RAZORPAY',
        transactionId: 'TXN-10025',
        settlementId: 'SET-RZP-10025',
        refundFound: 'None',
      }),
      recommendedAction: 'Review Razorpay Settlement Report #SET-RZP-10025 for manual fee adjustments.',
    },
  });


  // DEMO SCENARIO 2 — Pending Settlement (TXN-10080 / DEMO-PENDING-001)
  const orderPending = await prisma.order.create({
    data: {
      orderId: 'ORD-10080',
      customerName: 'Rohan Mehta',
      customerEmail: 'rohan.mehta@example.com',
      amount: 15680,
      currency: 'INR',
      status: 'PAID',
      orderDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
  });

  const txPending = await prisma.transaction.create({
    data: {
      externalId: 'TXN-10080',
      providerCode: 'PAYTM',
      orderId: orderPending.id,
      amount: 15680,
      currency: 'INR',
      status: 'SUCCESS',
      transactionType: 'PAYMENT',
      transactionDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      customerReference: 'REF-10080-PAYTM',
      feeAmount: 314,
      netAmount: 15366,
    },
  });

  const setPending = await prisma.settlement.create({
    data: {
      settlementId: 'SET-PT-10080',
      providerCode: 'PAYTM',
      expectedAmount: 15366,
      actualAmount: 0,
      fees: 314,
      settlementDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      status: 'PENDING',
    },
  });

  await prisma.reconciliationResult.create({
    data: {
      orderId: orderPending.id,
      transactionId: txPending.id,
      settlementId: setPending.id,
      expectedAmount: 15366,
      actualAmount: 0,
      difference: 15366,
      status: 'PENDING',
      reason: 'Settlement pending beyond 3-day SLA window (Overdue by 5 days)',
    },
  });

  await prisma.financialException.create({
    data: {
      exceptionCode: 'EXC-DEMO-PENDING-001',
      orderId: orderPending.id,
      transactionId: txPending.id,
      settlementId: setPending.id,
      providerCode: 'PAYTM',
      severity: 'MEDIUM',
      title: 'Overdue Paytm Settlement Payout SLA Breach',
      description: 'Paytm payment received 5 days ago (₹15,680) but funds have not reached bank account.',
      expectedAmount: 15366,
      actualAmount: 0,
      difference: 15366,
      status: 'OPEN',
      aiAnalysis: 'Verified DB check: Payment ₹15,680 received on Paytm 5 days ago. Expected settlement was ₹15,366. Paytm settlement status is still PENDING past the 3-day SLA.',
      evidenceJson: JSON.stringify({
        orderId: 'ORD-10080',
        customer: 'Rohan Mehta',
        paymentReceived: 15680,
        gatewayFee: 314,
        expectedSettlement: 15366,
        actualSettlement: 0,
        difference: 15366,
        provider: 'PAYTM',
        transactionId: 'TXN-10080',
        settlementId: 'SET-PT-10080',
      }),
      recommendedAction: 'Trigger automated SLA breach alert to Paytm Merchant desk.',
    },
  });


  // DEMO SCENARIO 4 — Refund Spike (TXN-10090 / DEMO-REFUND-001)
  const orderRefund = await prisma.order.create({
    data: {
      orderId: 'ORD-10090',
      customerName: 'Diya Chawla',
      customerEmail: 'diya.chawla@example.com',
      amount: 24000,
      currency: 'INR',
      status: 'REFUNDED',
      orderDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  });

  const txRefund = await prisma.transaction.create({
    data: {
      externalId: 'TXN-10090',
      providerCode: 'PHONEPE',
      orderId: orderRefund.id,
      amount: 24000,
      currency: 'INR',
      status: 'REFUNDED',
      transactionType: 'REFUND',
      transactionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      customerReference: 'REF-10090-PHONEPE',
      feeAmount: 432,
      netAmount: 23568,
    },
  });

  await prisma.refund.create({
    data: {
      refundId: 'REFUND-10090',
      transactionId: txRefund.id,
      orderId: orderRefund.id,
      providerCode: 'PHONEPE',
      amount: 12000,
      reason: 'Unusually large order cancellation refund spike',
      status: 'COMPLETED',
      processedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
  });

  console.log('✅ Deterministic Hackathon Demo Records Created');

  // 4. Generate 200+ Additional Synthetic Orders & Transactions
  const totalOrdersToGenerate = 200;
  const now = new Date();

  const customerNames = [
    'Aarav Patel', 'Ananya Sharma', 'Rohan Mehta', 'Vikram Singh', 'Neha Gupta',
    'Siddharth Nair', 'Kavya Iyer', 'Rahul Joshi', 'Pooja Kumar', 'Aditya Verma',
    'Ishaan Reddy', 'Diya Chawla', 'Karan Malhotra', 'Tanvi Kapoor', 'Amit Saxena'
  ];

  const providers = ['RAZORPAY', 'PHONEPE', 'GPAY', 'PAYTM', 'POS'];

  let totalSalesAccumulated = 5000 + 15680 + 24000;
  let totalSettledAccumulated = 4700;
  let totalPendingAccumulated = 15366;

  for (let i = 1; i <= totalOrdersToGenerate; i++) {
    const orderNum = 1000 + i;
    const orderId = `ORD-${orderNum}`;
    const customer = customerNames[i % customerNames.length];
    
    const baseAmount = Math.floor(1000 + (Math.sin(i) * 0.5 + 0.5) * 8000 + (i % 7 === 0 ? 15000 : 0));
    const daysAgo = Math.floor((totalOrdersToGenerate - i) / 7.5);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (i % 12) * 3600 * 1000);

    const providerCode = providers[i % providers.length];
    const feePercent = providerCode === 'GPAY' ? 0.015 : providerCode === 'PHONEPE' ? 0.018 : 0.02;
    let gatewayFee = Math.round(baseAmount * feePercent);
    
    let orderStatus = 'PAID';
    let txStatus = 'SUCCESS';
    let expectedSettlement = baseAmount - gatewayFee;
    let actualSettlement = expectedSettlement;
    let settlementStatus = 'SETTLED';
    let reconcilStatus = 'RECONCILED';
    let reconcilReason = 'Exact match across payment and settlement';
    let isException = false;
    let exceptionDetails: any = null;

    if (orderId === 'ORD-1003') {
      actualSettlement = expectedSettlement - 500;
      reconcilStatus = 'MISMATCH';
      reconcilReason = 'Unexpected settlement payout difference from Google Pay batch statement';
      isException = true;
      exceptionDetails = {
        code: 'EXC-1003',
        severity: 'HIGH',
        title: 'Settlement Shortfall on GPay Batch',
        description: 'Actual settlement received is ₹500 less than expected payout after fees.',
        expectedAmount: expectedSettlement,
        actualAmount: actualSettlement,
        difference: 500,
        aiAnalysis: 'Verified DB check: Payment ₹12,000 was received via GPay. Gateway fee deducted was ₹240. Expected payout ₹11,760, but GPay payout batch #GP-7721 transferred ₹11,260.',
        recommendedAction: 'File a dispute claim with GPay Merchant Support citing Payout Batch #GP-7721.',
      };
    } else if (orderId === 'ORD-1092') {
      actualSettlement = expectedSettlement - 5000;
      reconcilStatus = 'MISMATCH';
      reconcilReason = 'Razorpay partial settlement payout shortfall of ₹5,000';
      isException = true;
      exceptionDetails = {
        code: 'EXC-1092',
        severity: 'HIGH',
        title: 'Unexplained ₹5,000 Razorpay Payout Shortfall',
        description: 'Order paid in full but settlement batch transferred ₹5,000 below expected net amount.',
        expectedAmount: expectedSettlement,
        actualAmount: actualSettlement,
        difference: 5000,
        aiAnalysis: 'Verified DB check: Customer paid ₹12,500 via Razorpay. Fee expected ₹250. Expected settlement ₹12,250. Actual settlement received ₹7,250.',
        recommendedAction: 'Reconcile against Razorpay Settlement Report #RZ-8819 for manual adjustments.',
      };
    } else if (i % 15 === 0 && i < 180) {
      actualSettlement = 0;
      settlementStatus = 'PENDING';
      reconcilStatus = 'PENDING';
      reconcilReason = 'Settlement processing in progress';
    }

    const dbOrder = await prisma.order.create({
      data: {
        orderId: orderId,
        customerName: customer,
        customerEmail: `${customer.toLowerCase().replace(' ', '.')}@example.com`,
        amount: baseAmount,
        currency: 'INR',
        status: orderStatus,
        orderDate: orderDate,
      },
    });

    const txId = `TXN-${providerCode.slice(0, 2)}-${orderNum}`;
    const dbTransaction = await prisma.transaction.create({
      data: {
        externalId: txId,
        providerCode: providerCode,
        orderId: dbOrder.id,
        amount: baseAmount,
        currency: 'INR',
        status: txStatus,
        transactionType: 'PAYMENT',
        transactionDate: orderDate,
        customerReference: `REF-${100000 + i}`,
        feeAmount: gatewayFee,
        netAmount: baseAmount - gatewayFee,
      },
    });

    await prisma.fee.create({
      data: {
        transactionId: dbTransaction.id,
        providerCode: providerCode,
        feeType: 'GATEWAY_FEE',
        expectedPercentage: feePercent,
        expectedAmount: Math.round(baseAmount * feePercent),
        actualAmount: gatewayFee,
        difference: gatewayFee - Math.round(baseAmount * feePercent),
        status: 'MATCHED',
      },
    });

    const settlementId = `SET-${providerCode.slice(0, 2)}-${Math.floor(i / 5) + 500}`;
    let dbSettlement = await prisma.settlement.findUnique({ where: { settlementId } });
    if (!dbSettlement) {
      dbSettlement = await prisma.settlement.create({
        data: {
          settlementId: settlementId,
          providerCode: providerCode,
          expectedAmount: expectedSettlement,
          actualAmount: actualSettlement,
          fees: gatewayFee,
          settlementDate: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
          status: settlementStatus,
        },
      });
    }

    await prisma.reconciliationResult.create({
      data: {
        orderId: dbOrder.id,
        transactionId: dbTransaction.id,
        settlementId: dbSettlement.id,
        expectedAmount: expectedSettlement,
        actualAmount: actualSettlement,
        difference: expectedSettlement - actualSettlement,
        status: reconcilStatus,
        reason: reconcilReason,
        confidence: reconcilStatus === 'RECONCILED' ? 1.0 : 0.92,
      },
    });

    if (isException && exceptionDetails) {
      await prisma.financialException.create({
        data: {
          exceptionCode: exceptionDetails.code,
          orderId: dbOrder.id,
          transactionId: dbTransaction.id,
          settlementId: dbSettlement.id,
          providerCode: providerCode,
          severity: exceptionDetails.severity,
          title: exceptionDetails.title,
          description: exceptionDetails.description,
          expectedAmount: exceptionDetails.expectedAmount,
          actualAmount: exceptionDetails.actualAmount,
          difference: exceptionDetails.difference,
          status: 'OPEN',
          aiAnalysis: exceptionDetails.aiAnalysis,
          evidenceJson: JSON.stringify({
            orderId: orderId,
            customer: customer,
            paymentReceived: baseAmount,
            gatewayFee: gatewayFee,
            expectedSettlement: exceptionDetails.expectedAmount,
            actualSettlement: exceptionDetails.actualAmount,
            difference: exceptionDetails.difference,
            provider: providerCode,
            transactionId: txId,
            settlementId: settlementId,
          }),
          recommendedAction: exceptionDetails.recommendedAction,
        },
      });
    }

    totalSalesAccumulated += baseAmount;
    if (settlementStatus === 'SETTLED') {
      totalSettledAccumulated += actualSettlement;
    } else {
      totalPendingAccumulated += expectedSettlement;
    }
  }

  console.log(`✅ Seeded ${totalOrdersToGenerate + 3} total orders.`);

  // 5. Seed Cash Flow Forecast (7 days ahead)
  for (let d = 1; d <= 7; d++) {
    const forecastDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const dayFactor = 1 + (Math.sin(d) * 0.15);
    const expRev = Math.round(42000 * dayFactor);
    const expSet = Math.round(39500 * dayFactor);
    const expRef = Math.round(1200 * dayFactor);
    const expExp = Math.round(4500 * dayFactor);

    await prisma.forecast.create({
      data: {
        forecastDate,
        expectedRevenue: expRev,
        expectedSettlements: expSet,
        expectedRefunds: expRef,
        expectedExpenses: expExp,
        estimatedCashPosition: expSet - expRef - expExp,
        confidenceScore: 0.88,
        methodology: 'Trailing 14-day settlement & sales velocity regression',
      },
    });
  }

  console.log('✅ Cash flow forecast seeded for next 7 days.');
  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
