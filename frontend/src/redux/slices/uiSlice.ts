import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  isSidebarOpen: boolean;
  notificationDrawerOpen: boolean;
  activeModal: string | null;
  notificationCount: number;
}

const initialState: UIState = {
  theme: "light",
  sidebarOpen: true,
  isSidebarOpen: true,
  notificationDrawerOpen: false,
  activeModal: null,
  notificationCount: 0,
};

function applyThemeToDocument(theme: "light" | "dark") {
  if (typeof window !== "undefined") {
    localStorage.setItem("primebank_ui_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      applyThemeToDocument(state.theme);
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      applyThemeToDocument(action.payload);
    },
    toggleSidebar: (state) => {
      const next = !state.sidebarOpen;
      state.sidebarOpen = next;
      state.isSidebarOpen = next;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      state.isSidebarOpen = action.payload;
    },
    toggleNotificationDrawer: (state) => {
      state.notificationDrawerOpen = !state.notificationDrawerOpen;
    },
    setNotificationDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationDrawerOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleNotificationDrawer,
  setNotificationDrawerOpen,
  openModal,
  closeModal,
  setNotificationCount,
} = uiSlice.actions;

export default uiSlice.reducer;