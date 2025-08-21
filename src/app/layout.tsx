"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@radix-ui/react-tooltip";
import { store } from "./store/store";
import { Providers } from "./provider";
import { Toaster } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { LoadingContext } from "@/context/loadingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(false);
  return (
    <html lang="en">
      <body>
        <LoadingContext.Provider value={{ loading, setLoading }}>
          <Toaster position="top-right" richColors closeButton />
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <Spinner />
            </div>
          )}
          <Providers>{children}</Providers>
        </LoadingContext.Provider>
      </body>
    </html>
  );
}
