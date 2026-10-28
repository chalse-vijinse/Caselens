import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CaseLens – AICTE Integrated Case Monitoring & Overlap Detection",
  description: "AICTE Case Monitoring System prototype for Smart India Hackathon. Centralized grievance oversight and algorithmic overlap detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-sky-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

