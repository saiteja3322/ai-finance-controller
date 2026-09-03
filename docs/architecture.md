# AI Finance Controller - Architecture Specification

## Overview

The **AI Finance Controller** is an enterprise-grade financial intelligence, multi-way reconciliation, and exception investigation platform for businesses operating across fragmented payment gateways, banks, and POS terminals.

```
DATA SOURCES
    │
    ├─► Razorpay Adapter (Live Test API / Synthetic Fallback)
    ├─► PhonePe Adapter (CSV / Normalized Reports)
    ├─► Google Pay Adapter (CSV / Batch Statements)
    ├─► Paytm Adapter (Merchant CSV / Reports)
    ├─► Bank Adapter (HDFC Bank Statement Ingestion)
    └─► POS / Pine Labs Adapter (In-store Batch Exports)
    │
    ▼
DATA INGESTION & NORMALIZATION LAYER
    │
    ▼
UNIFIED FINANCIAL DATA MODEL (Prisma ORM)
    │
    ├─────────────┬─────────────┐
    ▼             ▼             ▼
RECONCILIATION   ANALYTICS    FORECAST
   ENGINE         ENGINE       ENGINE
    │             │             │
    └─────────────┼─────────────┘
                  ▼
        AI FINANCE CONTROLLER (Tool-Calling Engine)
                  │
                  ▼
        UNIFIED REACT / NEXT.JS DASHBOARD
```

## Key Architectural Layers

### 1. Data Normalization & Provider Adapter Pattern
All incoming payment gateway files, API webhooks, and bank statements pass through specialized adapters (`PaymentProviderAdapter` interface). Raw payload representations map to standard unified domain schemas:
- `Transaction`: `externalId`, `providerCode`, `orderId`, `amount`, `feeAmount`, `netAmount`, `status`, `transactionDate`.
- `Settlement`: `settlementId`, `providerCode`, `expectedAmount`, `actualAmount`, `fees`, `settlementDate`, `status`.

### 2. Multi-Way Reconciliation Engine
Reconciles transactions across 5 dimensions:
`Order -> Payment Transaction -> Gateway Fee (MDR) -> Expected Settlement -> Actual Bank Settlement`.

Mathematical model:
$$\text{Difference} = \text{ExpectedSettlement} - \text{ActualSettlement}$$
$$\text{ExpectedSettlement} = \text{GrossOrderAmount} - \text{GatewayFee}$$

- **Status Classifications**:
  - `RECONCILED`: Difference = 0, exact match verified across transaction and settlement.
  - `MISMATCH`: Difference ≠ 0, settlement payout shortfall or gateway fee overcharge detected.
  - `PENDING`: Actual payout = 0, within SLA settlement window (1–3 days).
  - `MISSING`: Payout missing past SLA threshold without dispute record.

### 3. AI Tool-Calling Engine (Zero Financial Hallucinations)
The AI Finance Controller uses a **Function Calling Architecture** with 13+ deterministic backend tools:
- `getTotalRevenue()`
- `getTotalSettlements()`
- `getPendingSettlements()`
- `getUnreconciledTransactions()`
- `getProviderPerformance()`
- `getRefunds()`
- `getFees()`
- `getCashPosition()`
- `getRevenueTrend()`
- `getSettlementTrend()`
- `getExceptions()`
- `getTransactionDetails()`
- `getForecast()`
- `investigateException()`

The LLM is strictly responsible for explaining, structuring, and recommending actions on top of verified database query results.

### 4. Predictive Cash Flow Forecasting Engine
Employs trailing 14-day settlement & sales velocity regression modeling:
$$\text{EstimatedCashPosition}_{t+d} = \text{CurrentCash} + \sum \text{ExpectedSettlements} - \sum \text{ExpectedRefunds} - \sum \text{ExpectedExpenses}$$
