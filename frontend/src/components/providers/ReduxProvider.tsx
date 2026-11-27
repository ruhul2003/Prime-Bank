"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { useEffect } from "react";
import { restoreSession, logout } from "@/redux/slices/authSlice";
import { setTheme } from "@/redux/slices/uiSlice";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(restoreSession());

    // Clear legacy auto-detected theme key and restore explicit user preference (default: light)
    localStorage.removeItem("primebank_theme");
    const savedTheme = localStorage.getItem("primebank_ui_theme") as "light" | "dark" | null;
    store.dispatch(setTheme(savedTheme === "dark" ? "dark" : "light"));

    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === "primebank_token" && !event.newValue) {
        store.dispatch(logout());
      }
    };

    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#081224",
            color: "#f8fafc",
            border: "1px solid rgba(71, 176, 255, 0.25)",
            borderRadius: "14px",
            fontSize: "14px",
            boxShadow: "0 12px 30px -6px rgba(24, 143, 255, 0.25)",
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
      <MotionConfig reducedMotion="user">
        <AppInitializer>{children}</AppInitializer>
      </MotionConfig>
    </Provider>
  );
}
