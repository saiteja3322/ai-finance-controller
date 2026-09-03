# REST API Documentation - AI Finance Controller

## Base URL
`http://localhost:5000/api`

---

## Auth Endpoints
- `POST /auth/register` — Register a new finance team account
- `POST /auth/login` — Authenticate user and return JWT bearer token

---

## Dashboard & Summary APIs
- `GET /dashboard/summary` — Returns total sales, settled bank funds, pending payouts, refunds, fees, unreconciled variance, and Financial Health Score
- `GET /dashboard/trends` — Returns daily time-series gross revenue vs bank settlements

---

## Reconciliation & Exceptions APIs
- `GET /reconciliation` — Returns full multi-way reconciliation ledger
- `GET /exceptions` — Returns list of open financial exceptions
- `GET /exceptions/:id` — Returns detailed exception record with evidence
- `POST /reconciliation/:id/review` — Mark financial exception as reviewed or resolved

---

## Transactions & Provider Analytics APIs
- `GET /transactions` — Paginated and filterable list of normalized transactions
- `GET /transactions/:id` — Returns single transaction with order and fee metadata
- `GET /providers` — Comparative provider performance, fee rates, and success rates

---

## Data Source Ingestion API
- `POST /import/:provider` — Upload CSV report for normalization (Razorpay, PhonePe, GPay, Paytm, Bank, POS)

---

## AI Finance Controller APIs
- `POST /ai/chat` — Execute conversational queries against deterministic DB tool calling engine
- `POST /ai/investigate/:exceptionId` — Run deep AI exception investigation on specific shortfall

---

## Forecast & Alert APIs
- `GET /forecast` — Returns 7-day cash flow realization & liquidity forecast
- `GET /alerts` — Returns active financial anomaly alerts feed
- `POST /demo/reset` — Reset synthetic database to baseline demo state
