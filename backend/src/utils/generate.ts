/** Generates a 12-digit PrimeBank account number. */
export const generateAccountNumber = (): string => {
  // 12-digit standard bank account number starting with 40 (PrimeBank BIN)
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return `40${random}`;
};

/** Generates a unique transaction reference ID. */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

/** Generates a unique loan application identifier. */
export const generateLoanId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `LN-${random}`;
};

/** Generates a unique deposit or withdrawal request identifier. */
export const generateRequestId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REQ-${random}`;
};
