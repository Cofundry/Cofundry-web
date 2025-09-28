"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/components/ui/LoadingProvider";

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
  return (
    <html lang="en">
      <head>
        <title>Cofundry - Where Students & Developers Build Together</title>
        <meta name="description" content="Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects. Find teammates, showcase your work, and build the future together." />
        <meta name="keywords" content="student collaboration, SaaS projects, team building, project collaboration, student projects, startup collaboration, tech projects, remote collaboration, project management, student networking, SaaS development, collaborative platform, project showcase, team formation, innovation platform" />
        <meta name="author" content="Cofundry Team" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="robots" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://cofundry.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cofundry.com" />
        <meta property="og:title" content=" Cofundry - Where Students & Developers Build Together" />
        <meta property="og:description" content="Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects. Find teammates, showcase your work, and build the future together." />
        <meta property="og:image" content="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
        <meta property="og:site_name" content=" Cofundry" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://cofundry.com" />
        <meta property="twitter:title" content=" Cofundry - Where Students & Developers Build Together" />
        <meta property="twitter:description" content="Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects." />
        <meta property="twitter:image" content="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
        <meta property="twitter:creator" content="@cofundry" />
        
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFD700" />
        <meta name="msapplication-TileColor" content="#FFD700" />
        
        {/* Prevent favicon caching */}
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon and app icons - Force refresh with cache busting */}
        <link rel="icon" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" type="image/png" />
        <link rel="shortcut icon" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Force favicon refresh */}
        <link rel="icon" href="/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <LoadingProvider>
            <Toaster position="top-right" richColors closeButton />
            {children}
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
