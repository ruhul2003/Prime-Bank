import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";

export const metadata: Metadata = {
  title: "PrimeBank | Advanced Digital Banking & Treasury Management",
  description:
    "Institutional-grade digital banking platform with atomic fund consistency, multi-account management, automated underwriting, and role-based access control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f7fbff] dark:bg-navy-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
