"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { useEffect } from "react";
import { restoreSession } from "@/redux/slices/authSlice";
import { setTheme } from "@/redux/slices/uiSlice";
import { Toaster } from "react-hot-toast";

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(restoreSession());

    // Restore dark/light theme
    const savedTheme = localStorage.getItem("primebank_theme") as "light" | "dark" | null;
    if (savedTheme) {
      store.dispatch(setTheme(savedTheme));
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      store.dispatch(setTheme("dark"));
    }
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0f172a",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "14px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
