export const generateAccountNumber = (): string => {
  // 12-digit standard bank account number starting with 40 (PrimeBank BIN)
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return `40${random}`;
};

export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const generateLoanId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `LN-${random}`;
};

export const generateRequestId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REQ-${random}`;
};
