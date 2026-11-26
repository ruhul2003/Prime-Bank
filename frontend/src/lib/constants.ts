export const TRANSACTION_CATEGORIES = [
  'General',
  'Salary',
  'Utilities',
  'Shopping',
  'Investment',
  'Entertainment',
  'Loan Payment',
] as const;

export const DEFAULT_BANKING_LIMITS = {
  MIN_TRANSFER_AMOUNT: 1,
  MAX_DAILY_TRANSFER: 50000,
  MAX_SINGLE_TRANSFER: 10000,
  MIN_ACCOUNT_BALANCE: 50,
  SAVINGS_ANNUAL_INTEREST_RATE: 0.045,
  BUSINESS_TRANSACTION_FEE_RATE: 0.001,
} as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  SAVINGS: 'High-Yield Savings',
  CURRENT: 'Standard Checking',
  BUSINESS: 'Commercial Business',
};