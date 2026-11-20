import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BankAccount } from "@/types";

interface AccountState {
  accounts: BankAccount[];
  selectedAccount: BankAccount | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<BankAccount[]>) => {
      state.accounts = action.payload;
      // If no account selected, default to first or keep current if valid
      if (!state.selectedAccount && action.payload.length > 0) {
        state.selectedAccount = action.payload[0];
      } else if (state.selectedAccount) {
        const found = action.payload.find((a) => a._id === state.selectedAccount?._id);
        if (found) {
          state.selectedAccount = found;
        } else if (action.payload.length > 0) {
          state.selectedAccount = action.payload[0];
        }
      }
    },
    setSelectedAccount: (state, action: PayloadAction<BankAccount | string>) => {
      if (typeof action.payload === "string") {
        const found = state.accounts.find((a) => a._id === action.payload || a.accountNumber === action.payload);
        if (found) state.selectedAccount = found;
      } else {
        state.selectedAccount = action.payload;
      }
    },
    updateAccountBalance: (state, action: PayloadAction<{ accountId: string; newBalance: number }>) => {
      const acc = state.accounts.find((a) => a._id === action.payload.accountId);
      if (acc) {
        acc.balance = action.payload.newBalance;
      }
      if (state.selectedAccount && state.selectedAccount._id === action.payload.accountId) {
        state.selectedAccount.balance = action.payload.newBalance;
      }
    },
  },
});

export const { setAccounts, setSelectedAccount, updateAccountBalance } = accountSlice.actions;

export default accountSlice.reducer;
