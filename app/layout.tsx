import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import MotionWrapper from "@/components/motion/MotionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Enhanced SEO metadata
export const metadata: Metadata = {
  title: {
    default: "France Citoyen - Préparation Naturalisation",
    template: "%s | France Citoyen",
  },
  description: "Préparez votre entretien de naturalisation française. Quiz, fiches de révision et simulation d'entretien pour réussir votre demande de citoyenneté.",
  keywords: ["naturalisation", "france", "citoyenneté", "entretien", "quiz", "préparation", "test"],
  authors: [{ name: "France Citoyen" }],
  creator: "France Citoyen",
  manifest: "/manifest.json",

  // Open Graph for social sharing
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "France Citoyen",
    title: "France Citoyen - Préparation Naturalisation",
    description: "Préparez votre entretien de naturalisation française avec des quiz et simulations.",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "France Citoyen",
    description: "Préparez votre entretien de naturalisation française",
  },

  // PWA config
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "France Citoyen",
  },
  formatDetection: {
    telephone: false,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0055A4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow some zoom for accessibility
  userScalable: true, // Better for accessibility
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Aller au contenu principal
        </a>

        <main id="main-content" className="min-h-screen pb-24 bg-gray-50 text-gray-900" role="main">
          <MotionWrapper>
            {children}
          </MotionWrapper>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
