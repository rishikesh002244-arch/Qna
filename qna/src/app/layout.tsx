import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QnA Hub - Modern Stack Overflow for Developers",
  description: "Ask questions, share knowledge, and build your reputation on QnA Hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white`}>
        <React.Suspense fallback={<div className="h-16 border-b border-slate-800 bg-slate-950" />}>
          <Navbar />
        </React.Suspense>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QnA Hub. Built with Next.js & Appwrite.</p>
        </footer>
      </body>
    </html>
  );
}
