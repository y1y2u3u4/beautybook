import type { Metadata, Viewport } from "next";
import "./globals.css";
import TestModeIndicator from "@/components/TestModeIndicator";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "BeautyBook - Book Beauty & Wellness Appointments Online",
    template: "%s | BeautyBook"
  },
  description: "Discover and book appointments with top-rated beauty professionals, salons, and spas in your area. Browse services, read verified reviews, and schedule online in seconds.",
  keywords: [
    "beauty booking",
    "salon appointments",
    "beauty services",
    "wellness booking",
    "spa appointments",
    "hair salon booking",
    "nail salon",
    "beauty professionals",
    "online booking",
    "beauty marketplace"
  ],
  authors: [{ name: "BeautyBook" }],
  creator: "BeautyBook",
  publisher: "BeautyBook",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BeautyBook",
    title: "BeautyBook - Book Beauty & Wellness Appointments Online",
    description: "Discover and book appointments with top-rated beauty professionals in your area. Browse services, read reviews, and schedule instantly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BeautyBook - Beauty & Wellness Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeautyBook - Book Beauty & Wellness Appointments Online",
    description: "Discover and book appointments with top-rated beauty professionals in your area.",
    images: ["/twitter-image.png"],
    creator: "@beautybook",
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // yandex: process.env.YANDEX_VERIFICATION,
    // bing: process.env.BING_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <TestModeIndicator />
      </body>
    </html>
  );
}
