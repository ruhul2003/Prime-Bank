import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Loan } from "@/types";

interface LoanState {
  loans: Loan[];
  selectedLoan: Loan | null;
  applicationModalOpen: boolean;
  repaymentModalOpen: boolean;
}

const initialState: LoanState = {
  loans: [],
  selectedLoan: null,
  applicationModalOpen: false,
  repaymentModalOpen: false,
};

export const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    setLoans: (state, action: PayloadAction<Loan[]>) => {
      state.loans = action.payload;
    },
    setSelectedLoan: (state, action: PayloadAction<Loan | null>) => {
      state.selectedLoan = action.payload;
    },
    setApplicationModalOpen: (state, action: PayloadAction<boolean>) => {
      state.applicationModalOpen = action.payload;
    },
    setRepaymentModalOpen: (state, action: PayloadAction<boolean>) => {
      state.repaymentModalOpen = action.payload;
    },
  },
});

export const {
  setLoans,
  setSelectedLoan,
  setApplicationModalOpen,
  setRepaymentModalOpen,
} = loanSlice.actions;

export default loanSlice.reducer;
