import type { Metadata } from "next";
import "./globals.css";
import TestModeIndicator from "@/components/TestModeIndicator";

export const metadata: Metadata = {
  title: "BeautyBook - Professional Beauty & Wellness Booking",
  description: "Book appointments with top-rated beauty professionals in your area. Browse specialists, read reviews, and schedule online.",
  keywords: ["beauty booking", "salon appointments", "beauty services", "wellness", "spa booking"],
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
