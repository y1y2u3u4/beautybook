import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
