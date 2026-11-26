export function isValidAccountNumber(accountNo: string): boolean {
  return /^[0-9]{10,16}$/.test(accountNo);
}

export function isValidPin(pin: string): boolean {
  return /^[0-9]{4,6}$/.test(pin);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPositiveAmount(amount: number): boolean {
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0;
}

export function isValidTransferAmount(amount: number, balance: number, minBalance = 0): boolean {
  if (!isPositiveAmount(amount)) return false;
  return balance - amount >= minBalance;
}