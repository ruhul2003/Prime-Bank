export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP';
  twoFactorEnabled: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

export interface TransactionFilterParams {
  searchTerm?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface MonthlySpendingSummary {
  month: string;
  deposits: number;
  withdrawals: number;
  transfers: number;
  netSavings: number;
}