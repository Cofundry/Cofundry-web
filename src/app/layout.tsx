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

export const metadata: Metadata = {
  title: {
    default: "⭐ Cofundry - Where Students & Developers Build Together",
    template: "%s | ⭐ Cofundry"
  },
  description: "Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects. Find teammates, showcase your work, and build the future together.",
  keywords: [
    "student collaboration",
    "SaaS projects",
    "team building",
    "project collaboration",
    "student projects",
    "startup collaboration",
    "tech projects",
    "remote collaboration",
    "project management",
    "student networking",
    "SaaS development",
    "collaborative platform",
    "project showcase",
    "team formation",
    "innovation platform"
  ],
  authors: [{ name: "Cofundry Team" }],
  creator: "Cofundry",
  publisher: "Cofundry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cofundry.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cofundry.com',
    title: '⭐ Cofundry - Where Students & Developers Build Together',
    description: 'Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects. Find teammates, showcase your work, and build the future together.',
    siteName: '⭐ Cofundry',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: '⭐ Cofundry - Collaborative Project Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '⭐ Cofundry - Where Students & Developers Build Together',
    description: 'Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects.',
    images: ['/og-image.svg'],
    creator: '@cofundry',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FFD700" />
        <meta name="msapplication-TileColor" content="#FFD700" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <LoadingContext.Provider value={{ loading: false, setLoading: () => {} }}>
            <Toaster position="top-right" richColors closeButton />
            {children}
          </LoadingContext.Provider>
        </Providers>
      </body>
    </html>
  );
}
