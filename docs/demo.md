# 3-5 Minute Hackathon Presentation Demo Script

Follow this exact story flow to present **AI Finance Controller**:

```
FRAGMENTED DATA ──► UNIFIED FINANCIAL VIEW ──► RECONCILIATION ──► EXCEPTION ──► AI INVESTIGATION ──► FORECAST
```

---

## Step 1: The Problem & Unified Financial View (0:00 - 0:45)
1. Open the application at `http://localhost:3000`.
2. **Point out top KPI cards**:
   - Total Sales Revenue: **₹12.4 Lakhs** across Razorpay, PhonePe, GPay, Paytm, Bank & POS.
   - Bank Settled Amount: **₹11.7 Lakhs** (Realized cash).
   - Pending Settlements: **₹42K**.
   - **Unreconciled Variance**: **₹19K** (Money unaccounted for across dashboards!).
3. **Highlight the Financial Health Control Index**: **82/100**.

---

## Step 2: Multi-Way Reconciliation & Spotting Exceptions (0:45 - 1:30)
1. Click **Reconciliation** on the left sidebar.
2. View the **Financial Exceptions Ledger**.
3. Point out exception **`EXC-1092`**:
   - Order: `ORD-1092`
   - Provider: `Razorpay`
   - Expected Payout: **₹12,250**
   - Actual Bank Received: **₹7,250**
   - **Shortfall**: **₹5,000**.

---

## Step 3: AI Exception Investigation (1:30 - 2:30)
1. Click **"Ask AI"** on `EXC-1092`.
2. The **AI Investigation Drawer** slides open.
3. Show the distinction between **HARD VERIFIED FACTS** and **AI REASONING**:
   - **Verified DB Evidence**: Payment ₹12,500 received via Razorpay. Fee ₹250. Expected settlement ₹12,250. Actual settlement received ₹7,250. No refund found.
   - **AI Analysis**: Unexplained ₹5,000 settlement batch shortfall.
   - **Recommended Action**: Reconcile against Razorpay Settlement Report #RZ-8819 for manual adjustments.

---

## Step 4: Conversational AI Finance Controller (2:30 - 3:30)
1. Click **AI Controller** on the sidebar.
2. Ask: *"Why are settlements lower than sales?"*
3. Show the **Executed DB Tools** badge: `[getTotalRevenue(), getTotalSettlements(), getPendingSettlements(), getRefunds(), getFees(), getUnreconciledTransactions()]`.
4. Point out the clear financial answer breaking down the ₹70,000 gap into pending payouts, gateway fees, refunds, and unresolved mismatches.
5. Ask: *"How much cash should I expect next week?"*
6. Show the 7-day cash flow realization forecast.

---

## Step 5: Provider Analytics & CSV Data Import (3:30 - 4:30)
1. Click **Connect Data Source** in the top navigation bar.
2. Select **PhonePe** or **HDFC Bank Statement**.
3. Click **Parse, Normalize & Reconcile**.
4. Show instant ingestion statistics: `1,240 Imported, 8 Duplicates, 0 Invalid`.
