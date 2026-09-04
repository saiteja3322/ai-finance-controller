# AI Finance Controller 🛡️💸

> **Unified Financial Control Center, Automated Reconciliation & AI-Powered Exception Investigation**

---

## 🎯 Problem Statement

Modern businesses receive money through multiple fragmented payment channels (Razorpaybusiness, PhonePebusiness, Google Paybusiness, Paytmbusiness, POS terminals, and direct bank transfers).

Operating across fragmented provider dashboards leads to critical financial blind spots:
- **"Where is my money?"**
- **"Why don't bank payouts match sales reports?"**
- **"Which provider is withholding funds or overcharging gateway MDR fees?"**

When businesses operate across multiple payment providers and financial sources, finance teams can face fragmented views, different data formats, and manual exception-handling workflows. AI Finance Controller creates a unified financial control layer, performs multi-way reconciliation across transactions and settlements, identifies exact discrepancy amounts, and provides AI-assisted investigation using application data.

---

## 🚀 Key Differentiators

- **One Financial Truth**: Normalizes Razorpay, PhonePe, GPay, Paytm, Bank statements, and POS reports into a single standardized domain model.
- **Multi-Way Automated Reconciliation Engine**: Cross-matches `Order -> Payment Transaction -> Gateway Fee (MDR) -> Expected Settlement -> Actual Bank Settlement -> Refunds` to identify exact mismatches.
Evidence-Grounded AI Controller: Built on a deterministic database function-calling system with 13+ backend financial tools. The controller grounds investigations in verified application data and separates database evidence from AI-generated explanations and recommendations.
- **AI Financial Exception Investigator**: Inspects payout shortfalls and fee anomalies, clearly separating **Hard Verified Database Evidence** from **AI Explanation** and **Actionable Next Steps**.
- **Predictive Cash Flow Forecasting**: 7-day trailing pattern liquidity forecast model.
- **Demo Control Center**: 1-click scenario selector built specifically for a 3-5 minute hackathon presentation flow.

---
# 🚀 LIVE DEMO

## 🌐 FRONTEND APPLICATION

### 👉 https://aifinancemanger.netlify.app/

## ⚙️ BACKEND API

### 👉 https://ai-finance-controller-xevh.onrender.com/

---

## 🏗️ Architecture

```
                 ONE BUSINESS
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Razorpay        PhonePe        Google Pay
        │          Business       Business
        │             │             │
        ├─────────────┼─────────────┤
        │             │             │
        ▼             ▼             ▼
      Paytm           POS       Bank Records
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
          DATA INGESTION & NORMALIZATION
                      │
                      ▼
           UNIFIED FINANCIAL DATA
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   RECONCILIATION  ANALYTICS   FORECAST
          │           │           │
          └───────────┼───────────┘
                      ▼
           AI FINANCE CONTROLLER
                      │
                      ▼
             FINANCE DASHBOARD

---

## 🛠️ Tech Stack

-- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript
- **Database & ORM**: Prisma ORM with SQLite for the prototype/demo environment
- **AI Engine**: Gemini API (`@google/generative-ai`) with deterministic function calling & fallback engine
- **Authentication**: JWT, bcrypt

---

## 🗄️ Database Schema Overview

- `Order`: `orderId`, `customerName`, `amount`, `status`, `orderDate`
- `Transaction`: `externalId`, `providerCode`, `amount`, `feeAmount`, `netAmount`, `status`
- `Settlement`: `settlementId`, `providerCode`, `expectedAmount`, `actualAmount`, `status`
- `ReconciliationResult`: `orderId`, `transactionId`, `settlementId`, `expectedAmount`, `actualAmount`, `difference`, `status` (`RECONCILED`, `MISMATCH`, `PENDING`, `MISSING`)
- `FinancialException`: `exceptionCode`, `severity`, `title`, `description`, `difference`, `aiAnalysis`, `evidenceJson`, `recommendedAction`
- `Forecast`: `forecastDate`, `expectedRevenue`, `expectedSettlements`, `estimatedCashPosition`, `confidenceScore`

---

## 💻 Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Database & Seed Data
```bash
npm run prisma:setup
npm run seed
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend Express API**: `http://localhost:5000`

---

## 🧪 Running Automated Tests

```bash
npm test
```
Runs unit & integration tests covering transaction normalization, exact reconciliation matching, mismatch detection, pending payout calculations, cash flow forecast math, and AI tools verification.

---

## 🔑 Environment Variables (.env)

Create a `.env` file in `/backend`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"

# Optional: Gemini API Key (Fallback engine active if omitted)
GEMINI_API_KEY=""

# Optional: Razorpay Live Test API Credentials (Synthetic fallback active if omitted)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

---

## 🎬 3-5 Minute Presentation Flow

1. **Dashboard Overview**: View Gross Sales Revenue (₹12.4L), Bank Settled (₹11.7L), Pending (₹42K), and Unreconciled Variance (₹19K).
2. **Open Reconciliation**: Inspect exception **`EXC-1092`** (Razorpay payout shortfall of ₹5,000).
3. **Ask AI to Investigate**: Click **"Ask AI"** to open the Investigation Drawer displaying hard verified database facts vs AI recommendations.
4. **Conversational AI Controller**: Ask *"Why are settlements lower than sales?"* and view real-time DB tool execution badges.
5. **Cash Forecast**: View the 7-day liquidity forecast based on trailing settlement velocity.

---

## 🔮 Future Production Integrations

- Production API webhooks for PhonePe, Google Pay for Business, and Paytm Settlement APIs.
- Direct Open Banking API integration (AA Account Aggregator framework in India).
- Automated ERP push integrations (Tally Prime, Zoho Books, SAP, QuickBooks).
