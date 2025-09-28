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
        <title>Cofundry - Platform de PFE et Collaboration pour Étudiants au Maroc | مشاريع التخرج</title>
        <meta name="description" content="Cofundry est la première plateforme au Maroc pour les étudiants, startups et développeurs. Trouvez des PFE, collaborez sur des projets innovants, et connectez-vous avec les meilleures universités marocaines. | منصة للطلاب والشركات الناشئة في المغرب" />
        <meta name="keywords" content="PFE Maroc, projet fin d'études, stages maroc, startup maroc, étudiants maroc, université marocaine, développeurs maroc, collaboration projets, EMI, ENSIAS, ENSA, ENCG, stage PFE, مشاريع التخرج, الطلاب المغاربة, التدريب الداخلي, الجامعات المغربية, entrepreneur maroc, innovation maroc, tech startups morocco, moroccan universities, student projects morocco, internships morocco" />
        <meta name="geo.region" content="MA" />
        <meta name="geo.placename" content="Morocco" />
        <meta property="og:locale" content="fr_MA" />
        <meta property="og:locale:alternate" content="ar_MA" />
        <meta name="author" content="Cofundry Team" />
        
        {/* Favicon configuration */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileImage" content="/web-app-manifest-192x192.png" />
        <meta name="msapplication-TileColor" content="#FFD700" />
        
        {/* OpenGraph Meta Tags */}
        <meta property="og:title" content="Cofundry - Platform de PFE et Collaboration pour Étudiants au Maroc | مشاريع التخرج" />
        <meta property="og:description" content="Première plateforme marocaine pour les PFE, stages et projets innovants. Connectez-vous avec les meilleures universités et startups du Maroc. Trouvez votre projet de fin d'études idéal. | منصة للطلاب والشركات الناشئة في المغرب" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cofundry.com" />
        <meta property="og:image" content="https://cofundry.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cofundry - PFE et Collaboration Étudiante au Maroc | مشاريع التخرج" />
        <meta name="twitter:description" content="Trouvez des PFE et stages au Maroc. Collaborez avec les meilleures universités et startups marocaines. Développez votre carrière dans l'innovation. | فرص التدريب والمشاريع في المغرب" />
        <meta name="twitter:image" content="https://cofundry.com/og-image.png" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#FFD700" />
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
