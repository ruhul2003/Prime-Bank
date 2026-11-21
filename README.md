# 🏛️ PrimeBank - Advanced Digital Banking & Treasury Management System

PrimeBank is an enterprise-grade digital banking management platform engineered using **Next.js (App Router)**, **TypeScript**, **Redux Toolkit**, **RTK Query**, **Node.js**, **Express**, and **MongoDB**. 

The system simulates a real-world institutional banking environment supporting multi-role operations across **Admin**, **Bank Staff**, and **Customer**, featuring **atomic fund transfer consistency**, **automated loan underwriting**, **rule-based AML / suspicious activity detection**, and **downloadable transaction receipts & statement exports**.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Live Links & Repository](#-live-links--repository)
3. [Demo Credentials](#-demo-credentials)
4. [User Roles & Permissions Matrix](#-user-roles--permissions-matrix)
5. [Key Application Features](#-key-application-features)
6. [Redux Toolkit Architecture](#-redux-toolkit-architecture)
7. [RTK Query Implementation & Cache Invalidation](#-rtk-query-implementation--cache-invalidation)
8. [Authentication & Authorization Strategy](#-authentication--authorization-strategy)
9. [Financial Business Logic & Atomic Consistency](#-financial-business-logic--atomic-consistency)
10. [Database Schema & Collections](#-database-schema--collections)
11. [Security Implementation](#-security-implementation)
12. [Environment Variables](#-environment-variables)
13. [Local Development Setup](#-local-development-setup)
14. [Deployment Instructions](#-deployment-instructions)

---

## 🌟 Project Overview
PrimeBank was developed to demonstrate modern fintech engineering principles where frontend presentation is matched by rigorous backend business logic, strict role-based access control (RBAC), and ACID transaction guarantees.

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts, jsPDF, Lucide React, React Hot Toast.
- **State Management**: Redux Toolkit (feature-based slices: `auth`, `account`, `transaction`, `loan`, `ui`) with RTK Query API caching.
- **Backend API**: Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs, Zod.
- **Database**: MongoDB Atlas with multi-document atomic sessions and transactions.

---

## 🔗 Live Links & Repository
- **Live Deployment**: Fully deployable to Vercel (frontend) & Render / Railway / Netlify (backend).
- **GitHub Repository**: [https://github.com/ruhul2003/Prime-Bank.git](https://github.com/ruhul2003/Prime-Bank.git)
- **Branch**: `ruhul`

---

## 🔑 Demo Credentials

| Role | Name | Email Address | Password | Transaction PIN |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Alexander Vance | `admin@primebank.com` | `AdminPassword123!` | N/A |
| **Bank Staff** | Elena Rostova | `staff@primebank.com` | `StaffPassword123!` | N/A |
| **Customer (Primary)** | Robert Sterling | `customer@primebank.com` | `CustomerPassword123!` | `1234` |
| **Customer (Recipient)** | Dr. Sarah Jenkins | `sarah.jenkins@gmail.com` | `CustomerPassword123!` | `1234` |
| **Customer (Enterprise)** | Marcus Wright | `marcus.wright@techcorp.io` | `CustomerPassword123!` | `1234` |

> 💡 **Tip:** On the Sign In page, you can click any of the **One-Click Demo Fill** buttons (`Admin`, `Bank Staff`, or `Customer`) to automatically populate verified credentials!

---

## 👥 User Roles & Permissions Matrix

```
┌─────────────────────────────────────────────────────────┬───────┬───────┬──────────┐
│ Operation / Capability                                  │ Admin │ Staff │ Customer │
├─────────────────────────────────────────────────────────┼───────┼───────┼──────────┤
│ System-wide Analytics & Chart Visualizations           │   ✅   │   ✅  │    ❌    │
│ View All Customers Directory                            │   ✅   │   ✅  │    ❌    │
│ Onboard / Register New Customer                         │   ✅   │   ✅  │    ❌    │
│ Freeze / Unfreeze Bank Accounts                         │   ✅   │   ❌  │    ❌    │
│ Configure Account Transaction Ceilings & Minimums       │   ✅   │   ❌  │    ❌    │
│ Deactivate or Block Customer Profile                    │   ✅   │   ✅  │    ❌    │
│ Review Cash Desk Deposit / Withdrawal Requests          │   ✅   │   ✅  │    ❌    │
│ Add Underwriting Notes & Forward Loan Application       │   ✅   │   ✅  │    ❌    │
│ Final Underwriting Approval & Fund Disbursement         │   ✅   │   ❌  │    ❌    │
│ Reject Loan Application with Institutional Reason       │   ✅   │   ❌  │    ❌    │
│ Audit Transactions & Flag Suspicious AML Activity       │   ✅   │   ✅  │    ❌    │
│ Multi-Account Switching (Savings / Current / Business) │   ❌   │   ❌  │    ✅    │
│ Atomic Fund Transfer with PIN Validation                │   ❌   │   ❌  │    ✅    │
│ Submit Deposit / Cash Withdrawal Requests               │   ❌   │   ❌  │    ✅    │
│ Apply for Term Loans with Live EMI Calculator           │   ❌   │   ❌  │    ✅    │
│ Pay Loan Installment via Amortization Schedule          │   ❌   │   ❌  │    ✅    │
│ Download Transaction Receipts (PDF) & Statements (CSV)  │   ✅   │   ✅  │    ✅    │
└─────────────────────────────────────────────────────────┴───────┴───────┴──────────┘
```

---

## ✨ Key Application Features

### 1. Multi-Account Management
- Customers can hold multiple distinct bank accounts concurrently:
  - **Savings Account**: Generates interest with conservative withdrawal limits.
  - **Current Account**: Designed for daily high-velocity transactions.
  - **Business Account**: Enhanced transaction limits for commercial payroll and supplier billing.
- One-click account switcher in top navigation updates active balances across all components instantly.
- Instant creation of additional accounts and PIN update capabilities.

### 2. Atomic Fund Transfer Engine
- Two-phase database commits ensure **debits from sender** and **credits to receiver** are processed atomically.
- Zero risk of funds vanishing or partial deductions if any step encounters an error.
- Strict multi-layer validation:
  1. Sender ownership verification.
  2. Account active status check (rejects frozen/closed accounts).
  3. 4-to-6 digit hashed PIN authentication.
  4. Available balance check with required minimum reserve enforcement.
  5. Maximum single transfer limit enforcement.
  6. Cumulative daily velocity limits calculation.
  7. Automated AML rule checking (amounts $\ge \$10,000$ flagged for compliance).

### 3. Automated Loan Underwriting & Amortization
- Customers can apply for **Personal (7.5%)**, **Business (6.0%)**, **Home (4.5%)**, or **Education (5.0%)** loans.
- **Dynamic EMI Calculator**: Computes exact monthly installment and total repayment using financial amortization mathematics:
  $$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
- Separation of duties: Staff reviews income and adds internal notes, but **only Admin can authorize final disbursement**.
- Upon Admin approval, funds are credited immediately to the client's account via a recorded `loan_disbursement` transaction.
- Borrowers can inspect full installment schedules and pay individual installments directly online.

### 4. Deposit & Withdrawal Request Workflow
- Cash desk simulation: Customers submit requests $\rightarrow$ Bank Staff or Admin reviews verification $\rightarrow$ upon approval, account balance is credited/debited and a transaction receipt is generated.
- Customers cannot approve their own requests.

### 5. Data Visualization (Recharts)
- **Admin Analytics**: Monthly Banking Activity (Deposit vs Withdrawal vs Transfer), Account Distribution (Donut Chart), Loan Status Statistics.
- **Customer Analytics**: Monthly Inflow vs Outflow comparison, Transaction category volume breakdown.

### 6. Bonus Features Implemented
- **Downloadable PDF Receipts**: Built with `jspdf` featuring official header branding, reference codes, timestamp, and security watermark.
- **CSV Statement Export**: Export complete filtered transaction history in standard comma-separated format.
- **In-App Notification Center**: Unread badge count, notification drawer, and real-time alerts for funds received, transfers, and loan decisions.
- **Light & Dark Mode**: Persistent theme toggle across all dashboard views.
- **Rule-Based AML Detection**: Auto-flags high-value transactions and empowers staff to flag suspicious patterns.

---

## 🏗️ Redux Toolkit Architecture

State management is structured into separate feature-based modules:

```
frontend/src/redux/
├── store.ts                    # Root store config, middleware, typed hooks
├── api/
│   └── apiSlice.ts             # RTK Query API definition with all endpoints
└── slices/
    ├── authSlice.ts            # User profile, JWT token, role, session restore
    ├── accountSlice.ts         # User bank accounts, active account selection
    ├── transactionSlice.ts     # Active transactions, filter state, receipt modal
    ├── loanSlice.ts            # Active loans, application modal, schedules
    └── uiSlice.ts              # Theme (light/dark), sidebar collapse, notifications
```

---

## ⚡ RTK Query Implementation & Cache Invalidation

All API communication is handled through RTK Query with automatic tag-based cache invalidation:

- **Tags Provided**:
  `['Auth', 'Account', 'Transaction', 'Request', 'Loan', 'Customer', 'Analytics', 'Notification']`
- **Synchronization Examples**:
  - `transferFund`: Automatically invalidates `['Account', 'Transaction', 'Analytics', 'Notification']`, triggering background refetches so balances, recent transactions, and notification badges refresh simultaneously.
  - `approveLoanAdmin`: Invalidates `['Loan', 'Account', 'Transaction', 'Analytics']`, instantly updating the customer's account balance and displaying the loan disbursement transaction without page reloads.

---

## 🔒 Authentication & Authorization Strategy

1. **Password & PIN Security**: All passwords and 4-digit transaction PINs are hashed using **bcrypt** (salt factor 10).
2. **Stateless JWT Tokens**: Signed on login/registration with 7-day expiration and verified in HTTP Bearer headers.
3. **Multi-Tier Authorization Middleware**:
   - `authenticate`: Validates JWT, verifies user exists, and checks that status is `active` (rejects `deactivated` and `blocked` accounts).
   - `authorizeRoles('admin', 'staff')`: Guarantees administrative endpoints cannot be accessed by unauthorized roles.
4. **Server-Side Enforcement**: All financial operations validate account ownership against `req.user._id` regardless of frontend inputs.

---

## 💰 Financial Business Logic & Atomic Consistency

```
[Customer Requests Transfer]
           │
           ▼
[Validate Sender Ownership & PIN]
           │
           ▼
[Check Account Status: Active?]
    ├── No  ──► [Reject: Account Frozen]
    └── Yes
           ▼
[Verify Single & Daily Limits]
    ├── Exceeded ──► [Reject: Limit Exceeded]
    └── Within Limit
           ▼
[Verify Balance: balance - (amount + fee) >= minBalance]
    ├── Insufficient ──► [Reject: Insufficient Funds]
    └── Sufficient
           ▼
[Start Mongoose Session & Transaction]
    ├── 1. Deduct (amount + fee) from Sender Account
    ├── 2. Credit amount to Receiver Account
    ├── 3. Create completed Transaction record
    └── 4. Commit Session
           ▼
[Emit Notifications & Write Audit Log]
```

---

## 🗄️ Database Schema & Collections

1. **`users`**:
   - `name`, `email` (indexed, unique), `password` (hashed), `role` (`admin` | `staff` | `customer`), `phone`, `address`, `status` (`active` | `deactivated` | `blocked`), `isVerified`.
2. **`accounts`**:
   - `accountNumber` (indexed, unique), `userId` (ref: `User`), `accountType` (`savings` | `current` | `business`), `balance`, `currency`, `status` (`active` | `frozen` | `closed`), `transactionPin` (hashed), `dailyTransferLimit`, `maxSingleTransferLimit`, `minBalance`.
3. **`transactions`**:
   - `transactionId` (indexed, unique), `senderAccountId`, `senderUserId`, `receiverAccountId`, `receiverUserId`, `type` (`deposit` | `withdrawal` | `transfer` | `loan_disbursement` | `loan_repayment`), `amount`, `fee`, `status`, `description`, `reference`, `isFlagged`, `flaggedReason`.
4. **`loans`**:
   - `loanId` (unique), `userId`, `accountId`, `loanType`, `requestedAmount`, `approvedAmount`, `interestRate`, `durationMonths`, `monthlyIncome`, `employmentStatus`, `status`, `remainingBalance`, `monthlyInstallment`, `staffNotes`, `forwardedByStaff`, `repaymentSchedule[]`.
5. **`depositwithdrawrequests`**:
   - `requestId`, `userId`, `accountId`, `type`, `amount`, `status` (`pending` | `approved` | `rejected`), `reviewNotes`, `reviewedBy`, `transactionId`.
6. **`notifications`**:
   - `userId`, `title`, `message`, `type`, `isRead`.
7. **`auditlogs`**:
   - `action`, `performedBy`, `targetType`, `targetId`, `details`, `ipAddress`.

---

## 🛡️ Security Implementation

- **Atomic Transactions**: Multi-document Mongoose transactions guarantee data consistency.
- **PIN Authorization**: Every fund transfer requires transaction PIN confirmation.
- **Account Freezing**: Admins can freeze compromised accounts; blocking a customer automatically freezes all their bank accounts.
- **AML Flagging**: Automatic triggers for transfers $\ge \$10,000$ and manual staff flag workflows.
- **Input Sanitization**: Request bodies validated with Zod and Mongoose schema constraints.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/PrimeBankDB?retryWrites=true&w=majority
JWT_SECRET=super_secret_prime_bank_jwt_token_key_secure_2025_banking_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME="PrimeBank Digital"
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18.x or v20+ recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/ruhul2003/Prime-Bank.git
cd Prime-Bank
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo Admin, Staff, and Customer accounts with transactions
npm run dev      # Starts Express API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Starts Next.js App Router frontend on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment Instructions

### Backend (Render / Railway / Vercel Serverless)
1. Set Root Directory to `backend`.
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Add environment variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`.

### Frontend (Vercel / Netlify)
1. Set Root Directory to `frontend`.
2. Framework Preset: **Next.js**.
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Add environment variable: `NEXT_PUBLIC_API_URL` pointing to your deployed backend API URL.

---

© 2025 PrimeBank Digital. Advanced Digital Banking Management System Assessment.

---

## 🛠️ Extended Architecture & Security Specifications

### Enterprise Security Safeguards
- **Atomic Balance Updates:** Implemented transactional guarantees to prevent race conditions during transfers.
- **PIN Verification Protocol:** 4-6 digit transaction PIN required for fund transfers and withdrawals.
- **Audit Logging System:** Persistent administrative event logs track authorization actions across bank staff and admins.
- **Rate-Limiting & Protection:** Built-in safeguards protect sensitive financial routes from brute-force vectors.
- **Client-Side Validation & Type Safety:** Comprehensive TypeScript definitions and Redux RTK Query synchronization.

### Clean Code Practices
- Modular folder structure separating business logic, state slices, controllers, and presentational elements.
- Reusable UI kit components (StatCard, StatusBadge, ConfirmDialog, EmptyState, LoadingSpinner).