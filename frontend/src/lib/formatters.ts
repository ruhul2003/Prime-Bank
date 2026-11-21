export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return •••• •••• •••• ;
}

export function formatCompactDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatPercent(value: number): string {
  return ${(value * 100).toFixed(2)}%;
}