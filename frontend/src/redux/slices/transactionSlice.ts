import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "@/types";

interface TransactionFilters {
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  search: string;
}

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  filters: TransactionFilters;
  receiptModalOpen: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  filters: {
    type: "",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  },
  receiptModalOpen: false,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
      if (action.payload) {
        state.receiptModalOpen = true;
      }
    },
    setReceiptModalOpen: (state, action: PayloadAction<boolean>) => {
      state.receiptModalOpen = action.payload;
      if (!action.payload) {
        state.selectedTransaction = null;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: "",
        status: "",
        startDate: "",
        endDate: "",
        search: "",
      };
    },
  },
});

export const {
  setTransactions,
  setSelectedTransaction,
  setReceiptModalOpen,
  setFilters,
  clearFilters,
} = transactionSlice.actions;

export default transactionSlice.reducer;
