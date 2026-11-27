import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  User,
  BankAccount,
  Transaction,
  Loan,
  DepositWithdrawRequest,
  NotificationItem,
  AdminAnalytics,
  CustomerAnalytics,
} from "@/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    let token = (getState() as any).auth?.token;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("primebank_token");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  if (
    result.error?.status === 401 &&
    !url.startsWith("/auth/login") &&
    !url.startsWith("/auth/register") &&
    !url.startsWith("/auth/refresh")
  ) {
    const state = api.getState() as any;
    const refreshToken =
      state.auth?.refreshToken ||
      (typeof window !== "undefined" ? localStorage.getItem("primebank_refresh_token") : null);

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      const refreshData = refreshResult.data as
        | { success?: boolean; token?: string; refreshToken?: string }
        | undefined;

      if (refreshData?.token && state.auth?.user) {
        api.dispatch({
          type: "auth/setCredentials",
          payload: {
            user: state.auth.user,
            token: refreshData.token,
            refreshToken: refreshData.refreshToken || refreshToken,
          },
        });
        result = await rawBaseQuery(args, api, extraOptions);
        return result;
      }
    }

    api.dispatch({ type: "auth/logout" });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Account",
    "Transaction",
    "Request",
    "Loan",
    "Customer",
    "Analytics",
    "Notification",
  ],
  endpoints: (builder) => ({
    // AUTH ENDPOINTS
    login: builder.mutation<
      { success: boolean; message: string; token: string; refreshToken?: string; user: User },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Account", "Transaction", "Analytics", "Notification"],
    }),
    register: builder.mutation<
      { success: boolean; message: string; token: string; refreshToken?: string; user: User; primaryAccount: BankAccount },
      any
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "Account"],
    }),
    refreshSession: builder.mutation<
      { success: boolean; message: string; token: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    logoutSession: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<{ success: boolean; user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<{ success: boolean; user: User }, Partial<User>>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string; token?: string; refreshToken?: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    // ACCOUNT ENDPOINTS
    getMyAccounts: builder.query<{ success: boolean; count: number; accounts: BankAccount[] }, void>({
      query: () => "/accounts/my-accounts",
      providesTags: ["Account"],
    }),
    getAllAccounts: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; accounts: BankAccount[] },
      { page?: number; limit?: number; search?: string; type?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/accounts/all",
        params: params || {},
      }),
      providesTags: ["Account"],
    }),
    getAccountById: builder.query<{ success: boolean; account: BankAccount }, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: ["Account"],
    }),
    createAccount: builder.mutation<
      { success: boolean; message: string; account: BankAccount },
      { accountType: string; initialDeposit?: number; transactionPin?: string; userId?: string }
    >({
      query: (body) => ({
        url: "/accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account", "Analytics"],
    }),
    updateAccountStatus: builder.mutation<
      { success: boolean; message: string; account: BankAccount },
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Account", "Analytics"],
    }),
    setAccountLimits: builder.mutation<
      { success: boolean; message: string; account: BankAccount },
      { id: string; dailyTransferLimit?: number; maxSingleTransferLimit?: number; minBalance?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}/limits`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Account"],
    }),
    updateAccountPin: builder.mutation<
      { success: boolean; message: string },
      { accountId: string; currentPin: string; newPin: string }
    >({
      query: (body) => ({
        url: "/accounts/update-pin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account"],
    }),

    // TRANSACTION ENDPOINTS
    transferFund: builder.mutation<
      { success: boolean; message: string; transaction: Transaction; senderNewBalance: number },
      { senderAccountId: string; recipientAccountNumber: string; amount: number; description?: string; transactionPin: string }
    >({
      query: (body) => ({
        url: "/transactions/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account", "Transaction", "Analytics", "Notification"],
    }),
    getMyTransactions: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; transactions: Transaction[] },
      { page?: number; limit?: number; type?: string; status?: string; accountId?: string; search?: string; startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/transactions/my-transactions",
        params: params || {},
      }),
      providesTags: ["Transaction"],
    }),
    getAllTransactions: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; transactions: Transaction[] },
      { page?: number; limit?: number; type?: string; status?: string; search?: string; isFlagged?: boolean; startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/transactions/all",
        params: params || {},
      }),
      providesTags: ["Transaction"],
    }),
    getTransactionById: builder.query<{ success: boolean; transaction: Transaction }, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: ["Transaction"],
    }),
    flagTransaction: builder.mutation<
      { success: boolean; message: string; transaction: Transaction },
      { id: string; isFlagged: boolean; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/transactions/${id}/flag`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),

    // DEPOSIT & WITHDRAWAL REQUEST ENDPOINTS
    submitRequest: builder.mutation<
      { success: boolean; message: string; request: DepositWithdrawRequest },
      { accountId: string; type: "deposit" | "withdrawal"; amount: number; description?: string }
    >({
      query: (body) => ({
        url: "/requests/request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Request", "Notification"],
    }),
    getMyRequests: builder.query<{ success: boolean; count: number; requests: DepositWithdrawRequest[] }, void>({
      query: () => "/requests/my-requests",
      providesTags: ["Request"],
    }),
    getAllRequests: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; requests: DepositWithdrawRequest[] },
      { status?: string; type?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/requests/all",
        params: params || {},
      }),
      providesTags: ["Request"],
    }),
    reviewRequest: builder.mutation<
      { success: boolean; message: string; request: DepositWithdrawRequest; accountBalance?: number },
      { id: string; action: "approve" | "reject"; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/requests/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Request", "Account", "Transaction", "Analytics", "Notification"],
    }),

    // LOAN ENDPOINTS
    applyLoan: builder.mutation<
      { success: boolean; message: string; loan: Loan },
      {
        accountId: string;
        loanType: string;
        requestedAmount: number;
        durationMonths: number;
        monthlyIncome: number;
        employmentStatus: string;
        description?: string;
      }
    >({
      query: (body) => ({
        url: "/loans/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loan", "Notification"],
    }),
    getMyLoans: builder.query<{ success: boolean; count: number; loans: Loan[] }, void>({
      query: () => "/loans/my-loans",
      providesTags: ["Loan"],
    }),
    getAllLoans: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; loans: Loan[] },
      { status?: string; loanType?: string; page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/loans/all",
        params: params || {},
      }),
      providesTags: ["Loan"],
    }),
    getLoanById: builder.query<{ success: boolean; loan: Loan }, string>({
      query: (id) => `/loans/${id}`,
      providesTags: ["Loan"],
    }),
    reviewLoanStaff: builder.mutation<
      { success: boolean; message: string; loan: Loan },
      { id: string; staffNotes?: string; forwardForApproval?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/loans/${id}/staff-review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loan"],
    }),
    approveLoanAdmin: builder.mutation<
      { success: boolean; message: string; loan: Loan; accountNewBalance: number },
      { id: string; approvedAmount?: number; interestRate?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/loans/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loan", "Account", "Transaction", "Analytics", "Notification"],
    }),
    rejectLoanAdmin: builder.mutation<
      { success: boolean; message: string; loan: Loan },
      { id: string; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/loans/${id}/reject`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loan", "Notification"],
    }),
    payLoanInstallment: builder.mutation<
      { success: boolean; message: string; loan: Loan; accountNewBalance: number },
      { id: string; installmentNumber: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/loans/${id}/pay-installment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loan", "Account", "Transaction", "Analytics"],
    }),

    // CUSTOMER MANAGEMENT ENDPOINTS
    getAllCustomers: builder.query<
      { success: boolean; total: number; page: number; totalPages: number; customers: any[] },
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/customers/all",
        params: params || {},
      }),
      providesTags: ["Customer"],
    }),
    getCustomerDetails: builder.query<
      { success: boolean; customer: User; accounts: BankAccount[]; loans: Loan[]; recentTransactions: Transaction[] },
      string
    >({
      query: (id) => `/customers/${id}`,
      providesTags: ["Customer", "Account", "Loan", "Transaction"],
    }),
    updateCustomerStatus: builder.mutation<
      { success: boolean; message: string; customer: User },
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customer", "Account"],
    }),
    onboardCustomer: builder.mutation<
      { success: boolean; message: string; customer: User; account: BankAccount },
      any
    >({
      query: (body) => ({
        url: "/customers/onboard",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer", "Account", "Analytics"],
    }),

    // ANALYTICS ENDPOINTS
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      query: () => "/analytics/admin",
      providesTags: ["Analytics"],
    }),
    getCustomerAnalytics: builder.query<CustomerAnalytics, void>({
      query: () => "/analytics/customer",
      providesTags: ["Analytics"],
    }),

    // NOTIFICATIONS ENDPOINTS
    getMyNotifications: builder.query<
      { success: boolean; unreadCount: number; notifications: NotificationItem[] },
      void
    >({
      query: () => "/notifications/my",
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshSessionMutation,
  useLogoutSessionMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMyAccountsQuery,
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountStatusMutation,
  useSetAccountLimitsMutation,
  useUpdateAccountPinMutation,
  useTransferFundMutation,
  useGetMyTransactionsQuery,
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useFlagTransactionMutation,
  useSubmitRequestMutation,
  useGetMyRequestsQuery,
  useGetAllRequestsQuery,
  useReviewRequestMutation,
  useApplyLoanMutation,
  useGetMyLoansQuery,
  useGetAllLoansQuery,
  useGetLoanByIdQuery,
  useReviewLoanStaffMutation,
  useApproveLoanAdminMutation,
  useRejectLoanAdminMutation,
  usePayLoanInstallmentMutation,
  useGetAllCustomersQuery,
  useGetCustomerDetailsQuery,
  useUpdateCustomerStatusMutation,
  useOnboardCustomerMutation,
  useGetAdminAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = apiSlice;
