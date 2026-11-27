import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole } from "@/types";
import { isTokenExpired } from "@/lib/authUtils";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("primebank_token", action.payload.token);
        localStorage.setItem("primebank_user", JSON.stringify(action.payload.user));
        if (action.payload.refreshToken) {
          localStorage.setItem("primebank_refresh_token", action.payload.refreshToken);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("primebank_token");
        localStorage.removeItem("primebank_refresh_token");
        localStorage.removeItem("primebank_user");
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("primebank_user", JSON.stringify(state.user));
        }
      }
    },
    restoreSession: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("primebank_token");
        const refreshToken = localStorage.getItem("primebank_refresh_token");
        const userStr = localStorage.getItem("primebank_user");
        if (token && userStr) {
          if (isTokenExpired(token) && (!refreshToken || isTokenExpired(refreshToken))) {
            localStorage.removeItem("primebank_token");
            localStorage.removeItem("primebank_refresh_token");
            localStorage.removeItem("primebank_user");
            return;
          }
          try {
            const user = JSON.parse(userStr);
            state.token = token;
            state.refreshToken = refreshToken;
            state.user = user;
            state.role = user.role;
            state.isAuthenticated = true;
          } catch {
            localStorage.removeItem("primebank_token");
            localStorage.removeItem("primebank_refresh_token");
            localStorage.removeItem("primebank_user");
          }
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUserProfile, restoreSession, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;
