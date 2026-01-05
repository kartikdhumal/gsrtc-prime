import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MUIProvider } from "@/providers/MUIProvider";
import { Toaster } from 'react-hot-toast';
import '@/app/styles/main.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GSRTC Prime",
  description: "Gujarat State Road Transport Corporation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <MUIProvider>{children}</MUIProvider>
      </body>
    </html>
  );
}
