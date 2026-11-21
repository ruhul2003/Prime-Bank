export function isValidAccountNumber(accountNo: string): boolean {
  return /^[0-9]{10,16}$/.test(accountNo);
}

export function isValidPin(pin: string): boolean {
  return /^[0-9]{4,6}$/.test(pin);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidTransferAmount(amount: number, balance: number, minBalance = 0): boolean {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
  return balance - amount >= minBalance;
}