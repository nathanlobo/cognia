import type { Metadata, Viewport } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';

// Highly legible geometric sans-serif specifically optimized for reading ease and cognitive clarity
const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Never disable user scaling for elderly/low-vision users
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Cognia | Dual-Task Exergaming for Cognitive Vitality & Dementia Care',
  description: 'Combining real-time seated physical tracking with dynamic personalized memory recall to stimulate neuroplasticity with 100% on-device privacy and zero fall risk.',
  keywords: [
    'dementia care',
    'cognitive exergaming',
    'mild cognitive impairment',
    'MCI rehabilitation',
    'dual-task exercise',
    'Tom Kitwood person-centered care',
    'MediaPipe pose tracking',
    'neuroplasticity',
    'senior wellness companion',
    'Smart India Hackathon 2026'
  ],
  manifest: '/manifest.json',
  applicationName: 'Cognia',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cognia',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: 'Cognia | Dual-Task Exergaming for Cognitive Vitality & Dementia Care',
    description: 'Combining real-time seated physical tracking with dynamic personalized memory recall with 100% on-device privacy and zero fall risk.',
    siteName: 'Cognia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/dementia-webapp-logo.png',
        width: 512,
        height: 512,
        alt: 'Cognia - Dual-Task Exergaming Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cognia | Dual-Task Exergaming for Cognitive Vitality & Dementia Care',
    description: 'Combining real-time seated physical tracking with dynamic personalized memory recall with 100% on-device privacy.',
    images: ['/dementia-webapp-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import AutoLogin from '@/components/AutoLogin';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col bg-surface-light text-content-primary selection:bg-accessible-blue selection:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light">
          <AutoLogin />
          {/* Accessible skip link for keyboard & screen reader accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-accessible-blue focus:text-white focus:rounded-xl focus:shadow-xl focus:border-2 focus:border-white focus:text-accessible-base"
          >
            Skip to main content
          </a>

          {/* Main accessible content container */}
          <main
            id="main-content"
            className="flex-1 w-full flex flex-col focus:outline-none"
            tabIndex={-1}
            role="main"
          >
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
