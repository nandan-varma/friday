import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import "./globals.css";

const nunitoSans = Nunito_Sans({variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friday",
  description: "Calendar app for busy people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
