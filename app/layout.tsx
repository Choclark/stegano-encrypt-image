import type { Metadata } from "next";
import {  Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";





const inter = Inter({ subsets: ['latin'] , weight:['100','200','300','400','500','600','700','800','900'] });
export const metadata: Metadata = {
  title: "Stegano Image",
  description: "Hide and reveal secret messages in images using advanced steganography techniques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {children}
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}
